import { findFirstPeak } from '../helpers';
import assert from 'assert';

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

