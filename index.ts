import {
    findPeaks,
    getHeight,
    isPeak,
    parentOffset,
    peakMapHeight,
    siblingOffset,
} from './helpers';

import { pedersen } from 'starknet/dist/utils/hash';
import { Hashes, Leaves, MMRProof } from './test/types';

export class MMR {
    hashes: Hashes;
    values: Leaves;
    lastPos: number;

    constructor() {
        this.hashes = {} as Hashes;
        this.values = {} as Leaves;
        this.lastPos = 0;
    }

    append(value: string) {
        // Increment position
        this.lastPos++;

        const hash = pedersen([this.lastPos, value]);
        this.hashes[this.lastPos] = hash;
        this.values[this.lastPos] = value;

        let height = 0;
        let pos = this.lastPos;

        // If the height of the next node is higher then the height of current node
        // It means that the next node is a parent of current, thus merging happens
        while (getHeight(this.lastPos + 1) > height) {
            this.lastPos++;

            let left = this.lastPos - parentOffset(height);
            let right = left + siblingOffset(height);

            let parentHash = pedersen([
                this.lastPos,
                pedersen([this.hashes[left], this.hashes[right]]),
            ]);
            this.hashes[this.lastPos] = parentHash;

            height++;
        }

        return pos;
    }

    isLeaf(idx: number) {
        return getHeight(idx) == 0;
    }

    isLeftSibling(idx: number): boolean {
        const [peak_map, height] = peakMapHeight(idx - 1);
        const peak = 1 << height;
        return (peak_map & peak) == 0;
    }

    getProof(idx: number): MMRProof {
        if (idx <= 0) throw new Error('Index starts at one');
        if (idx > this.lastPos) throw new Error('Index out of range');
        if (!this.isLeaf(idx)) throw new Error('Expected a leaf node');

        const index = idx;
        const value = this.values[idx];
        if (!value) throw new Error(`Expected value for index ${idx}`);

        const peaks = findPeaks(this.lastPos);
        const peaksHashes = peaks.map((p) => this.hashes[p]);
        let height;
        const siblingHashes = []; // Proof
        while (!isPeak(idx, peaks)) {
            height = getHeight(idx);
            const hash = this.hashes[idx];
            if (!hash) throw new Error(`Expected a hash value for node ${idx}`);

            const isLeft = this.isLeftSibling(idx);
            const siblingOfs = siblingOffset(height);
            const siblingIdx = isLeft ? idx + siblingOfs : idx - siblingOfs;
            const siblingHash = this.hashes[siblingIdx];
            if (!siblingHash)
                throw new Error(`Expected a hash value for sibling ${idx}`);
            siblingHashes.push(siblingHash);

            const parentOfs = parentOffset(height);
            const parentIdx = isLeft ? idx + parentOfs : siblingIdx + parentOfs;
            const parentHash = this.hashes[parentIdx];
            if (!parentHash)
                throw new Error(`Expected a hash value for parent ${idx}`);

            if (
                pedersen([
                    parentIdx,
                    pedersen(
                        isLeft ? [hash, siblingHash] : [siblingHash, hash]
                    ),
                ]) !== parentHash
            ) {
                throw new Error('Parent hash mismatch');
            }

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
}

export class NoStorageMMR {
    lastPos: number;
    root: string;

    constructor() {
        this.lastPos = 0;
        this.root = '';
    }

    bagPeaks(peaks: string[]) {
        if (peaks.length == 0) {
            return '';
        }

        let res = peaks[peaks.length - 1];

        for (let i = peaks.length - 2; i >= 0; i--) {
            res = pedersen([peaks[i], res]);
        }

        return res;
    }

    append(elem: number, peaks: string[]) {
        // Increment position
        this.lastPos++;

        // Check peaks
        if (this.bagPeaks(peaks) != this.root) {
            return -1;
        }

        let hash = pedersen([this.lastPos, elem]);
        peaks.push(hash);

        let height = 0;

        // If the height of the next node is higher then the height of current node
        // It means that the next node is a parent of current, thus merging happens
        while (getHeight(this.lastPos + 1) > height) {
            this.lastPos++;

            const rightHash = peaks.pop();
            const leftHash = peaks.pop();

            let parentHash = pedersen([
                this.lastPos,
                pedersen([leftHash, rightHash]),
            ]);
            peaks.push(parentHash);

            height++;
        }

        this.root = this.bagPeaks(peaks);
    }
}
