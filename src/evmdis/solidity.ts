'use strict';

import { difference, padToBytes2 } from "./util";

export const decorateJumps = (segmented: any): any => {
  const dests = difference(Object.keys(segmented), ['unreachable']);
  dests.forEach((jumpdest) => {
    segmented[jumpdest].forEach((v: any[], i: number, ary: any[]) => {
      const instruction = v[0];
      const byte = v[1];
      const data = v[3];
      if (instruction === 'JUMPI') {
        const dest = padToBytes2(ary[i - 1][2]);
        ary[i].jumpdest = dest;
      }
    });
  });
  return segmented;
};
