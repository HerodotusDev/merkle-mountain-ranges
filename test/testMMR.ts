import assert from 'assert';
import { pedersen } from 'starknet/dist/utils/hash';
import { MMR } from '..';

describe('Append', function () {
    let mmr: MMR;

    before(function () {
        mmr = new MMR();
    });

    it('append 1', function () {
        assert.equal(mmr.append(1), 1);
        assert.equal(mmr.lastPos, 1);
    });

    it('append 2', function () {
        assert.equal(mmr.append(2), 2);
        assert.equal(mmr.lastPos, 3);
    });

    it('append 4', function () {
        assert.equal(mmr.append(4), 4);
        assert.equal(mmr.lastPos, 4);
    });

    it('append 5', function () {
        assert.equal(mmr.append(5), 5);
        assert.equal(mmr.lastPos, 7);
    });

    it('append 8', function () {
        assert.equal(mmr.append(8), 8);
        assert.equal(mmr.lastPos, 8);
    });

    it('append 9', function () {
        assert.equal(mmr.append(9), 9);
        assert.equal(mmr.lastPos, 10);
    });

    it('append 11', function () {
        assert.equal(mmr.append(11), 11);
        assert.equal(mmr.lastPos, 11);
    });
});

describe('Node content (hashes)', function () {
    let mmr: MMR;

    beforeEach(function () {
        mmr = new MMR();
    });

    it('1 leaf', function () {
        const elem = 1;
        mmr.append(elem);
        assert.equal(mmr.hashes[1], pedersen([1, elem]));
    });

    it('2 leaves', function () {
        const elems = 2;

        for (let i = 1; i <= elems; i++) {
            mmr.append(i);
        }

        const nodes = [];
        nodes.push(pedersen([1, 1]));
        nodes.push(pedersen([2, 2]));
        nodes.push(pedersen([3, pedersen([nodes[0], nodes[1]])]));

        for (let i = 1; i <= nodes.length; i++) {
            assert.equal(mmr.hashes[i], nodes[i - 1]);
        }
    });

    it('3 leaves', function () {
        const elems = 3;

        for (let i = 1; i <= elems; i++) {
            mmr.append(i);
        }

        const nodes = [];
        nodes.push(pedersen([1, 1]));
        nodes.push(pedersen([2, 2]));
        nodes.push(pedersen([3, pedersen([nodes[0], nodes[1]])]));
        nodes.push(pedersen([4, 3]));

        for (let i = 0; i < nodes.length; i++) {
            assert.equal(mmr.hashes[i], nodes[i - 1]);
        }
    });

    it('4 leaves', function () {
        const elems = 4;

        for (let i = 1; i <= elems; i++) {
            mmr.append(i);
        }

        const nodes = [];
        nodes.push(pedersen([1, 1]));
        nodes.push(pedersen([2, 2]));
        nodes.push(pedersen([3, pedersen([nodes[0], nodes[1]])]));
        nodes.push(pedersen([4, 3]));
        nodes.push(pedersen([5, 4]));
        nodes.push(pedersen([6, pedersen([nodes[3], nodes[4]])]));
        nodes.push(pedersen([7, pedersen([nodes[2], nodes[5]])]));

        for (let i = 0; i < nodes.length; i++) {
            assert.equal(mmr.hashes[i], nodes[i - 1]);
        }
    });

    it('5 leaves', function () {
        const elems = 5;

        for (let i = 1; i <= elems; i++) {
            mmr.append(i);
        }

        const nodes = [];
        nodes.push(pedersen([1, 1]));
        nodes.push(pedersen([2, 2]));
        nodes.push(pedersen([3, pedersen([nodes[0], nodes[1]])]));
        nodes.push(pedersen([4, 3]));
        nodes.push(pedersen([5, 4]));
        nodes.push(pedersen([6, pedersen([nodes[3], nodes[4]])]));
        nodes.push(pedersen([7, pedersen([nodes[2], nodes[5]])]));
        nodes.push(pedersen([8, 5]));

        for (let i = 0; i < nodes.length; i++) {
            assert.equal(mmr.hashes[i], nodes[i - 1]);
        }
    });
});
