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
  if (getHeight(toBinary(treeSize + 1)) > getHeight(toBinary(treeSize))) return [];
  
  const peak = toBinary(firstPeak);
  let nextPeak = bintree_jump_right_sibling(peak);
  while (nextPeak > treeSize) {
    nextPeak = bintreeMoveDownLeft(toBinary(nextPeak));
    if (nextPeak === 0) break;
    peaks.push(nextPeak);
  }
  if (nextPeak !== 0) return findPeaks(treeSize, nextPeak, peaks);
  return peaks;
};


// UTILS

const toBinary = (d) => d.toString(2);
const toDec = (b) => parseInt(b, 2);
const nbOfOnes = (str: string) => str.split('1').length - 1;
const allOnes = (str: string) => nbOfOnes(str) === str.length;

const msb_pos = (num: string) => {
  for (let idx = 0; idx < num.length; ++idx) {
    if (num[idx] === '1') return `1${'0'.repeat(num.length - idx - 1)}`;
  }
  return 0;
};

const bintreeJumpLeft = (num: string) => {
  const result = toDec(num) - (toDec(msb_pos(num)) - 1);
  // console.log(`${toDec(num)}-(${toDec(msb_pos(num))}-1)=${result}`);
  return toBinary(result);
};

const getHeight = (num: string) => {
  // console.log('msb_pos', msb_pos(num));
  let h = num;
  while (!allOnes(toBinary(h))) {
    h = bintreeJumpLeft(h);
  }
  return nbOfOnes(h) - 1;
};

const bintree_jump_right_sibling = (num: string) => {
  const height = getHeight(num);
  return toDec(num) + (1 << (height + 1)) - 1;
};

const bintreeMoveDownLeft = (num: string) => {
  let height = getHeight(num);
  if (height === 0) {
    return 0;
  }
  return toDec(num) - (1 << height);
};
