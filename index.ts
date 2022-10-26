import { pedersen } from "starknet/dist/utils/hash";
import { getHeight, siblingOffest, parentOffset } from "./helpers";

export class MMR {
  hashes: any;
  lastPos: number;

  constructor() {
    this.hashes = {};
    this.lastPos = -1;
  }

  append(elem: number) {
    // Increment position
    this.lastPos++;

    // Hash and store elem (don't do onchain!)
    let hash = pedersen([this.lastPos, elem]);
    this.hashes[this.lastPos] = hash;

    let height = 1;
    let pos = this.lastPos;

    // If the height of the next node is higher then the height of current node
    // It means that the next node is a parent of current, thus merging happens
    while (getHeight(this.lastPos + 1) > height) {
      this.lastPos++;

      let left = this.lastPos - parentOffset(height-1);
      let right = left + siblingOffest(height-1);

      let parentHash = pedersen([this.lastPos, pedersen([this.hashes[left], this.hashes[right]])]);
      this.hashes[this.lastPos] = parentHash;

      height++
    }

    return pos
  }
}

