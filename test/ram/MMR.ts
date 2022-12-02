import assert from 'assert';
import { pedersen } from '../../src/pkg/pedersen_wasm.js';
import { MMR } from '../../src/mmrs/ram';
import { findPeaks } from '../../src/lib/helpers';

describe('Interoperability test', () => {
    let mmr: MMR;

    before(() => {
        mmr = new MMR();
    });

    it('should generate a Starknet-compatible proof', async () => {
        await mmr.append('1');
        await mmr.append('2');
        await mmr.append(
            '0x023bdb5946139d74f6274240e80691f7449978553c5f47f48a9e9b63cb1e1f7c'
        );
        const p = await mmr.getProof(4);
        await mmr.verifyProof(p);
    });
});

describe('Append elements to the tree', function () {
    let mmr: MMR;

    before(function () {
        mmr = new MMR();
    });

    it('append 1', async function () {
        const { leafIdx } = await mmr.append('1');
        assert.equal(leafIdx, '1');
        assert.equal(mmr.lastPos, '1');
    });

    it('append 2', async function () {
        const { leafIdx } = await mmr.append('2');
        assert.equal(leafIdx, '2');
        assert.equal(mmr.lastPos, '3');
    });

    it('append 4', async function () {
        const { leafIdx } = await mmr.append('4');
        assert.equal(leafIdx, '4');
        assert.equal(mmr.lastPos, '4');
    });

    it('append 5', async function () {
        const { leafIdx } = await mmr.append('5');
        assert.equal(leafIdx, '5');
        assert.equal(mmr.lastPos, '7');
    });

    it('append 8', async function () {
        const { leafIdx } = await mmr.append('8');
        assert.equal(leafIdx, '8');
        assert.equal(mmr.lastPos, '8');
    });

    it('append 9', async function () {
        const { leafIdx } = await mmr.append('9');
        assert.equal(leafIdx, '9');
        assert.equal(mmr.lastPos, '10');
    });

    it('append 11', async function () {
        const { leafIdx } = await mmr.append('11');
        assert.equal(leafIdx, '11');
        assert.equal(mmr.lastPos, '11');
    });
});

describe('Node content (hashes)', function () {
    let mmr: MMR;

    beforeEach(function () {
        mmr = new MMR();
    });

    it('1 leaf', async function () {
        const elem = '1';
        await mmr.append(elem);
        assert.equal(mmr.hashes[1], pedersen('1', elem));
        assert.equal(1, mmr.leaves);
    });

    it('2 leaves', async function () {
        const elems = 2;

        for (let i = 1; i <= elems; i++) {
            await mmr.append(i.toString());
        }

        const nodes = [];
        nodes.push(pedersen('1', '1'));
        nodes.push(pedersen('2', '2'));
        nodes.push(pedersen('3', pedersen(nodes[0], nodes[1])));

        for (let i = 1; i <= nodes.length; i++) {
            assert.equal(mmr.hashes[i], nodes[i - 1]);
        }
        assert.equal(elems, mmr.leaves);
    });

    it('3 leaves', async function () {
        const elems = 3;

        for (let i = 1; i <= elems; i++) {
            await mmr.append(i.toString());
        }

        const nodes = [];
        nodes.push(pedersen('1', '1'));
        nodes.push(pedersen('2', '2'));
        nodes.push(pedersen('3', pedersen(nodes[0], nodes[1])));
        nodes.push(pedersen('4', '3'));

        for (let i = 1; i <= nodes.length; i++) {
            assert.equal(mmr.hashes[i], nodes[i - 1]);
        }
        assert.equal(elems, mmr.leaves);
    });

    it('4 leaves', async function () {
        const elems = 4;

        for (let i = 1; i <= elems; i++) {
            await mmr.append(i.toString());
        }

        const nodes = [];
        nodes.push(pedersen('1', '1'));
        nodes.push(pedersen('2', '2'));
        nodes.push(pedersen('3', pedersen(nodes[0], nodes[1])));
        nodes.push(pedersen('4', '3'));
        nodes.push(pedersen('5', '4'));
        nodes.push(pedersen('6', pedersen(nodes[3], nodes[4])));
        nodes.push(pedersen('7', pedersen(nodes[2], nodes[5])));

        for (let i = 1; i <= nodes.length; i++) {
            assert.equal(mmr.hashes[i], nodes[i - 1]);
        }
        assert.equal(elems, mmr.leaves);
    });

    it('5 leaves', async function () {
        const elems = 5;

        for (let i = 1; i <= elems; i++) {
            await mmr.append(i.toString());
        }

        const nodes = [];
        nodes.push(pedersen('1', '1'));
        nodes.push(pedersen('2', '2'));
        nodes.push(pedersen('3', pedersen(nodes[0], nodes[1])));
        nodes.push(pedersen('4', '3'));
        nodes.push(pedersen('5', '4'));
        nodes.push(pedersen('6', pedersen(nodes[3], nodes[4])));
        nodes.push(pedersen('7', pedersen(nodes[2], nodes[5])));
        nodes.push(pedersen('8', '5'));

        for (let i = 1; i <= nodes.length; i++) {
            assert.equal(mmr.hashes[i], nodes[i - 1]);
        }
        assert.equal(elems, mmr.leaves);
    });
});
