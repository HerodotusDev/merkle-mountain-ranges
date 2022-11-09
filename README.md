# Merkle Mountain Ranges

An implementation of Merkle Mountain Ranges in TypeScript, using the Pedersen hashing function.

This can be used in pair with an on-chain contract to prove the integrity of the tree.

An example of such contract can be found [here](https://github.com/HerodotusDev/cairo-mmr)(Starknet/Cairo).

> ⚠️ This repository serves as an example on how to implement an MMR in TypeScript. In case you plan to generate large trees, you should use a proper database instead of relying on RAM (as this lib does).

### Installing the package

```sh
$> yarn install merkle-mountain-ranges
```

### Running tests

```sh
$> yarn test
```

2022 - Herodotus Dev Ltd

## License

[GNU GPLv3](https://github.com/HerodotusDev/merkle-mountain-ranges/blob/main/LICENSE)
