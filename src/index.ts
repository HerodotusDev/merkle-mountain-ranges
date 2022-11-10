import { createClient, RedisClientType } from 'redis';
import { pedersen } from 'starknet/dist/utils/hash';
import { v4 as uuidv4 } from 'uuid';
import {
    findPeaks,
    getHeight,
    isPeak,
    parentOffset,
    peakMapHeight,
    siblingOffset,
} from './lib/helpers';
import { MMRConfig, MMRProof } from './lib/types';

export class RedisMMR {
    client: RedisClientType;
    uuid: string;
    withRootHash: boolean; // Will bag the peaks if set to true.

    constructor(mmrConfig: MMRConfig = { withRootHash: false }) {
        // @ts-ignore
        this.client = createClient(mmrConfig.redisClientOptions ?? undefined);

        this.uuid = uuidv4(); // Unique MMR id, prefixing all related Redis keys.
        this.withRootHash = mmrConfig.withRootHash;
    }

    async init() {
        await this.client.connect();

        // Initialize new MMR tree properties.
        await this.redisZeroSet('lastPos');
        await this.redisZeroSet('leaves');
        await this.redisSet('rootHash', '');
        await this.redisDel('hashes'); // Remove collision (shouldn't happen, extra check)
        await this.redisDel('values'); // Remove collision (shouldn't happen, extra check)
    }

    async redisSet(key: string, value: any) {
        if (!this.client.isReady) throw new Error('Redis client not ready');
        return this.client.set(`${this.uuid}.${key}`, value);
    }

    async redisGet(key: string) {
        if (!this.client.isReady) throw new Error('Redis client not ready');
        return this.client.get(`${this.uuid}.${key}`);
    }

    async redisHSet(key: string, field: string | number, value: any) {
        if (!this.client.isReady) throw new Error('Redis client not ready');
        await this.client.hSet(`${this.uuid}.${key}`, field, value);
        return value;
    }

    async redisHGet(key: string, field: string) {
        if (!this.client.isReady) throw new Error('Redis client not ready');
        return this.client.hGet(`${this.uuid}.${key}`, field);
    }

    async redisIncr(key: string) {
        if (!this.client.isReady) throw new Error('Redis client not ready');
        return this.client.incr(`${this.uuid}.${key}`);
    }

    async redisDel(key: string) {
        if (!this.client.isReady) throw new Error('Redis client not ready');
        return this.client.del(`${this.uuid}.${key}`);
    }

    async redisZeroSet(key: string) {
        if (!this.client.isReady) throw new Error('Redis client not ready');
        return this.client.set(`${this.uuid}.${key}`, 0);
    }

    disconnectRedisClient() {
        if (this.client.isOpen) return this.client.disconnect();
    }

    async append(value: string): Promise<number> {
        if (!this.client.isReady) throw new Error('Redis client not ready');

        // Increment position
        let lastPos = await this.redisIncr('lastPos');

        const hash = pedersen([lastPos, value]);
        await this.redisHSet('hashes', lastPos.toString(), hash);
        await this.redisHSet('values', lastPos.toString(), value);

        let height = 0;

        // If the height of the next node is higher then the height of current node
        // It means that the next node is a parent of current, thus merging happens
        while (getHeight(lastPos + 1) > height) {
            ++lastPos;

            const left = lastPos - parentOffset(height);
            const right = left + siblingOffset(height);

            const leftHash = await this.redisHGet('hashes', left.toString());
            const rightHash = await this.redisHGet('hashes', right.toString());

            const parentHash = pedersen([
                lastPos,
                pedersen([leftHash, rightHash]),
            ]);
            await this.redisHSet('hashes', lastPos.toString(), parentHash);

            height++;
        }
        // Update lastest value.
        await this.redisSet('lastPos', lastPos);

        // Compute the new root hash
        if (this.withRootHash)
            await this.redisSet('rootHash', await this.bagThePeaks());

        const leaves = await this.redisIncr('leaves');
        // Returns the new total number of leaves.
        return leaves;
    }

    async bagThePeaks(peaks?: number[]): Promise<string> {
        if (!this.client.isReady) throw new Error('Redis client not ready');
        const lastPos = Number(await this.redisGet('lastPos'));
        if (!peaks) {
            peaks = findPeaks(lastPos);
        }

        let bags = await this.redisHGet(
            'hashes',
            peaks[peaks.length - 1].toString()
        );

        for (let idx = peaks.length - 1; idx >= 0; --idx) {
            const peak = await this.redisHGet('hashes', peaks[idx].toString());
            bags = pedersen([bags, peak]);
        }
        const treeSize = lastPos;
        const rootHash = pedersen([treeSize, bags]);
        return rootHash;
    }

    isLeaf(idx: number) {
        return getHeight(idx) === 0;
    }

    isLeftSibling(idx: number): boolean {
        const [peak_map, height] = peakMapHeight(idx - 1);
        const peak = 1 << height;
        return (peak_map & peak) === 0;
    }

    async getProof(idx: number): Promise<MMRProof> {
        if (!this.client.isReady) throw new Error('Redis client not ready');

        if (idx <= 0) throw new Error('Index starts at one');
        const lastPos = Number(await this.redisGet('lastPos'));
        if (idx > lastPos) throw new Error('Index out of range');
        if (!this.isLeaf(idx)) throw new Error('Expected a leaf node');

        const index = idx;
        const value = await this.redisHGet('values', idx.toString());
        if (!value) throw new Error(`Expected value for index ${idx}`);

        const peaks = findPeaks(lastPos);
        const peaksHashesPromises = peaks.map(
            // @ts-ignore
            (p): Promise<string> => this.redisHGet('hashes', p.toString())
        );
        const peaksHashes = await Promise.all(peaksHashesPromises);
        let height;
        const siblingHashes = []; // Proof
        while (!isPeak(idx, peaks)) {
            height = getHeight(idx);
            const hash = await this.redisHGet('hashes', idx.toString());
            if (!hash) throw new Error(`Expected a hash value for node ${idx}`);

            const isLeft = this.isLeftSibling(idx);
            const siblingOfs = siblingOffset(height);
            const siblingIdx = isLeft ? idx + siblingOfs : idx - siblingOfs;
            const siblingHash = await this.redisHGet(
                'hashes',
                siblingIdx.toString()
            );
            if (!siblingHash)
                throw new Error(`Expected a hash value for sibling ${idx}`);
            siblingHashes.push(siblingHash);

            const parentOfs = parentOffset(height);
            const parentIdx = isLeft ? idx + parentOfs : siblingIdx + parentOfs;
            const parentHash = await this.redisHGet(
                'hashes',
                parentIdx.toString()
            );
            if (!parentHash)
                throw new Error(`Expected a hash value for parent ${idx}`);

            idx = parentIdx; // Jump to parent
        }
        return {
            index,
            value,
            peaks,
            peaksHashes,
            siblingHashes,
            lastVisitedNodeIdx: idx,
        };
    }

    async verifyProof(proof: MMRProof) {
        if (!this.client.isReady) throw new Error('Redis client not ready');
        let hash = pedersen([proof.index, proof.value]);
        const storedHash = await this.redisHGet(
            'hashes',
            proof.index.toString()
        );
        if (hash !== storedHash) {
            throw new Error('Hash mismatch');
        }
        let height;
        let siblingN = 0;
        let idx = proof.index;
        while (!isPeak(idx, proof.peaks)) {
            height = getHeight(idx);
            const isLeft = this.isLeftSibling(idx);
            const siblingHash = proof.siblingHashes[siblingN];
            if (!siblingHash) throw new Error('Expected sibling hash');
            const siblingOfs = siblingOffset(height);
            const siblingIdx = isLeft ? idx + siblingOfs : idx - siblingOfs;
            const storedSiblingHash = await this.redisHGet(
                'hashes',
                siblingIdx.toString()
            );
            if (siblingHash !== storedSiblingHash) {
                throw new Error('Sibling mismatch');
            }
            const parentOfs = parentOffset(height);
            const parentIdx = isLeft ? idx + parentOfs : siblingIdx + parentOfs;
            const parentHash = pedersen([
                parentIdx,
                pedersen(isLeft ? [hash, siblingHash] : [siblingHash, hash]),
            ]);
            const storedParentHash = await this.redisHGet(
                'hashes',
                parentIdx.toString()
            );
            if (parentHash !== storedParentHash) {
                throw new Error('Parent mismatch');
            }
            idx = parentIdx; // Jump to parent
            hash = parentHash;
            siblingN += 1;
        }
        if (this.withRootHash) {
            const storedRootHash = await this.redisGet('rootHash');
            if ((await this.bagThePeaks(proof.peaks)) !== storedRootHash) {
                throw new Error('Top hash is not equal to this MMR root hash');
            }
        }
    }
}
