import assert from 'assert';
import { findPeaks, getHeight } from '../src/lib/helpers';
import { heights } from './samples/heights.json';
import { peaks } from './samples/peaks.json';

describe('getHeight', () => {
    it('should return correct heights', () => {
        for (let idx = 1; idx < heights.length; ++idx) {
            assert.strictEqual(getHeight(idx), heights[idx - 1]);
        }
    });
});

describe('findPeaks', () => {
    it('should return correct peaks', () => {
        for (let idx = 0; idx < peaks.length; ++idx) {
            assert.deepStrictEqual(findPeaks(idx), peaks[idx]);
        }
    });
});
