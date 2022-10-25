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
