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
};

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
export const getHeight = (num: number): number => {
  // Returns the number of bits in num
  function bitLength(num: number) {
    return num.toString(2).length;
  }

  // Number with all bits 1 with the same length as num
  function allOnes(num: number) {
    return (1 << bitLength(num)) - 1 == num;
  }

  let h = num;
  // Travel left until reaching leftmost branch (all bits 1)
  while (!allOnes(h)) {
    h = h - ((1 << (bitLength(h) - 1)) - 1);
  }

  return bitLength(h) - 1;
};

export const siblingOffset = (height: number): number => {
  return (2 << height) - 1;
};

export const parentOffset = (height: number): number => {
  return 2 << height;
};

const bintree_jump_right_sibling = (num: number) => {
  const height = getHeight(num) - 1;
  return num + (1 << (height + 1)) - 1;
};

const bintreeMoveDownLeft = (num: number) => {
  let height = getHeight(num) - 1;
  if (height === 0) {
    return 0;
  }
  return num - (1 << height);
};
