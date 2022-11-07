import assert from 'assert';
import { MMR } from '..';

describe('merkle proofs', () => {
    let mmr: MMR;

    before(function () {
        mmr = new MMR();
        const leaves = 11;
        for (let i = 1; i <= leaves; i++) {
            mmr.append(i.toString());
        }
        /*
 Height
    3              15
                /     \
               /       \
              /         \
             /           \
    2       7            14
          /    \       /    \
    1    3     6     10     13     18
        / \   / \    / \   /  \   /  \
    0  1   2 4   5  8   9 11  12 16  17 19
    */
    });

    it('should generate valid proofs', () => {
        // Validation happens during proof generation.
        // Throws if stored data was corrupted (leading to at least one wrong parent hash)

        // First peak
        assert.equal(mmr.getProof(1).lastVisitedNodeIdx, 15);
        assert.equal(mmr.getProof(2).lastVisitedNodeIdx, 15);
        assert.equal(mmr.getProof(4).lastVisitedNodeIdx, 15);
        assert.equal(mmr.getProof(5).lastVisitedNodeIdx, 15);
        assert.equal(mmr.getProof(8).lastVisitedNodeIdx, 15);
        assert.equal(mmr.getProof(9).lastVisitedNodeIdx, 15);
        assert.equal(mmr.getProof(11).lastVisitedNodeIdx, 15);
        assert.equal(mmr.getProof(12).lastVisitedNodeIdx, 15);
        // Second peak
        assert.equal(mmr.getProof(16).lastVisitedNodeIdx, 18);
        assert.equal(mmr.getProof(17).lastVisitedNodeIdx, 18);
        // Third peak (which is also a leaf)
        assert.equal(mmr.getProof(19).lastVisitedNodeIdx, 19);
    });
});
