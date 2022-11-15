import assert from 'assert';
import { MMR } from '../../src/mmrs/ram';
import { MMRProof } from '../../src/lib/types';

describe('Merkle proofs generations and verifications', () => {
    let mmr: MMR;

    before(() => {
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
        let proof: MMRProof;

        // First peak
        proof = mmr.getProof(1);
        assert.equal(proof.lastVisitedNodeIdx, 15);
        assert.equal(proof.siblingHashes.length, 3);
        mmr.verifyProof(proof);

        proof = mmr.getProof(2);
        assert.equal(proof.lastVisitedNodeIdx, 15);
        assert.equal(proof.siblingHashes.length, 3);
        mmr.verifyProof(proof);

        proof = mmr.getProof(4);
        assert.equal(proof.lastVisitedNodeIdx, 15);
        assert.equal(proof.siblingHashes.length, 3);
        mmr.verifyProof(proof);

        proof = mmr.getProof(5);
        assert.equal(proof.lastVisitedNodeIdx, 15);
        assert.equal(proof.siblingHashes.length, 3);
        mmr.verifyProof(proof);

        proof = mmr.getProof(8);
        assert.equal(proof.lastVisitedNodeIdx, 15);
        assert.equal(proof.siblingHashes.length, 3);
        mmr.verifyProof(proof);

        proof = mmr.getProof(9);
        assert.equal(proof.lastVisitedNodeIdx, 15);
        assert.equal(proof.siblingHashes.length, 3);
        mmr.verifyProof(proof);

        proof = mmr.getProof(11);
        assert.equal(proof.lastVisitedNodeIdx, 15);
        assert.equal(proof.siblingHashes.length, 3);
        mmr.verifyProof(proof);

        proof = mmr.getProof(12);
        assert.equal(proof.lastVisitedNodeIdx, 15);
        assert.equal(proof.siblingHashes.length, 3);
        mmr.verifyProof(proof);

        // Second peak
        proof = mmr.getProof(16);
        assert.equal(proof.lastVisitedNodeIdx, 18);
        assert.equal(proof.siblingHashes.length, 1);
        mmr.verifyProof(proof);

        proof = mmr.getProof(17);
        assert.equal(proof.lastVisitedNodeIdx, 18);
        assert.equal(proof.siblingHashes.length, 1);
        mmr.verifyProof(proof);

        // Third peak (which is also a leaf)
        proof = mmr.getProof(19);
        assert.equal(proof.lastVisitedNodeIdx, 19);
        assert.equal(proof.siblingHashes.length, 0);
        mmr.verifyProof(proof);
    });
});
