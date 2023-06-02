'use strict';
import { isExecutionHalt, padToBytes2 } from "./util";
  
export function push(jumpdests: any, dest: any, instruction: any, byte: any, data: any): any {
  dest.forEach((v) => {
    const dict = v.match(/^unreachable/) ? jumpdests.unreachable : jumpdests;
    const segment = dict[v] = dict[v] || [];
    segment.push([ instruction, byte, data ]);
  });
}

export function segment(disasm: any): any {
  const jumpdests = { unreachable: {} };
  let dest = ['entry'];
  let func = null;
  let unreachableSegments = 0;
  for (const v of disasm) {
    const instruction = v[0];
    const byte = v[1];
    const offset = v[2];
    const data = v[3];
    if (instruction === 'JUMPDEST') {
      if (dest[0].match(/^unreachable/)) dest = [];
      dest.push(padToBytes2(offset));
    }
    push(jumpdests, dest, instruction, byte, data);
    if (isExecutionHalt(instruction)) {
      dest = ['unreachable' + String(unreachableSegments) ];
      if (!dest[0].match(/^unreachable/)) {
        unreachableSegments++;
      }
    }
  }
  decorateUnreachableSegments(jumpdests.unreachable);
  return jumpdests;
}

export function decorateUnreachableSegments(unreachables: any): void {
  Object.keys(unreachables).forEach((v) => {
    unreachables[v].toBytes = function () {
      return ('0x' + this.reduce((r, v) => {
        return r + v[1].substr(2), v[2].substr(2);
      }, ''));
    };
  });
}
