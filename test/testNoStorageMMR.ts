import assert from "assert";
import { pedersen } from "starknet/dist/utils/hash";
import { NoStorageMMR } from "..";

describe('Bag the peaks', function() {
  let mmr: NoStorageMMR;

  before(function() {
    mmr = new NoStorageMMR();
  });

  it('empty peaks', function() {
    assert.equal(mmr.bagPeaks([]), '');
  });

  it('1 peak', function() {
    const peaks = [
      pedersen([0, 0])
    ]

    const res = peaks[0];

    assert.equal(mmr.bagPeaks(peaks), res);
  });
  
  it('2 peaks', function() {
    const peaks = [
      pedersen([0, 23498]),
      pedersen([1, 24089])
    ]

    const res = pedersen([peaks[0], peaks[1]]);

    assert.equal(mmr.bagPeaks(peaks), res);
  });

  it('3 peaks', function() {
    const peaks = [
      pedersen([0, 23498]),
      pedersen([1, 24089]),
      pedersen([7, 9384598])
    ]

    const res = pedersen([peaks[0] ,pedersen([peaks[1], peaks[2]])]);

    assert.equal(mmr.bagPeaks(peaks), res);
  });
})

describe('Append', function() {
  let mmr: NoStorageMMR;

  before(function () {
    mmr = new NoStorageMMR();
  });

  it('append 0', function() {
    mmr.append(0, []);
    assert.equal(mmr.lastPos, 0);
  });

  it('append 1', function() {
    mmr.append(1, [pedersen([0, 0])]);
    assert.equal(mmr.lastPos, 2);
  });

  it('append 2', function() {
    const nodes = [];
    nodes.push(pedersen([0, 0]));
    nodes.push(pedersen([1, 1]));
    nodes.push(pedersen([2, pedersen([nodes[0], nodes[1]])]));

    mmr.append(2, [nodes[2]]);
    assert.equal(mmr.lastPos, 3);
  });

  it('append 3', function() {
    const nodes = [];
    nodes.push(pedersen([0, 0]));
    nodes.push(pedersen([1, 1]));
    nodes.push(pedersen([2, pedersen([nodes[0], nodes[1]])]));
    nodes.push(pedersen([3, 2]));

    mmr.append(3, [nodes[2], nodes[3]]);
    assert.equal(mmr.lastPos, 6);
  });

  it('append 4', function() {
    const nodes = [];
    nodes.push(pedersen([0, 0]));
    nodes.push(pedersen([1, 1]));
    nodes.push(pedersen([2, pedersen([nodes[0], nodes[1]])]));
    nodes.push(pedersen([3, 2]));
    nodes.push(pedersen([4, 3]));
    nodes.push(pedersen([5, pedersen([nodes[3], nodes[4]])]));
    nodes.push(pedersen([6, pedersen([nodes[2], nodes[5]])]));

    mmr.append(4, [nodes[6]]);
    assert.equal(mmr.lastPos, 7);
  });

  it('append 5', function() {
    const nodes = [];
    nodes.push(pedersen([0, 0]));
    nodes.push(pedersen([1, 1]));
    nodes.push(pedersen([2, pedersen([nodes[0], nodes[1]])]));
    nodes.push(pedersen([3, 2]));
    nodes.push(pedersen([4, 3]));
    nodes.push(pedersen([5, pedersen([nodes[3], nodes[4]])]));
    nodes.push(pedersen([6, pedersen([nodes[2], nodes[5]])]));
    nodes.push(pedersen([7, 4]));

    mmr.append(5, [nodes[6], nodes[7]]);
    assert.equal(mmr.lastPos, 9);
  });
});

describe('Root', function() {
  let mmr: NoStorageMMR;

  before(function () {
    mmr = new NoStorageMMR();
  });

  it('1 leaf', function() {
    mmr.append(0, []);
    assert.equal(mmr.root, pedersen([0, 0]));
  });

  it('2 leaves', function() {
    const nodes = [];
    nodes.push(pedersen([0, 0]));
    nodes.push(pedersen([1, 1]));
    nodes.push(pedersen([2, pedersen([nodes[0], nodes[1]])]));

    mmr.append(1, [pedersen([0, 0])]);
    assert.equal(mmr.root, nodes[2]);
  });

  it('3 leaves', function() {
    const nodes = [];
    nodes.push(pedersen([0, 0]));
    nodes.push(pedersen([1, 1]));
    nodes.push(pedersen([2, pedersen([nodes[0], nodes[1]])]));
    nodes.push(pedersen([3, 2]));

    const root = pedersen([nodes[2], nodes[3]]);

    mmr.append(2, [nodes[2]]);
    assert.equal(mmr.root, root);
  });

  it('4 leaves', function() {
    const nodes = [];
    nodes.push(pedersen([0, 0]));
    nodes.push(pedersen([1, 1]));
    nodes.push(pedersen([2, pedersen([nodes[0], nodes[1]])]));
    nodes.push(pedersen([3, 2]));
    nodes.push(pedersen([4, 3]));
    nodes.push(pedersen([5, pedersen([nodes[3], nodes[4]])]));
    nodes.push(pedersen([6, pedersen([nodes[2], nodes[5]])]));

    mmr.append(3, [nodes[2], nodes[3]]);
    assert.equal(mmr.root, nodes[6]);
  });

  it('5 leaves', function() {
    const nodes = [];
    nodes.push(pedersen([0, 0]));
    nodes.push(pedersen([1, 1]));
    nodes.push(pedersen([2, pedersen([nodes[0], nodes[1]])]));
    nodes.push(pedersen([3, 2]));
    nodes.push(pedersen([4, 3]));
    nodes.push(pedersen([5, pedersen([nodes[3], nodes[4]])]));
    nodes.push(pedersen([6, pedersen([nodes[2], nodes[5]])]));
    nodes.push(pedersen([7, 4]));

    const root = pedersen([nodes[6], nodes[7]]);

    mmr.append(4, [nodes[6]]);
    assert.equal(mmr.root, root);
  });
});
