import { findFirstPeak, findPeaks, getHeight } from '../helpers';
import assert from 'assert';

describe('getHeight', function() {
  it("should return correct heights", () => {
    const expected = [0, 0, 1, 0, 0, 1, 2, 0, 0, 1, 0, 0, 1, 2, 3, 0, 0, 1, 0];
    for (let idx = 1; idx < 20; ++idx) {
      assert.strictEqual(getHeight(idx), expected[idx - 1]);
    }
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
