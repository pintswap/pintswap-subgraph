'use strict';

import evm from "./evm";
export const lookupTable: any = Object.keys(evm).reduce((r, byte) => {
  r[evm[byte][0]] = { pop: evm[byte][2], push: evm[byte][3], dataSize: evm[byte][4] };
  return r;
}, {});
  
export function extractLabel(v: string): string {
  return v.split('(')[0];
}

export function annotateSegment(segment: any): any {
  let ptr = 0;
  let vars = 0;
  let stack = [];
  let shallow = 0;
  const fillStack = (depth) => {
    const len = Math.max(depth - stack.length, 0);
    for (let i = 0; i < len; i++) {
      shallow++;
      stack.push('arg' + String(shallow));
    }
  };
  const popStack = () => {
    if (!stack.length) {
      shallow++;
      stack.push('arg' + String(shallow));
    }
    return stack.shift();
  };
  const pushStack = (annotation) => {
    vars++;
    stack.unshift('local' + String(vars) + (annotation && '(' + annotation + ')' || ''));
  };
  segment.forEach((v: any) => {
    const instruction = v[0];
    const data = v[1];
    const lookup = lookupTable[instruction] || { pop: 0, push: 0 };
    fillStack(lookup.pop);
    if (instruction.match('DUP')) {
      const dupArg = Number(instruction.substr(3));
      fillStack(dupArg);
      stack.unshift(stack[dupArg - 1]);
    } else if (instruction.match('PUSH')) {
      stack.unshift(data);
    } else if (instruction.match('SWAP')) {
      const swapArg = Number(instruction.substr(4));
      fillStack(swapArg + 1);
      const placeHolder = stack[swapArg - 1];
      stack[swapArg - 1] = stack[0];
      stack[0] = placeHolder;
    } else if (instruction === 'POP') {
      stack.shift();
    } else {
      let annotation = '';
      if (instruction === 'ADD') annotation = extractLabel(stack[0]) + '+' + extractLabel(stack[1]);
      else if (instruction === 'SUB') annotation = extractLabel(stack[0]) + '-' + extractLabel(stack[1]);
      else if (instruction === 'MUL') annotation = extractLabel(stack[0]) + '*' + extractLabel(stack[1]);
      else if (instruction === 'DIV') annotation = extractLabel(stack[0]) + '/' + extractLabel(stack[1]);
      else if (instruction === 'ADDMOD') annotation = extractLabel(stack[0]) + '%+' + extractLabel(stack[1]);
      else if (instruction === 'MULMOD') annotation = extractLabel(stack[0]) + '%*' + extractLabel(stack[1]);
      else if (instruction === 'EXP') annotation = extractLabel(stack[0]) + '**' + extractLabel(stack[1]);
      else if (instruction === 'AND') annotation = extractLabel(stack[0]) + '&' + extractLabel(stack[1])
      else if (instruction === 'OR') annotation = extractLabel(stack[0]) + '|' + extractLabel(stack[1]);
      else if (instruction === 'XOR') annotation = extractLabel(stack[0]) + '^' + extractLabel(stack[1]);
      else if (instruction === 'MLOAD') annotation = 'mem[' + extractLabel(stack[0]) + ']';
      else if (instruction === 'SLOAD') annotation = 'stor[' + extractLabel(stack[0]) + ']';
      else if (instruction === 'CALLDATALOAD') annotation = 'calldata[' + stack[0] + ']';
      Array(lookup.pop).fill(0).forEach(() => popStack());
      if (lookup.push) pushStack(annotation);
    }
    v.push(stack.slice());
  });
}

export function annotate(disasm: any): any {
  const keys = Object.keys(disasm).filter((v) => v !== 'unreachable');
  keys.forEach((v) => {
    annotateSegment(disasm[v]);
  });
  return disasm;
}
