export type MMRProof = {
    // Proving slot index
    index: number;
    // Proving slot value
    value: string;
    // Peaks indexes
    peaks: number[];
    // Peak hashes
    peaksHashes: string[];
    // Path (sibling hashes)
    siblingHashes: string[];
    // Debug only
    lastVisitedNodeIdx: number;
};

export interface Hashes {
    [hash: number]: string;
}

export interface Leaves {
    [leaf: number]: string;
}
