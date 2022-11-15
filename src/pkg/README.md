# Pedersen hashing

Two WASM-ported Pedersen hashing functions are exposed from this package:

`pub fn pedersen(x: &str, y: &str) -> String`: [Geometry version](https://github.com/geometryresearch/starknet-signatures/blob/722c5987cb96aee80f230a97fed685194c97b7db/packages/prover/src/pedersen.rs).

`pub fn og_pedersen(x: Vec<u8>, y: Vec<u8>) -> String`: Official Starknet Rust implementation.

Note: the former returns an hex-padded string but the latter does not. Make sure the output match your expectation in case you want to use it.

### Building pkg

```sh
$> wasm-pack build --target nodejs --release
```

### Example JS test

```sh
$> ts-node index.ts
###
```
