import assert from 'assert';
import { RedisMMR } from '../src';

// A Redis server must be up and running on `localhost:6379`.
describe('RedisMMR', async () => {
    let mmr: RedisMMR;

    before(async () => {
        mmr = new RedisMMR();
        await mmr.init();
    });

    it('should receive a pong', async () => {
        assert.strictEqual(await mmr.client.ping(), 'PONG');
    });

    it('should be able to delete, set and update a key', async () => {
        await mmr.redisDel('foo');
        assert.strictEqual(await mmr.redisGet('foo'), null);

        await mmr.redisSet('foo', 'bar');
        assert.strictEqual(await mmr.redisGet('foo'), 'bar');

        await mmr.redisSet('foo', 'baz');
        assert.strictEqual(await mmr.redisGet('foo'), 'baz');
    });

    after(async () => mmr.disconnectRedisClient());
});
