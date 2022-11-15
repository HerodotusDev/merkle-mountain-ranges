import assert from 'assert';
import { RedisMMR as MMR } from '../../src';

// A Redis server must be up and running on `localhost:6379`.
describe('RedisMMR', async () => {
    let mmr: MMR;

    before(async () => {
        mmr = new MMR();
        await mmr.init();
    });

    it('should receive a pong', async () => {
        assert.strictEqual(await mmr.db.ping(), 'PONG');
    });

    it('should be able to delete, set and update a key', async () => {
        await mmr.dbDel('foo');
        assert.strictEqual(await mmr.dbGet('foo'), null);

        await mmr.dbSet('foo', 'bar');
        assert.strictEqual(await mmr.dbGet('foo'), 'bar');

        await mmr.dbSet('foo', 'baz');
        assert.strictEqual(await mmr.dbGet('foo'), 'baz');
    });

    after(async () => mmr.disconnectDb());
});
