'use strict';
interface InstructionsTable {
  [key: string]: any[];
}

const instructions: InstructionsTable = {
  '00': [ 'STOP', 0, 0, 0, 0 ],
  '01': [ 'ADD', 3, 2, 1, 0 ],
  '02': [ 'MUL', 5, 2, 1, 0 ],
  '03': [ 'SUB', 3, 2, 1, 0 ],
  '04': [ 'DIV', 5, 2, 1, 0 ],
  '05': [ 'SDIV', 5, 2, 1, 0 ],
  '06': ['MOD', 5, 2, 1, 0 ],
  '07': ['SMOD', 5, 2, 1, 0 ],
  '08': ['ADDMOD', 8, 3, 1, 0 ],
  '09': ['MULMOD', 8, 3, 1, 0 ],
  '0a': ['EXP', 10, 2, 1, 0 ],
  '0b': ['SIGNEXTEND', 5, 2, 1, 0 ],
  '10': ['LT', 3, 2, 1, 0 ],
  '11': ['GT', 3, 2, 1, 0 ],
  '12': ['SLT', 3, 2, 1, 0 ],
  '13': ['SGT', 3, 2, 1, 0 ],
  '14': ['EQ', 3, 2, 1, 0 ],
  '15': ['ISZERO', 3, 1, 1, 0 ],
  '16': ['AND', 3, 2, 1, 0 ],
  '17': ['OR', 3, 2, 1, 0 ],
  '18': ['XOR', 3, 2, 1, 0 ],
  '19': ['NOT', 3, 2, 1, 0 ],
  '1a': ['BYTE', 3, 2, 1, 0 ],
  '20': ['SHA3', 30, 2, 1, 0 ],
  '30': ['ADDRESS', 2, 0, 1, 0 ],
  '31': ['BALANCE', 400, 1, 1, 0 ],
  '32': ['ORIGIN', 2, 0, 1, 0 ],
  '33': ['CALLER', 2, 0, 1, 0 ],
  '34': ['CALLVALUE', 2, 0, 1, 0 ],
  '35': ['CALLDATALOAD', 3, 1, 1, 0 ],
  '36': ['CALLDATASIZE', 2, 0, 1, 0 ],
  '37': ['CALLDATACOPY', 3, 3, 0, 0 ],
  '38': ['CODESIZE', 2, 0, 1, 0 ],
  '39': ['CODECOPY', 3, 3, 0, 0 ],
  '3a': ['GASPRICE', 2, 0, 1, 0 ],
  '3b': ['EXTCODESIZE', 700, 1, 1, 0 ],
  '3c': ['EXTCODECOPY', 700, 4, 0, 0 ],
  '3d': ['RETURNDATASIZE', 2, 0, 1, 0 ],
  '3e': ['RETURNDATACOPY', 3, 3, 0, 0 ],
  '40': ['BLOCKHASH', 20, 1, 1, 0 ],
  '41': ['COINBASE', 2, 0, 1, 0 ],
  '42': ['TIMESTAMP', 2, 0, 1, 0 ],
  '43': ['NUMBER', 2, 0, 1, 0 ],
  '44': ['DIFFICULTY', 2, 0, 1, 0 ],
  '45': ['GASLIMIT', 2, 0, 1, 0 ],
  '50': ['POP', 2, 1, 0, 0 ],
  '51': ['MLOAD', 3, 1, 1, 0 ],
  '52': ['MSTORE', 3, 2, 0, 0 ],
  '53': ['MSTORE8', 3, 2, 0, 0 ],
  '54': ['SLOAD', 200, 1, 1, 0 ],
  '55': ['SSTORE', 0, 2, 0, 0 ],
  '56': ['JUMP', 8, 1, 0, 0 ],
  '57': ['JUMPI', 10, 2, 0, 0 ],
  '58': ['PC', 2, 0, 1, 0 ],
  '59': ['MSIZE', 2, 0, 1, 0 ],
  '5a': ['GAS', 2, 0, 1, 0 ],
  '5b': ['JUMPDEST', 1, 0, 0, 0 ],
  'f0': ['CREATE', 32000, 3, 1, 0 ],
  'f5': ['CREATE2', 32000, 4, 1, 0 ],
  'f1': ['CALL', 700, 7, 1, 0 ],
  'f2': ['CALLCODE', 700, 7, 1, 0 ],
  'f3': ['RETURN', 0, 2, 0, 0 ],
  'fd': ['REVERT', 0, 2, 0, 0 ],
  'f4': ['DELEGATECALL', 700, 6, 1, 0 ],
  'fa': ['STATICCALL', 700, 6, 1, 0 ],
  'ff': ['SELFDESTRUCT', 5000, 1, 0, 0 ]
};

Object.assign(instructions, Array.apply(null, { length: 32 }).map((_, i) => [
  'PUSH' + String(i + 1),
  3,
  0,
  1,
  i + 1
]).reduce((r, v, i) => {
  r[(96 + i).toString(16)] = v;
  return r;
}, {}), Array.apply(null, { length: 16 }).map((_, i) => [
  'DUP' + String(i + 1),
  3,
  0,
  1,
  0
]).reduce((r, v, i) => {
  r[(128 + i).toString(16)] = v;
  return r;
}, {}), Array.apply(null, { length: 16 }).map((_, i) => [
  'SWAP' + String(i + 1),
  3,
  0,
  0,
  0
]).reduce((r, v, i) => {
  r[(144 + i).toString(16)] = v;
  return r;
}, {}), Array.apply(null, { length: 5 }).map((_, i) => [
  'LOG' + String(i),
  375,
  i + 2,
  0,
  0
]).reduce((r, v, i) => {
  r[(160 + i).toString(16)] = v;
  return r;
}, {}));

export default instructions;
