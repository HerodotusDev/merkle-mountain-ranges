import RocksDB from 'level-rocksdb';
import { pedersen } from '../../pkg/pedersen_wasm.js';
import { v4 as uuidv4 } from 'uuid';
import {
    findPeaks,
    getHeight,
    isPeak,
    parentOffset,
    peakMapHeight,
    siblingOffset,
} from '../../lib/helpers';
import { MMRRocksDBConfig, MMRProof, AppendResult } from '../../lib/types';
import { IMMR } from '../interface';

export class MMR implements IMMR {
    db: any;
    uuid: string;
    withRootHash: boolean; // Will bag the peaks if set to true.

    constructor(
        mmrConfig: MMRRocksDBConfig = {
            withRootHash: false,
            location: './rocksdb-db',
        }
    ) {
        this.db = mmrConfig.dbInstance ?? new RocksDB(mmrConfig.location);

        this.uuid = mmrConfig.treeUuid ?? uuidv4(); // Prefix of all database keys.
        this.withRootHash = mmrConfig.withRootHash;
    }

    async init(reset = true) {
        if (!this.db.isOpen()) await this.db.open({ createIfMissing: true });

        // Initialize new MMR tree properties.
        if (reset) {
            await this.dbZeroSet('lastPos');
            await this.dbZeroSet('leaves');
            await this.dbSet('rootHash', '');
        }
    }

    async dbSet(key: string, value: any) {
        if (!this.db.isOperational())
            throw new Error('Database not operational');
        return this.db.put(`${this.uuid}.${key}`, value);
    }

    async dbGet(key: string) {
        if (!this.db.isOperational())
            throw new Error('Database not operational');
        return this.db.get(`${this.uuid}.${key}`);
    }

    async dbHSet(key: string, field: string | number, value: any) {
        if (!this.db.isOperational())
            throw new Error('Database not operational');
        await this.db.put(`${this.uuid}.${key}.${field}`, value);
        return value;
    }

    async dbHGet(key: string, field: string) {
        if (!this.db.isOperational())
            throw new Error('Database not operational');
        return this.db.get(`${this.uuid}.${key}.${field}`);
    }

    async dbIncr(key: string) {
        if (!this.db.isOperational())
            throw new Error('Database not operational');
        const curVal = await this.dbGet(key);
        const newVal = Number(curVal) + 1;
        await this.dbSet(key, newVal);
        return newVal;
    }

    async dbDel(key: string) {
        if (!this.db.isOperational())
            throw new Error('Database not operational');
        return this.db.del(`${this.uuid}.${key}`);
    }

    async dbZeroSet(key: string) {
        if (!this.db.isOperational())
            throw new Error('Database not operational');
        return this.db.put(`${this.uuid}.${key}`, 0);
    }

    async disconnectDb() {
        if (this.db.isOpen()) return this.db.close();
    }

    async append(value: string): Promise<AppendResult> {
        if (!this.db.isOperational())
            throw new Error('Database not operational');

        // Increment position
        let lastPos = await this.dbIncr('lastPos');

        const leafIdx = lastPos.toString();
        const hash = pedersen(leafIdx, value);
        await this.dbHSet('hashes', leafIdx, hash);
        await this.dbHSet('values', leafIdx, value);

        let height = 0;

        // If the height of the next node is higher then the height of current node
        // It means that the next node is a parent of current, thus merging happens
        while (getHeight(lastPos + 1) > height) {
            ++lastPos;

            const left = lastPos - parentOffset(height);
            const right = left + siblingOffset(height);

            const [leftHash, rightHash] = await this.db.getMany([
                `${this.uuid}.hashes.${left.toString()}`,
                `${this.uuid}.hashes.${right.toString()}`,
            ]);

            const parentHash = pedersen(
                lastPos.toString(),
                pedersen(leftHash, rightHash)
            );
            await this.dbHSet('hashes', lastPos.toString(), parentHash);

            height++;
        }

        // Update latest value.
        await this.dbSet('lastPos', lastPos);

        // Compute the new root hash
        if (this.withRootHash)
            await this.dbSet('rootHash', await this.bagThePeaks());

        const leaves = await this.dbIncr('leaves');
        // Returns the new total number of leaves.
        return {
            leavesCount: leaves,
            leafIdx,
        };
    }

    async bagThePeaks(peaks?: number[]): Promise<string> {
        if (!this.db.isOperational())
            throw new Error('Database not operational');
        const lastPos = Number(await this.dbGet('lastPos'));
        if (!peaks) {
            peaks = findPeaks(lastPos);
        }

        let bags = await this.dbHGet(
            'hashes',
            peaks[peaks.length - 1].toString()
        );

        for (let idx = peaks.length - 1; idx >= 0; --idx) {
            const peak = await this.dbHGet('hashes', peaks[idx].toString());
            bags = pedersen(bags, peak);
        }
        const treeSize = lastPos;
        const rootHash = pedersen(treeSize.toString(), bags);
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
        if (!this.db.isOperational())
            throw new Error('Database not operational');

        if (idx <= 0) throw new Error('Index starts at one');
        const lastPos = Number(await this.dbGet('lastPos'));
        if (idx > lastPos) throw new Error('Index out of range');
        if (!this.isLeaf(idx)) throw new Error('Expected a leaf node');

        const index = idx;
        const value = await this.dbHGet('values', idx.toString());
        if (!value) throw new Error(`Expected value for index ${idx}`);

        const peaks = findPeaks(lastPos);
        const peaksHashesPromises = peaks.map(
            // @ts-ignore
            (p): Promise<string> => this.dbHGet('hashes', p.toString())
        );
        const peaksHashes = await Promise.all(peaksHashesPromises);
        let height;
        const siblingHashes = []; // Proof
        while (!isPeak(idx, peaks)) {
            height = getHeight(idx);
            const hash = await this.dbHGet('hashes', idx.toString());
            if (!hash) throw new Error(`Expected a hash value for node ${idx}`);

            const isLeft = this.isLeftSibling(idx);
            const siblingOfs = siblingOffset(height);
            const siblingIdx = isLeft ? idx + siblingOfs : idx - siblingOfs;
            const siblingHash = await this.dbHGet(
                'hashes',
                siblingIdx.toString()
            );
            if (!siblingHash)
                throw new Error(`Expected a hash value for sibling ${idx}`);
            siblingHashes.push(siblingHash);

            const parentOfs = parentOffset(height);
            const parentIdx = isLeft ? idx + parentOfs : siblingIdx + parentOfs;
            const parentHash = await this.dbHGet(
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
        if (!this.db.isOperational())
            throw new Error('Database not operational');
        let hash = pedersen(proof.index.toString(), proof.value);
        const storedHash = await this.dbHGet('hashes', proof.index.toString());
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
            const storedSiblingHash = await this.dbHGet(
                'hashes',
                siblingIdx.toString()
            );
            if (siblingHash !== storedSiblingHash) {
                throw new Error('Sibling mismatch');
            }
            const parentOfs = parentOffset(height);
            const parentIdx = isLeft ? idx + parentOfs : siblingIdx + parentOfs;
            let parentHash;
            if (isLeft) {
                parentHash = pedersen(
                    parentIdx.toString(),
                    pedersen(hash || '', siblingHash || '')
                );
            } else {
                parentHash = pedersen(
                    parentIdx.toString(),
                    pedersen(siblingHash || '', hash || '')
                );
            }
            const storedParentHash = await this.dbHGet(
                'hashes',
                parentIdx.toString()
            );
            if (parentHash !== storedParentHash) {
                console.log(proof);
                console.table({ parentHash, storedParentHash, parentIdx });
                throw new Error('Parent mismatch');
            }
            idx = parentIdx; // Jump to parent
            hash = parentHash;
            siblingN += 1;
        }
        if (this.withRootHash) {
            const storedRootHash = await this.dbGet('rootHash');
            if ((await this.bagThePeaks(proof.peaks)) !== storedRootHash) {
                throw new Error('Top hash is not equal to this MMR root hash');
            }
        }
    }
}
