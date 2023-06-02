'use strict';

import instructions from "./evm";
export function addHexPrefix(s: string): string {
  return s.substr(0, 2).toLowerCase() === '0x' ? s : '0x' + s;
}
export function leftZeroPad(s: string, n: number): string {
  return Array(Math.max(1, n - s.length + 1)).join('0') + s;
}

export function dis(bytes: string): any[] {
  bytes = addHexPrefix(bytes).substr(2);
  const bytesArray = Array.apply(null, { length: bytes.length / 2 }).map((_, i) => bytes.substr(i*2, 2));
  let i = 0;
  const seqs = [];
  while (i < bytesArray.length) {
    const op = instructions[bytesArray[i]] || ['INVALID', 0];
    const addrHex = i.toString(16);
    const bytesAppended = bytesArray.slice(i + 1, i + 1 + op[op.length - 1]).join('');
    seqs.push([ addHexPrefix(leftZeroPad(addrHex, addrHex.length + (addrHex.length % 2))), op[0], (bytesAppended ? '0x' + bytesAppended : ''), addHexPrefix(bytesArray[i]) ]);
    i += 1 + op[op.length - 1];
  }
  return seqs.map((v: any): any => {
    const addrHex = v[0];
    const op = v[1];
    const bytes = v[2];
    const opByte = v[3];
    return [ op, opByte, addrHex, addHexPrefix(bytes) ]
  });
};
