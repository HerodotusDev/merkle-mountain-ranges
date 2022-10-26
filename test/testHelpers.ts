import { findFirstPeak, findPeaks, getHeight } from '../helpers';
import assert from 'assert';

describe.only('getHeight', function() {
  it('node 0', function() {
    assert.equal(getHeight(0), 1);
  });

  it('node 1', function() {
    assert.equal(getHeight(1), 1);
  });

  it('node 2', function() {
    assert.equal(getHeight(2), 2);
  });

  it('node 3', function() {
    assert.equal(getHeight(3), 1);
  });

  it('node 4', function() {
    assert.equal(getHeight(4), 1);
  });

  it('node 5', function() {
    assert.equal(getHeight(5), 2);
  });
  it('node 6', function() {
    assert.equal(getHeight(6), 3);
  });
  it('node 7', function() {
    assert.equal(getHeight(7), 1);
  });
});

describe('findFirstPeak', function() {
  it('empty tree', function() {
    assert.equal(findFirstPeak(0), 1)
  });

  it('incrementing size', function() {
    // Next first peak = previousPeak * 2 + 1
    // [1, 3, 7, 15, 31]

    let firstPeak = 1;
    
    for (let i = 0; i < 2000; i++) {
      if (i == firstPeak * 2 + 1) {
        firstPeak = i;
      }
      assert.equal(findFirstPeak(i), firstPeak);
    }
  });
});

describe('findPeaks', function() {
  it('empty tree', function() {
    assert.equal(findPeaks(0, findFirstPeak(0)), 1)
  });

  it('size 1', function() {
    assert.deepEqual(findPeaks(1, findFirstPeak(1)), [1])
  });

  it('size 3', function() {
    assert.deepEqual(findPeaks(3, findFirstPeak(3)), [3])
  });

  it('size 4', function() {
    assert.deepEqual(findPeaks(4, findFirstPeak(4)), [3, 4])
  });

  it('size 7', function() {
    assert.deepEqual(findPeaks(7, findFirstPeak(7)), [7])
  });

  it('size 8', function() {
    assert.deepEqual(findPeaks(8, findFirstPeak(8)), [7, 8])
  });

  it('size 10', function() {
    assert.deepEqual(findPeaks(10, findFirstPeak(10)), [7, 10])
  });

  it('size 11', function() {
    assert.deepEqual(findPeaks(11, findFirstPeak(11)), [7, 11])
  });

  it('size 15', function() {
    assert.deepEqual(findPeaks(15, findFirstPeak(15)), [15])
  });
});
