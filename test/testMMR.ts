import assert from "assert";
import { pedersen } from "starknet/dist/utils/hash";
import { MMR } from "..";

describe('Append', function() {
  let mmr: MMR;

  before(function () {
    mmr = new MMR();
  });

  it('append 0', function() {
    assert.equal(mmr.append(0), 0);
    assert.equal(mmr.lastPos, 0);
  });

  it('append 1', function() {
    assert.equal(mmr.append(1), 1);
    assert.equal(mmr.lastPos, 2);
  });

  it('append 2', function() {
    assert.equal(mmr.append(2), 3);
    assert.equal(mmr.lastPos, 3);
  });

  it('append 3', function() {
    assert.equal(mmr.append(3), 4);
    assert.equal(mmr.lastPos, 6);
  });

  it('append 4', function() {
    assert.equal(mmr.append(4), 7);
    assert.equal(mmr.lastPos, 7);
  });

  it('append 5', function() {
    assert.equal(mmr.append(5), 8);
    assert.equal(mmr.lastPos, 9);
  });

  it('append 6', function() {
    assert.equal(mmr.append(6), 10);
    assert.equal(mmr.lastPos, 10);
  });

  it('append 7', function() {
    assert.equal(mmr.append(7), 11);
    assert.equal(mmr.lastPos, 14);
  });

  it('append 8', function() {
    assert.equal(mmr.append(8), 15);
    assert.equal(mmr.lastPos, 15);
  });
});

describe.only('Node content (hashes)', function() {
  let mmr: MMR;

  beforeEach(function() {
    mmr = new MMR();
  });

  it('1 leaf', function() {
    const elem = 0;
    mmr.append(elem);
    assert.equal(mmr.hashes[0], pedersen([0, elem]))
  });

  it('2 leaves', function() {
    const elems = 2;

    for(let i=0; i < elems; i++) {
      mmr.append(i);
    }

    const nodes = [];
    nodes.push(pedersen([0, 0]));
    nodes.push(pedersen([1, 1]));
    nodes.push(pedersen([2, pedersen([nodes[0], nodes[1]])]));

    for(let i=0; i < nodes.length; i++) {
      assert.equal(mmr.hashes[i], nodes[i]);
    }
  });
});
