'use strict';

import { difference, padToBytes2 } from "./util";

export const decorateJumps = (segmented: any): any => {
  const dests = difference(Object.keys(segmented), ['unreachable']);
  dests.forEach((jumpdest) => {
    segmented[jumpdest].forEach(([ instruction, byte, data ], i, ary) => {
      if (instruction === 'JUMPI') {
        const dest = padToBytes2(ary[i - 1][2]);
        ary[i].jumpdest = dest;
      }
    });
  });
  return segmented;
};
