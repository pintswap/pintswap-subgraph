'use strict';

class InstructionDescriptor {
  public name: string;
  public values: i32[];
  constructor(name: string, values: i32[]) {
    this.values = [ 0 ].concat(values);
    this.name = name;
  }
}

export const instructions = new Map<string, InstructionDescriptor>();
instructions.set("10", new InstructionDescriptor("LT", [3, 2, 1, 0]))
instructions.set("11", new InstructionDescriptor("GT", [3, 2, 1, 0]))
instructions.set("12", new InstructionDescriptor("SLT", [3, 2, 1, 0]))
instructions.set("13", new InstructionDescriptor("SGT", [3, 2, 1, 0]))
instructions.set("14", new InstructionDescriptor("EQ", [3, 2, 1, 0]))
instructions.set("15", new InstructionDescriptor("ISZERO", [3, 1, 1, 0]))
instructions.set("16", new InstructionDescriptor("AND", [3, 2, 1, 0]))
instructions.set("17", new InstructionDescriptor("OR", [3, 2, 1, 0]))
instructions.set("18", new InstructionDescriptor("XOR", [3, 2, 1, 0]))
instructions.set("19", new InstructionDescriptor("NOT", [3, 2, 1, 0]))
instructions.set("20", new InstructionDescriptor("SHA3", [30, 2, 1, 0]))
instructions.set("30", new InstructionDescriptor("ADDRESS", [2, 0, 1, 0]))
instructions.set("31", new InstructionDescriptor("BALANCE", [400, 1, 1, 0]))
instructions.set("32", new InstructionDescriptor("ORIGIN", [2, 0, 1, 0]))
instructions.set("33", new InstructionDescriptor("CALLER", [2, 0, 1, 0]))
instructions.set("34", new InstructionDescriptor("CALLVALUE", [2, 0, 1, 0]))
instructions.set("35", new InstructionDescriptor("CALLDATALOAD", [3, 1, 1, 0]))
instructions.set("36", new InstructionDescriptor("CALLDATASIZE", [2, 0, 1, 0]))
instructions.set("37", new InstructionDescriptor("CALLDATACOPY", [3, 3, 0, 0]))
instructions.set("38", new InstructionDescriptor("CODESIZE", [2, 0, 1, 0]))
instructions.set("39", new InstructionDescriptor("CODECOPY", [3, 3, 0, 0]))
instructions.set("40", new InstructionDescriptor("BLOCKHASH", [20, 1, 1, 0]))
instructions.set("41", new InstructionDescriptor("COINBASE", [2, 0, 1, 0]))
instructions.set("42", new InstructionDescriptor("TIMESTAMP", [2, 0, 1, 0]))
instructions.set("43", new InstructionDescriptor("NUMBER", [2, 0, 1, 0]))
instructions.set("44", new InstructionDescriptor("DIFFICULTY", [2, 0, 1, 0]))
instructions.set("45", new InstructionDescriptor("GASLIMIT", [2, 0, 1, 0]))
instructions.set("50", new InstructionDescriptor("POP", [2, 1, 0, 0]))
instructions.set("51", new InstructionDescriptor("MLOAD", [3, 1, 1, 0]))
instructions.set("52", new InstructionDescriptor("MSTORE", [3, 2, 0, 0]))
instructions.set("53", new InstructionDescriptor("MSTORE8", [3, 2, 0, 0]))
instructions.set("54", new InstructionDescriptor("SLOAD", [200, 1, 1, 0]))
instructions.set("55", new InstructionDescriptor("SSTORE", [0, 2, 0, 0]))
instructions.set("56", new InstructionDescriptor("JUMP", [8, 1, 0, 0]))
instructions.set("57", new InstructionDescriptor("JUMPI", [10, 2, 0, 0]))
instructions.set("58", new InstructionDescriptor("PC", [2, 0, 1, 0]))
instructions.set("59", new InstructionDescriptor("MSIZE", [2, 0, 1, 0]))
instructions.set("60", new InstructionDescriptor("PUSH1", [3, 0, 1, 1]))
instructions.set("61", new InstructionDescriptor("PUSH2", [3, 0, 1, 2]))
instructions.set("62", new InstructionDescriptor("PUSH3", [3, 0, 1, 3]))
instructions.set("63", new InstructionDescriptor("PUSH4", [3, 0, 1, 4]))
instructions.set("64", new InstructionDescriptor("PUSH5", [3, 0, 1, 5]))
instructions.set("65", new InstructionDescriptor("PUSH6", [3, 0, 1, 6]))
instructions.set("66", new InstructionDescriptor("PUSH7", [3, 0, 1, 7]))
instructions.set("67", new InstructionDescriptor("PUSH8", [3, 0, 1, 8]))
instructions.set("68", new InstructionDescriptor("PUSH9", [3, 0, 1, 9]))
instructions.set("69", new InstructionDescriptor("PUSH10", [3, 0, 1, 10]))
instructions.set("70", new InstructionDescriptor("PUSH17", [3, 0, 1, 17]))
instructions.set("71", new InstructionDescriptor("PUSH18", [3, 0, 1, 18]))
instructions.set("72", new InstructionDescriptor("PUSH19", [3, 0, 1, 19]))
instructions.set("73", new InstructionDescriptor("PUSH20", [3, 0, 1, 20]))
instructions.set("74", new InstructionDescriptor("PUSH21", [3, 0, 1, 21]))
instructions.set("75", new InstructionDescriptor("PUSH22", [3, 0, 1, 22]))
instructions.set("76", new InstructionDescriptor("PUSH23", [3, 0, 1, 23]))
instructions.set("77", new InstructionDescriptor("PUSH24", [3, 0, 1, 24]))
instructions.set("78", new InstructionDescriptor("PUSH25", [3, 0, 1, 25]))
instructions.set("79", new InstructionDescriptor("PUSH26", [3, 0, 1, 26]))
instructions.set("80", new InstructionDescriptor("DUP1", [3, 0, 1, 0]))
instructions.set("81", new InstructionDescriptor("DUP2", [3, 0, 1, 0]))
instructions.set("82", new InstructionDescriptor("DUP3", [3, 0, 1, 0]))
instructions.set("83", new InstructionDescriptor("DUP4", [3, 0, 1, 0]))
instructions.set("84", new InstructionDescriptor("DUP5", [3, 0, 1, 0]))
instructions.set("85", new InstructionDescriptor("DUP6", [3, 0, 1, 0]))
instructions.set("86", new InstructionDescriptor("DUP7", [3, 0, 1, 0]))
instructions.set("87", new InstructionDescriptor("DUP8", [3, 0, 1, 0]))
instructions.set("88", new InstructionDescriptor("DUP9", [3, 0, 1, 0]))
instructions.set("89", new InstructionDescriptor("DUP10", [3, 0, 1, 0]))
instructions.set("90", new InstructionDescriptor("SWAP1", [3, 0, 0, 0]))
instructions.set("91", new InstructionDescriptor("SWAP2", [3, 0, 0, 0]))
instructions.set("92", new InstructionDescriptor("SWAP3", [3, 0, 0, 0]))
instructions.set("93", new InstructionDescriptor("SWAP4", [3, 0, 0, 0]))
instructions.set("94", new InstructionDescriptor("SWAP5", [3, 0, 0, 0]))
instructions.set("95", new InstructionDescriptor("SWAP6", [3, 0, 0, 0]))
instructions.set("96", new InstructionDescriptor("SWAP7", [3, 0, 0, 0]))
instructions.set("97", new InstructionDescriptor("SWAP8", [3, 0, 0, 0]))
instructions.set("98", new InstructionDescriptor("SWAP9", [3, 0, 0, 0]))
instructions.set("99", new InstructionDescriptor("SWAP10", [3, 0, 0, 0]))
instructions.set("00", new InstructionDescriptor("STOP", [0, 0, 0, 0]))
instructions.set("01", new InstructionDescriptor("ADD", [3, 2, 1, 0]))
instructions.set("02", new InstructionDescriptor("MUL", [5, 2, 1, 0]))
instructions.set("03", new InstructionDescriptor("SUB", [3, 2, 1, 0]))
instructions.set("04", new InstructionDescriptor("DIV", [5, 2, 1, 0]))
instructions.set("05", new InstructionDescriptor("SDIV", [5, 2, 1, 0]))
instructions.set("06", new InstructionDescriptor("MOD", [5, 2, 1, 0]))
instructions.set("07", new InstructionDescriptor("SMOD", [5, 2, 1, 0]))
instructions.set("08", new InstructionDescriptor("ADDMOD", [8, 3, 1, 0]))
instructions.set("09", new InstructionDescriptor("MULMOD", [8, 3, 1, 0]))
instructions.set("0a", new InstructionDescriptor("EXP", [10, 2, 1, 0]))
instructions.set("0b", new InstructionDescriptor("SIGNEXTEND", [5, 2, 1, 0]))
instructions.set("1a", new InstructionDescriptor("BYTE", [3, 2, 1, 0]))
instructions.set("3a", new InstructionDescriptor("GASPRICE", [2, 0, 1, 0]))
instructions.set("3b", new InstructionDescriptor("EXTCODESIZE", [700, 1, 1, 0]))
instructions.set("3c", new InstructionDescriptor("EXTCODECOPY", [700, 4, 0, 0]))
instructions.set("3d", new InstructionDescriptor("RETURNDATASIZE", [2, 0, 1, 0]))
instructions.set("3e", new InstructionDescriptor("RETURNDATACOPY", [3, 3, 0, 0]))
instructions.set("5a", new InstructionDescriptor("GAS", [2, 0, 1, 0]))
instructions.set("5b", new InstructionDescriptor("JUMPDEST", [1, 0, 0, 0]))
instructions.set("f0", new InstructionDescriptor("CREATE", [32000, 3, 1, 0]))
instructions.set("f5", new InstructionDescriptor("CREATE2", [32000, 4, 1, 0]))
instructions.set("f1", new InstructionDescriptor("CALL", [700, 7, 1, 0]))
instructions.set("f2", new InstructionDescriptor("CALLCODE", [700, 7, 1, 0]))
instructions.set("f3", new InstructionDescriptor("RETURN", [0, 2, 0, 0]))
instructions.set("fd", new InstructionDescriptor("REVERT", [0, 2, 0, 0]))
instructions.set("f4", new InstructionDescriptor("DELEGATECALL", [700, 6, 1, 0]))
instructions.set("fa", new InstructionDescriptor("STATICCALL", [700, 6, 1, 0]))
instructions.set("ff", new InstructionDescriptor("SELFDESTRUCT", [5000, 1, 0, 0]))
instructions.set("6a", new InstructionDescriptor("PUSH11", [3, 0, 1, 11]))
instructions.set("6b", new InstructionDescriptor("PUSH12", [3, 0, 1, 12]))
instructions.set("6c", new InstructionDescriptor("PUSH13", [3, 0, 1, 13]))
instructions.set("6d", new InstructionDescriptor("PUSH14", [3, 0, 1, 14]))
instructions.set("6e", new InstructionDescriptor("PUSH15", [3, 0, 1, 15]))
instructions.set("6f", new InstructionDescriptor("PUSH16", [3, 0, 1, 16]))
instructions.set("7a", new InstructionDescriptor("PUSH27", [3, 0, 1, 27]))
instructions.set("7b", new InstructionDescriptor("PUSH28", [3, 0, 1, 28]))
instructions.set("7c", new InstructionDescriptor("PUSH29", [3, 0, 1, 29]))
instructions.set("7d", new InstructionDescriptor("PUSH30", [3, 0, 1, 30]))
instructions.set("7e", new InstructionDescriptor("PUSH31", [3, 0, 1, 31]))
instructions.set("7f", new InstructionDescriptor("PUSH32", [3, 0, 1, 32]))
instructions.set("8a", new InstructionDescriptor("DUP11", [3, 0, 1, 0]))
instructions.set("8b", new InstructionDescriptor("DUP12", [3, 0, 1, 0]))
instructions.set("8c", new InstructionDescriptor("DUP13", [3, 0, 1, 0]))
instructions.set("8d", new InstructionDescriptor("DUP14", [3, 0, 1, 0]))
instructions.set("8e", new InstructionDescriptor("DUP15", [3, 0, 1, 0]))
instructions.set("8f", new InstructionDescriptor("DUP16", [3, 0, 1, 0]))
instructions.set("9a", new InstructionDescriptor("SWAP11", [3, 0, 0, 0]))
instructions.set("9b", new InstructionDescriptor("SWAP12", [3, 0, 0, 0]))
instructions.set("9c", new InstructionDescriptor("SWAP13", [3, 0, 0, 0]))
instructions.set("9d", new InstructionDescriptor("SWAP14", [3, 0, 0, 0]))
instructions.set("9e", new InstructionDescriptor("SWAP15", [3, 0, 0, 0]))
instructions.set("9f", new InstructionDescriptor("SWAP16", [3, 0, 0, 0]))
instructions.set("a0", new InstructionDescriptor("LOG0", [375, 2, 0, 0]))
instructions.set("a1", new InstructionDescriptor("LOG1", [375, 3, 0, 0]))
instructions.set("a2", new InstructionDescriptor("LOG2", [375, 4, 0, 0]))
instructions.set("a3", new InstructionDescriptor("LOG3", [375, 5, 0, 0]))
instructions.set("a4", new InstructionDescriptor("LOG4", [375, 6, 0, 0]))

export type Instruction = string[];
export const addHexPrefix = (s: string): string => (s.substr(0, 2) == "0x" ? s : "0x" + s);

export const leftZeroPad = (s: string, n: i32): string => {
  return "0".repeat(n - s.length) + s;
};

export const stripHexPrefix = (s: string): string => s.substr(0, 2) == "0x" ? s.substring(2) : s;

export function toByteArray(s: string): string[] {
  const result: string[] = [];
  const stripped = stripHexPrefix(s);
  for (var i = 0; i < stripped.length; i += 2) {
    result.push(stripped.substr(i, 2));
  }
  return result;
}
    
export function disassemble(bytes: string): Instruction[] {
  const bytesArray = toByteArray(bytes);
  var i: i32 = 0;
  const seqs: Instruction[] = [];
  while (i < bytesArray.length) {
    const op = instructions.has(bytesArray[i]) ? instructions.get(bytesArray[i]) : new InstructionDescriptor('INVALID', [0]);
    const addrHex = i.toString(16);
    const bytesAppended = bytesArray.slice(i + 1, i + 1 + op.values[op.values.length - 1]).join('');
    seqs.push([ addHexPrefix(leftZeroPad(addrHex, addrHex.length + (addrHex.length % 2))), op.name, (bytesAppended ? '0x' + bytesAppended : ''), addHexPrefix(bytesArray[i]) ]);
    i += 1 + op.values[op.values.length - 1];
  }
  return seqs.map<Instruction>((v: Instruction, i: i32, ary: Instruction[]): Instruction => {
    const addrHex = v[0];
    const op = v[1];
    const bytes = v[2];
    const opByte = v[3];
    return [ op, opByte, addrHex, addHexPrefix(bytes) ]
  });
};
