export const findFirstPeak = (treeSize: number) => {
  let top = 1;
  while (top - 1 <= treeSize) {
    top <<= 1;
  }
  top = (top >> 1) - 1;
  if (top == 0) {
    return 1;
  }
  return top;
}

export const findPeaks = (
  treeSize: number,
  firstPeak: number,
  peaks: number[] = [firstPeak]
): number[] => {
  // Check for siblings without parents
  if (getHeight(treeSize + 1) > getHeight(treeSize)) return [];
  
  const peak = firstPeak;
  let nextPeak = bintree_jump_right_sibling(peak);
  while (nextPeak > treeSize) {
    nextPeak = bintreeMoveDownLeft(nextPeak);
    if (nextPeak === 0) break;
    peaks.push(nextPeak);
  }
  if (nextPeak !== 0) return findPeaks(treeSize, nextPeak, peaks);
  return peaks;
};

// Assuming the first position starts with index 1
// the height of a node correspond to the number of 1 digits (in binary)
// on the leftmost branch of the tree, minus 1
// To travel left on a tree we can subtract the position by it's MSB, minus 1
export const getHeight = (pos: number): number => {
  // Returns the number of bits in num
  function bitLength(num: number) {
    return (num >>> 0).toString(2).length;
  }

  // Number with all bits 1 with the same length as num
  function ones(num: number) {
    return (1 << bitLength(num)) - 1 == num
  }

  // Start from index 1
  pos += 1

  // Travel left until reaching leftmost branch (all bits 1)
  while (!ones(pos)) {
    let msb = 1 << bitLength(pos) - 1
    pos -= msb - 1
  }

  return bitLength(pos)
}

export const siblingOffest = (height: number): number => {
  return (2 << height) - 1;
}

const bintree_jump_right_sibling = (num: number) => {
  const height = getHeight(num);
  return num + (1 << (height + 1)) - 1;
};

const bintreeMoveDownLeft = (num: number) => {
  let height = getHeight(num);
  if (height === 0) {
    return 0;
  }
  return num - (1 << height);
};
