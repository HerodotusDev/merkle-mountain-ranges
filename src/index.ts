import { MMR as InMemoryMMR } from './mmrs/ram';
import { MMR as RedisMMR } from './mmrs/redis';
import { MMR as RocksDBMMR } from './mmrs/rocksdb';
import { IMMR } from './mmrs/interface';

export { InMemoryMMR, RedisMMR, RocksDBMMR, IMMR };
