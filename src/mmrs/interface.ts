import { AppendResult, MMRProof } from '../lib/types';

export interface IMMR {
    append(value: string): Promise<AppendResult>;

    bagThePeaks(peaks?: number[]): Promise<string>;

    getProof(idx: number): Promise<MMRProof>;

    verifyProof(proof: MMRProof): Promise<void>;
}
