import assert from 'assert';
import RocksDB from 'level-rocksdb';

// Note: RocksDB must be installed locally.
describe('RocksDB', () => {
    let db: any;

    before(async () => {
        db = new RocksDB('./rocksdb');

        await db.open({ createIfMissing: true });
        assert.equal(db.isOpen(), true);
    });

    it('should successfully test RocksDB main capabilities', async () => {
        // Batch writes (PUT)
        await db.batch([
            { type: 'put', key: 'foo', value: 'bar' },
            { type: 'put', key: 'fooz', value: 'baz' },
        ]);

        // Batch read (GET)
        const [foo, fooz] = await db.getMany(['foo', 'fooz']);
        assert.strictEqual(foo, 'bar');
        assert.strictEqual(fooz, 'baz');
    });

    after(async () => {
        await db.close();
        assert.equal(db.isClosed(), true);
    });
});
