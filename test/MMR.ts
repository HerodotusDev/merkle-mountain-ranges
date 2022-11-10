import assert from 'assert';
import { pedersen } from 'starknet/dist/utils/hash';
import { RedisMMR as MMR } from '../src';

describe('Different trees sizes', () => {
    let mmr: MMR;

    beforeEach(async () => {
        mmr = new MMR();
        await mmr.init();
    });

    it('should append 7 leaves, generate and verify all Merkle proofs', async () => {
        const leaves = 11;
        for (let i = 1; i <= leaves; i++) {
            await mmr.append(i.toString());
        }
        assert.equal(leaves, await mmr.redisGet('leaves'));

        for (let i = 1; i <= leaves; i++) {
            if (mmr.isLeaf(i)) {
                let proof = await mmr.getProof(i);
                await mmr.verifyProof(proof);
            }
        }
    });

    it('should append 50 leaves, generate and verify all Merkle proofs', async () => {
        const leaves = 50;
        for (let i = 1; i <= leaves; i++) {
            await mmr.append(i.toString());
        }
        assert.equal(leaves, await mmr.redisGet('leaves'));

        for (let i = 1; i <= leaves; i++) {
            if (mmr.isLeaf(i)) {
                let proof = await mmr.getProof(i);
                await mmr.verifyProof(proof);
            }
        }
    });

    afterEach(async () => mmr.disconnectRedisClient());
});

describe('Merkle proof generation time', () => {
    let mmr: MMR;
    const leaves = 100;

    before(async () => {
        mmr = new MMR();
        await mmr.init();

        for (let i = 1; i <= leaves; i++) {
            await mmr.append(i.toString());
        }
    });

    it('should quickly generate an inclusion proof', async () => {
        let randLeaf = Math.floor(Math.random() * leaves - 1) + 1;
        while (!mmr.isLeaf(randLeaf))
            randLeaf = Math.floor(Math.random() * leaves - 1) + 1;

        const before = Date.now();
        await mmr.getProof(randLeaf);
        const after = Date.now();
        console.log('Proof generation time', after - before, 'ms');
    });
    after(async () => mmr.disconnectRedisClient());
});

describe('Append elements to the tree', function () {
    let mmr: MMR;

    before(async () => {
        mmr = new MMR();
        await mmr.init();
    });

    it('append 1', async () => {
        let lastPos = Number(await mmr.redisGet('lastPos'));
        assert.equal(lastPos, 0);

        await mmr.append('1');

        lastPos = Number(await mmr.redisGet('lastPos'));
        assert.equal(lastPos, 1);
    });

    it('append 2', async () => {
        await mmr.append('2');
        const lastPos = Number(await mmr.redisGet('lastPos'));
        assert.equal(lastPos, 3);
    });

    it('append 4', async () => {
        await mmr.append('4');
        const lastPos = Number(await mmr.redisGet('lastPos'));
        assert.equal(lastPos, 4);
    });

    it('append 5', async () => {
        await mmr.append('5');
        const lastPos = Number(await mmr.redisGet('lastPos'));
        assert.equal(lastPos, 7);
    });

    it('append 8', async () => {
        await mmr.append('8');
        const lastPos = Number(await mmr.redisGet('lastPos'));
        assert.equal(lastPos, 8);
    });

    it('append 9', async () => {
        await mmr.append('9');
        const lastPos = Number(await mmr.redisGet('lastPos'));
        assert.equal(lastPos, 10);
    });

    it('append 11', async () => {
        await mmr.append('11');
        const lastPos = Number(await mmr.redisGet('lastPos'));
        assert.equal(lastPos, 11);
    });

    after(async () => mmr.disconnectRedisClient());
});

describe('Node content (hashes)', function () {
    let mmr: MMR;

    beforeEach(async () => {
        mmr = new MMR();
        await mmr.init();
    });

    it('1 leaf', async () => {
        const elem = 1;
        await mmr.append(elem.toString());
        assert.equal(await mmr.redisHGet('hashes', '1'), pedersen([1, elem]));
        assert.equal(1, await mmr.redisGet('leaves'));
    });

    it('2 leaves', async () => {
        const elems = 2;

        for (let i = 1; i <= elems; i++) {
            await mmr.append(i.toString());
        }

        const nodes = [];
        nodes.push(pedersen([1, 1]));
        nodes.push(pedersen([2, 2]));
        nodes.push(pedersen([3, pedersen([nodes[0], nodes[1]])]));

        for (let i = 1; i <= nodes.length; i++) {
            assert.equal(
                await mmr.redisHGet('hashes', i.toString()),
                nodes[i - 1]
            );
        }
        assert.equal(elems, await mmr.redisGet('leaves'));
    });

    it('3 leaves', async () => {
        const elems = 3;

        for (let i = 1; i <= elems; i++) {
            await mmr.append(i.toString());
        }

        const nodes = [];
        nodes.push(pedersen(['1', '1']));
        nodes.push(pedersen(['2', '2']));
        nodes.push(pedersen(['3', pedersen([nodes[0], nodes[1]])]));
        nodes.push(pedersen(['4', '3']));

        for (let i = 1; i <= nodes.length; i++) {
            assert.equal(
                await mmr.redisHGet('hashes', i.toString()),
                nodes[i - 1]
            );
        }
        assert.equal(elems, await mmr.redisGet('leaves'));
    });

    it('4 leaves', async () => {
        const elems = 4;

        for (let i = 1; i <= elems; i++) {
            await mmr.append(i.toString());
        }

        const nodes = [];
        nodes.push(pedersen(['1', '1']));
        nodes.push(pedersen(['2', '2']));
        nodes.push(pedersen(['3', pedersen([nodes[0], nodes[1]])]));
        nodes.push(pedersen(['4', '3']));
        nodes.push(pedersen(['5', '4']));
        nodes.push(pedersen(['6', pedersen([nodes[3], nodes[4]])]));
        nodes.push(pedersen(['7', pedersen([nodes[2], nodes[5]])]));

        for (let i = 1; i <= nodes.length; i++) {
            assert.equal(
                await mmr.redisHGet('hashes', i.toString()),
                nodes[i - 1]
            );
        }
        assert.equal(elems, await mmr.redisGet('leaves'));
    });

    it('5 leaves', async () => {
        const elems = 5;

        for (let i = 1; i <= elems; i++) {
            await mmr.append(i.toString());
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

        for (let i = 1; i <= nodes.length; i++) {
            assert.equal(
                await mmr.redisHGet('hashes', i.toString()),
                nodes[i - 1]
            );
        }
        assert.equal(elems, await mmr.redisGet('leaves'));
    });

    afterEach(async () => mmr.disconnectRedisClient());
});
