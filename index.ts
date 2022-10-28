import { getHeight, parentOffset, siblingOffset } from './helpers';

import { pedersen } from 'starknet/dist/utils/hash';

export class MMR {
    hashes: any;
    lastPos: number;

    constructor() {
        this.hashes = {};
        this.lastPos = 0;
    }

    append(elem: number) {
        // Increment position
        this.lastPos++;

        let hash = pedersen([this.lastPos, elem]);
        this.hashes[this.lastPos] = hash;

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
