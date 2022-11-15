import { RedisClientType, RedisClientOptions } from 'redis';

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

export type RedisMMRConfig = {
    withRootHash: boolean;
    redisClientOptions?: RedisClientOptions;
    treeUuid?: string;
    dbInstance?: RedisClientType;
};

export type MMRRocksDBConfig = {
    withRootHash: boolean;
    location: string; // Database directory location (on disk).
    dbInstance?: any; // RocksDB instance;
    treeUuid?: string; // Will restore an existing tree from db.
};
