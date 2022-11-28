# Merkle Mountain Ranges

An implementation of Merkle Mountain Ranges in TypeScript using the Pedersen hashing function.

Note: for optimization reasons, the Pedersen hashing function used here is derived from Rust via WASM, thanks to the work of [Geometry](https://github.com/geometryresearch/starknet-signatures/blob/722c5987cb96aee80f230a97fed685194c97b7db/packages/prover/src/pedersen.rs).

If you would like to know why a Merkle Mountain Range data structure could be potentially beneficial to you, read our [article](https://codyx.medium.com/over-the-proofs-a-world-of-trees-merkle-mountain-ranges-edition-️-dd4ac0e540fc) and [Twitter thread](https://twitter.com/0xtiagofneto/status/1590025666551902209).

This can be used in-pair with an on-chain contract to prove a tree's integrity.

An example of such contract can be found [here](https://github.com/HerodotusDev/cairo-mmr)(Starknet/Cairo).

### Installing the package

```sh
$> yarn add merkle-mountain-ranges
```

### RAM (in-memory) example

```typescript
import { MMR } from 'merkle-mountain-ranges';

function main() {
    const mmr = new MMR();

    mmr.append('1');
    const proof = mmr.getProof(1);
    mmr.verifyProof(proof);
    // ...
}

main();
```

### Redis usage example

```typescript
import { RedisMMR } from 'merkle-mountain-ranges';

const mmrConfig = {
    // If set to true, the MMR will use a root hash.
    withRootHash: true, // Default to false.
    // redisClientOptions (Optional, type from `node-redis`). Without, default to localhost on port 6379.
    // treeUuid?: string; (Optional, tree UUID, to restore an existing tree).
    // dbInstance?: RedisClientType; (Optional, if the Node process needs to instantiate a MMR sharing another db instance).
};

async function main() {
    const mmr = new RedisMMR(mmrConfig);

    await mmr.init(); // Initialize the connection

    console.log('Tree uuid', mmr.uuid);

    const leaves = 11; // Total node size will be 19
    for (let idx = 0; idx < leaves; ++idx) {
        await mmr.append((idx + 1).toString()); // Leaf number starts at 1 in this implementation.
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

    // Generating a proof for leaf no.9 (16th node in the inclusion diagram above)
    const proof = await mmr.getProof(9);
    console.log('Inclusion proof of leaf no.9', proof);

    // Verifying the proof (throws on failure, pass on success)
    await mmr.verifyProof(proof);

    console.log('Valid proof!');

    await mmr.disconnectDb(); // Disconnect the `node-redis` instance.
}

main().catch(console.error);

// Tree uuid 5797cadd-3172-4f42-9f0c-be408bc10896
// Inclusion proof of leaf no.9 {
//   index: 9,
//   value: '6',
//   peaks: [ 15, 18, 19 ],
//   peaksHashes: [
//     '0x7811cf3bd6a5f019f9c345900f760694309d019be0766007388665145c431b3',
//     '0x5ad94a9ad7f469929d8e513ddb87e8758bddc928b06dede8c9e248630ed48f9',
//     '0x197f42d06f2cf19f82d475673f16350416f2c9180d77bea8a3bcc29d27b7325'
//   ],
//   siblingHashes: [
//     '0x3531a94afdc03b1ee109786fdddaf23a7864c8f18ddff9d552b5dfb50ac66a',
//     '0x41132c938a98be60612de7aed9daa905f91c8390f731c7fde8fb8bd59bbe4c3',
//     '0x4a1fead9ecdd90793ba10b7da6e8a30d655843296f148f147a89cb3e978528'
//   ],
//   lastVisitedNodeIdx: 15
// }
// Valid proof!
```

### RocksDB usage example

```typescript
import { RocksDBMMR } from 'merkle-mountain-ranges';

const mmrConfig = {
    // If set to true, the MMR will use a root hash.
    withRootHash: true, // Default to false.
    location: './rocksdb-db', // Db location path (will be created if it's non-existing).
    // treeUuid?: string; (Optional, tree UUID, to restore an existing tree).
    // dbInstance?: RocksDBType; (Optional, if the Node process needs to instantiate a MMR sharing another db instance).
};

async function main() {
    const mmr = new RocksDBMMR(mmrConfig);

    await mmr.init(); // Initialize the connection

    // ...
}
```

### Running tests

```bash

# In-memory test
$> npx ts-mocha test/ram/*.ts

# Redis test
$> npx ts-mocha test/redis/*.ts

# RocksDB test
$> npx ts-mocha test/rocksdb/*.ts

# All
$> yarn test
```

2022 - Herodotus Dev Ltd

## License

[GNU GPLv3](https://github.com/HerodotusDev/merkle-mountain-ranges/blob/main/LICENSE)
