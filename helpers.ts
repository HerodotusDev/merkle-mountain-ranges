export const findPeaks = (num: number): number[] => {
    if (num === 0) return [];

    // Check for siblings without parents
    if (getHeight(num + 1) > getHeight(num)) return [];

    let top = 1;
    while (top - 1 <= num) {
        top <<= 1;
    }
    top = (top >> 1) - 1;
    if (top === 0) {
        return [1];
    }

    const peaks = [top];
    let peak = top;
    let outer = true;
    while (outer) {
        peak = bintreeJumpRightSibling(peak);
        while (peak > num) {
            peak = bintreeMoveDownLeft(peak);
            if (peak === 0) {
                outer = false;
                break;
            }
        }
        if (outer) peaks.push(peak);
    }
    return peaks;
};

// Returns the number of bits in num
export function bitLength(num: number) {
    return num.toString(2).length;
}

// Number with all bits 1 with the same length as num
export function allOnes(num: number) {
    return (1 << bitLength(num)) - 1 == num;
}

// Assuming the first position starts with index 1
// the height of a node correspond to the number of 1 digits (in binary)
// on the leftmost branch of the tree, minus 1
// To travel left on a tree we can subtract the position by it's MSB, minus 1
export const getHeight = (num: number): number => {
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

const bintreeJumpRightSibling = (num: number) => {
    const height = getHeight(num);
    return num + (1 << (height + 1)) - 1;
};

const bintreeMoveDownLeft = (num: number) => {
    const height = getHeight(num);
    if (height === 0) {
        return 0;
    }
    return num - (1 << height);
};
