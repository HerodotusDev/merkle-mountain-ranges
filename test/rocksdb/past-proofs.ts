import assert from 'assert';
import { RocksDBMMR as MMR } from '../../src';
import { AppendTransaction } from '../../src/lib/types';

describe('Generate and verify past proofs', () => {
    let mmr: MMR;

    beforeEach(async () => {
        mmr = new MMR({ withRootHash: true, location: './rocksdb-db' });
        await mmr.init(true);
    });

    it('should generate and verify proofs with previous root hashes', async () => {
        // Prepare and append some values to a new tree.
        const appends = [
            { values: ['1', '2', '3'], transactionId: 'txHashA' },
            { values: ['4', '5'], transactionId: 'txHashB' },
            { values: ['6'], transactionId: 'txHashC' },
            { values: ['7'], transactionId: 'txHashD' },
            { values: ['8', '9', '10', '11'], transactionId: 'txHashE' },
        ];
        const appendTxns: AppendTransaction[] = [];
        for (let idx = 0; idx < appends.length; idx++) {
            const lastPoses = [];
            const leafIndexes = [];
            const rootHashes = [];

            for (let value of appends[idx].values) {
                const { lastPos, leafIdx, rootHash } = await mmr.append(value);
                lastPoses.push(lastPos.toString());
                leafIndexes.push(leafIdx);
                rootHashes.push(rootHash!);
            }
            const appendTx: AppendTransaction = {
                values: appends[idx].values,
                leafIndexes,
                rootHashes,
                lastPoses,
            };
            // Save each transaction.
            await mmr.saveTransaction(appends[idx].transactionId, appendTx, {
                saveValues: true,
                saveLeafIndexes: true,
                onlySaveLastRootHash: false,
                onlySaveLastPos: false,
            });
            appendTxns.push(appendTx);
        }

        // Retrieve all transactions
        const retrievedAppendTxns: AppendTransaction[] = [];
        for (const append of appends) {
            const tx = await mmr.retrieveTransaction(append.transactionId);
            retrievedAppendTxns.push(tx);
        }

        assert.deepStrictEqual(retrievedAppendTxns, appendTxns);

        // Generate and verify all proofs.
        for (const appendTx of retrievedAppendTxns) {
            // Check lengths.
            assert(appendTx.values.length > 0);
            const sameLen =
                appendTx.values.length === appendTx.leafIndexes.length &&
                appendTx.values.length === appendTx.rootHashes.length;
            assert(sameLen);

            for (let idx = 0; idx < appendTx.values.length; ++idx) {
                const lastPos =
                    appendTx.lastPoses[appendTx.lastPoses.length - 1];
                const p = await mmr.getProof(
                    Number(appendTx.leafIndexes[idx]),
                    Number(lastPos)
                );
                const lastRootHash =
                    appendTx.rootHashes[appendTx.rootHashes.length - 1];
                await mmr.verifyProof(p, Number(lastPos), lastRootHash);
            }
        }
    });

    afterEach(async () => mmr.disconnectDb());
});
