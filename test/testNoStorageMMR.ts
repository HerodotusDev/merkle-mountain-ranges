import assert from 'assert';
import { pedersen } from 'starknet/dist/utils/hash';
import { NoStorageMMR } from '..';

describe('Bag the peaks', function () {
    let mmr: NoStorageMMR;

    before(function () {
        mmr = new NoStorageMMR();
    });

    it('empty peaks', function () {
        assert.equal(mmr.bagPeaks([]), '');
    });

    it('1 peak', function () {
        const peaks = [pedersen([0, 0])];

        const res = peaks[0];

        assert.equal(mmr.bagPeaks(peaks), res);
    });

    it('2 peaks', function () {
        const peaks = [pedersen([0, 23498]), pedersen([1, 24089])];

        const res = pedersen([peaks[0], peaks[1]]);

        assert.equal(mmr.bagPeaks(peaks), res);
    });

    it('3 peaks', function () {
        const peaks = [
            pedersen([0, 23498]),
            pedersen([1, 24089]),
            pedersen([7, 9384598]),
        ];

        const res = pedersen([peaks[0], pedersen([peaks[1], peaks[2]])]);

        assert.equal(mmr.bagPeaks(peaks), res);
    });
});
