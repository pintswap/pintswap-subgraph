"use strict";

const leftZeroPadToByteLength = (s: string, n: number): string => {
  if (typeof s === "number") s = s.toString(16);
  return Array(n * 2 - s.length + 1).join("0") + s;
};

export default leftZeroPadToByteLength;
