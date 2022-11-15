import assert from 'assert';
import { RocksDBMMR as MMR } from '../src';
import { pedersen } from '../src/pkg/pedersen_wasm';

describe('Large trees', () => {
    let mmr: MMR;

    beforeEach(async () => {
        mmr = new MMR({ withRootHash: true, location: './rocksdb' });
        await mmr.init();
    });

    it('should append 7 leaves to a new tree', async () => {
        const leaves = 7;
        for (let i = 1; i <= leaves; i++) {
            await mmr.append(i.toString());
        }
        assert.equal(leaves, await mmr.dbGet('leaves'));
        // for (let i = 1; i <= leaves; i++) {
        //     if (mmr.isLeaf(i)) {
        //         let proof = await mmr.getProof(i);
        //         await mmr.verifyProof(proof);
        //     }
        // }
    });

    it('should append 50 leaves to a new tree', async () => {
        const leaves = 50;
        for (let i = 1; i <= leaves; i++) {
            await mmr.append(i.toString());
        }
        assert.equal(leaves, await mmr.dbGet('leaves'));

        // for (let i = 1; i <= leaves; i++) {
        //     if (mmr.isLeaf(i)) {
        //         let proof = await mmr.getProof(i);
        //         await mmr.verifyProof(proof);
        //     }
        // }
    });

    it('should append 100 leaves to a new tree', async () => {
        const leaves = 100;
        for (let i = 1; i <= leaves; i++) {
            await mmr.append(i.toString());
        }
        assert.equal(leaves, await mmr.dbGet('leaves'));

        // for (let i = 1; i <= leaves; i++) {
        //     if (mmr.isLeaf(i)) {
        //         let proof = await mmr.getProof(i);
        //         await mmr.verifyProof(proof);
        //     }
        // }
    });

    afterEach(async () => mmr.disconnectDb());
});

describe('Restoring an existing tree', () => {
    it('should be able to restore an existing tree and use it', async () => {
        const mmr = new MMR({ withRootHash: true, location: './rocksdb' });
        await mmr.init();
        const leaves = 10;
        // Appending 10 leaves.
        for (let i = 1; i <= leaves; i++) {
            await mmr.append(i.toString());
        }

        // Restoring the tree in a new MMR instance.
        const restoredMMR = new MMR({
            withRootHash: true,
            location: './rocksdb',
            treeUuid: mmr.uuid,
            dbInstance: mmr.db,
        });
        // Appending 10 more leaves.
        for (let i = 1; i <= leaves; i++) {
            await restoredMMR.append(i.toString());
        }

        assert.equal(mmr.uuid, restoredMMR.uuid);
        assert.equal(leaves * 2, await mmr.dbGet('leaves'));
        assert.equal(leaves * 2, await restoredMMR.dbGet('leaves'));

        await mmr.disconnectDb();
    });
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

    it('should quickly generate an inclusion proof and verify it', async () => {
        let randLeaf = Math.floor(Math.random() * leaves - 1) + 1;
        while (!mmr.isLeaf(randLeaf))
            randLeaf = Math.floor(Math.random() * leaves - 1) + 1;

        const proof = await mmr.getProof(randLeaf);
        await mmr.verifyProof(proof);
    });
    after(async () => mmr.disconnectDb());
});

describe('Append elements correctly to the tree', function () {
    let mmr: MMR;

    before(async () => {
        mmr = new MMR();
        await mmr.init();
    });

    it('append 1', async () => {
        let lastPos = Number(await mmr.dbGet('lastPos'));
        assert.equal(lastPos, 0);

        await mmr.append('1');

        lastPos = Number(await mmr.dbGet('lastPos'));
        assert.equal(lastPos, 1);
    });

    it('append 2', async () => {
        await mmr.append('2');
        const lastPos = Number(await mmr.dbGet('lastPos'));
        assert.equal(lastPos, 3);
    });

    it('append 4', async () => {
        await mmr.append('4');
        const lastPos = Number(await mmr.dbGet('lastPos'));
        assert.equal(lastPos, 4);
    });

    it('append 5', async () => {
        await mmr.append('5');
        const lastPos = Number(await mmr.dbGet('lastPos'));
        assert.equal(lastPos, 7);
    });

    it('append 8', async () => {
        await mmr.append('8');
        const lastPos = Number(await mmr.dbGet('lastPos'));
        assert.equal(lastPos, 8);
    });

    it('append 9', async () => {
        await mmr.append('9');
        const lastPos = Number(await mmr.dbGet('lastPos'));
        assert.equal(lastPos, 10);
    });

    it('append 11', async () => {
        await mmr.append('11');
        const lastPos = Number(await mmr.dbGet('lastPos'));
        assert.equal(lastPos, 11);
    });

    after(async () => mmr.disconnectDb());
});

describe('Node content (hashes)', function () {
    let mmr: MMR;

    beforeEach(async () => {
        mmr = new MMR();
        await mmr.init();
    });

    it('1 leaf', async () => {
        const elem = '1';
        await mmr.append(elem);
        assert.equal(await mmr.dbHGet('hashes', '1'), pedersen('1', elem));
        assert.equal(1, await mmr.dbGet('leaves'));
    });

    it('2 leaves', async () => {
        const elems = 2;

        for (let i = 1; i <= elems; i++) {
            await mmr.append(i.toString());
        }

        const nodes = [];
        nodes.push(pedersen('1', '1'));
        nodes.push(pedersen('2', '2'));
        nodes.push(pedersen('3', pedersen(nodes[0], nodes[1])));

        for (let i = 1; i <= nodes.length; i++) {
            assert.equal(
                await mmr.dbHGet('hashes', i.toString()),
                nodes[i - 1]
            );
        }
        assert.equal(elems, await mmr.dbGet('leaves'));
    });

    it('3 leaves', async () => {
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
            assert.equal(
                await mmr.dbHGet('hashes', i.toString()),
                nodes[i - 1]
            );
        }
        assert.equal(elems, await mmr.dbGet('leaves'));
    });

    it('4 leaves', async () => {
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
            assert.equal(
                await mmr.dbHGet('hashes', i.toString()),
                nodes[i - 1]
            );
        }
        assert.equal(elems, await mmr.dbGet('leaves'));
    });

    it('5 leaves', async () => {
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
            assert.equal(
                await mmr.dbHGet('hashes', i.toString()),
                nodes[i - 1]
            );
        }
        assert.equal(elems, await mmr.dbGet('leaves'));
    });

    afterEach(async () => mmr.disconnectDb());
});
