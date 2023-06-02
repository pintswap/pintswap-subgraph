import { WETH9 } from "./WETH9";
import { PERMIT2_ADDRESS, Permit2ABI } from "./permit2";
import * as evmdis from "./evmdis";
export const addHexPrefix = (s) => (s.substr(0, 2) === "0x" ? s : "0x" + s);
export type Instruction = string[];
type CheckOpType = (op: string) => string;

interface TransferResultData {
  token: string;
  to: string;
  from: string;
  amount: string;
}

interface TransferResult {
  success: boolean;
  tail: Instruction[];
  data: TransferResultData;
};
interface Offer {
  token: string;
  amount: string;
}
interface ParseTradeResult {
  success: boolean;
  gets: Offer;
  gives: Offer;
  maker: string;
  taker: string;
  chainId: number;
};
interface TailResult {
  success: boolean;
  tail: Instruction[];
};

const NULL_TRADE_RESULT: TradeResult = {
  success: false,
  gets: {
    token: '',
    amount: ''
  },
  gives: {
    token: '',
    amount: ''
  },
  maker: '',
  taker: '',
  chainId: 0
};

const NULL_TRANSFER_RESULT: TransferResult = {
  success: false,
  tail: [],
  data: {
    token: '',
    amount: '',
    to: '',
    from: ''
  }
};

const NULL_TAIL_RESULT: TailResult = {
  success: false,
  tail: []
};


export const stripHexPrefix = (s: string): string =>
  s.substr(0, 2) === "0x" ? s.substr(2) : s;

const getUint = (v: number): BigInt => BigInt(v);

const stripZerosLeft = (v: string) => (v.substr(0, 2) === '0x' ? '0x' : '') + stripHexPrefix(v).replace(/^0+/, '');

const zeroPadBytes = (v: string, n: number): string => {
  const fixed = addHexPrefix(stripHexPrefix(v));
  return fixed + '0'.repeat(2*((Number(fixed.length / 2)) - Number(n)));
};

const getAddress = (v: string): string => v;

export const leftZeroPad = (s: string, n: number): string => {
  return "0".repeat(Number(n) - Number(s.length)) + s;
}

import { WETH_ADDRESSES } from "./WETH9";

export const toWETH = (chainId: number): string => {
  if (!chainId) chainId = 1;
  const chain = String(chainId);
  const address = WETH_ADDRESSES[chain] || '';
  return address;
};

export const numberToHex = (v: number): string => {
  return addHexPrefix(Buffer.from(new Uint32Array([v])).toString('hex'));
};


const makeCheckOp = (ary: Instruction[]): CheckOpType => (op: string): string => {
  const item = ary.splice(0, 1)[0] || [];
  const opCode = item[0];
  const operand = item[2];
  if (!opCode) return 'false';
  if (op === "ANY" || op === "PUSH" && opCode.substr(0, 4) === "PUSH" || opCode === op)
    return operand || '';
  else return 'false';
};


export const parsePermit2 = (disassembly: Instruction[], first: boolean): TransferResult => {
  if (!first) first = false;
  const ops = disassembly.slice();
  const checkOp: (op: string) => string = makeCheckOp(ops);
  const parsed: string[] = [
    first ? "PC" : "PUSH1",
    first ? "RETURNDATASIZE" : "PUSH1",
    "PUSH2",
    first ? "RETURNDATASIZE" : "PUSH1",
    first ? "RETURNDATASIZE" : "PUSH1",
    "PUSH",
    "GAS",
    "PUSH32",
    "PUSH1",
    "MSTORE",
    "PUSH",
    "PUSH1",
    "MSTORE",
    "PUSH",
    "PUSH1",
    "MSTORE",
    "PUSH",
    "PUSH1",
    "MSTORE",
    "PUSH",
    "PUSH1",
    "MSTORE",
    "ANY",
    "PUSH1",
    "MSTORE",
    "PUSH",
    "PUSH1",
    "MSTORE",
    "PUSH",
    "PUSH1",
    "MSTORE",
    "PUSH",
    "PUSH1",
    "MSTORE",
    "PUSH",
    "PUSH2",
    "MSTORE",
    "PUSH",
    "PUSH2",
    "MSTORE",
    "PUSH",
    "PUSH2",
    "MSTORE",
    "PUSH32",
    "PUSH2",
    "MSTORE",
    "CALL",
  ]
    .concat(first ? [] : ["AND"])
    .map((v: string): string => checkOp(v));
  if (
    parsed.find((v: string): boolean => v === 'false') === 'false' ||
    parsed[2] !== "0x0184" ||
    parsed[5] !== "0x22d473030f116ddee9f6b43ac78ba3" ||
    parsed[7] !==
      "0x30f28b7a00000000000000000000000000000000000000000000000000000000"
  )
    return NULL_TRANSFER_RESULT;
  return {
    success: true,
    tail: disassembly.slice(parsed.length),
    data: {
      token: getAddress(parsed[10]),
      to: parsed[22] === '0x' ? 'CALLER' : getAddress(parsed[22]),
      from: getAddress(parsed[28]),
      amount: parsed[13],
    },
  };
};

const parseTransfer = (disassembly: Instruction[], chainId: number, first: boolean): TransferResult => {
  if (!first) first = false;
  if (!chainId) chainId = 1;
  const transferFrom = parseTransferFrom(disassembly, first);
  const transfer = !transferFrom.success && parsePermit2(disassembly, first);
  if (!transfer.success && !transferFrom.success) return NULL_TRANSFER_RESULT;
  const withdraw = transfer.success && transfer.data.token === getAddress(toWETH(chainId)) && parseWithdraw(transfer.tail, false);
  const sendEther =
    withdraw.success && parseSendEther(withdraw.tail, false);
  if (
    transfer.success &&
    transfer.data.token === getAddress(toWETH(chainId)) &&
    !(sendEther.success && withdraw.success)
  )
    return NULL_TRANSFER_RESULT;
  const data = transferFrom.success && transferFrom.data || transfer.success && transfer.data;
  const tail = sendEther.success && sendEther.tail || (transfer.success && transfer.tail || transferFrom.success && transferFrom.tail);
  return {
    success: true,
    data: data,
    tail: tail
  };
};




export const parseTrade = (bytecode: string, chainId: number): ParseTradeResult => {
  if (!chainId) chainId = 1;
  const disassembly: Instruction[] = evmdis.disassemble(bytecode);
  const firstPermit = parsePermit(disassembly, true);
  const secondPermit = firstPermit && parsePermit(firstPermit.tail, false);
  const firstTransfer = parseTransfer(secondPermit.success && secondPermit.tail || firstPermit.success && firstPermit.tail || disassembly, chainId, !firstPermit.success);
  if (!firstTransfer) return NULL_TRADE_RESULT;
  const secondTransfer = parseTransfer(firstTransfer.tail, chainId, false);
  if (!secondTransfer) return NULL_TRADE_RESULT;
  const ops = secondTransfer.tail.slice();
  const checkOp: (op: string) => string = makeCheckOp(ops);
  const parsed: string[] = [
    "ISZERO",
    "PUSH2",
    "JUMPI",
    "PUSH",
    "SELFDESTRUCT",
    "JUMPDEST",
    "PUSH1",
    "PUSH1",
    "REVERT",
  ].map((v: string): string => checkOp(v));
  if (
    parsed.find((v) => v === 'false') === 'false' ||
    parsed.slice(6, 7).find((v) => v !== "0x00")
  )
    return NULL_TRADE_RESULT;
  const tail = ops.slice(parsed.length);
  if (tail.length !== 0) return NULL_TRADE_RESULT;
  const taker = firstTransfer.data.from;
  const maker = secondTransfer.data.from;
  const gets: Offer = {
    token: firstTransfer.data.token,
    amount: firstTransfer.data.amount
  };
  const gives: Offer = {
    token: secondTransfer.data.token,
    amount: secondTransfer.data.amount
  };
  return {
    success: true,
    gets,
    gives,
    maker,
    taker,
    chainId
  };
};

export const parseWithdraw = (disassembly: Instruction[], chainId: number, first: boolean): TailResult => {
  if (!chainId) chainId = 1;
  if (!first) first = false;
  const ops = disassembly.slice();
  const checkOp: (op: string) => string = makeCheckOp(ops);
  const parsed: string[] = [
    first ? "PC" : "PUSH1",
    first ? "RETURNDATASIZE" : "PUSH1",
    "PUSH1",
    first ? "RETURNDATASIZE" : "PUSH1",
    first ? "RETURNDATASIZE" : "PUSH1",
    "PUSH",
    "GAS",
    "PUSH32",
    first ? "RETURNDATASIZE" : "PUSH1",
    "MSTORE",
    "PUSH",
    "PUSH1",
    "MSTORE",
    "CALL",
  ]
    .concat(first ? [] : ["AND"])
    .map((v: string): string => checkOp(v));
  if (
    parsed[2] !== "0x24" ||
    getAddress(parsed[5]) !== getAddress(toWETH(chainId)) ||
    parsed[7] !==
      "0x2e1a7d4d00000000000000000000000000000000000000000000000000000000" ||
    parsed[11] !== "0x04"
  )
    return NULL_TAIL_RESULT;
  return {
    success: true,
    tail: disassembly.slice(parsed.length),
  };
};

export const parsePermit = (disassembly: Instruction[], first: boolean): TailResult => {
  if (!first) first = false;
  const ops = disassembly.slice();
  const checkOp: (op: string) => string = makeCheckOp(ops);
  const parsed: string[] = [
    first ? "PC" : "PUSH1",
    first ? "RETURNDATASIZE" : "PUSH1",
    "PUSH1",
    first ? "RETURNDATASIZE" : "PUSH1",
    first ? "RETURNDATASIZE" : "PUSH1",
    "PUSH",
    "GAS",
    "PUSH32",
    "PUSH1",
    "MSTORE",
    "PUSH",
    "PUSH1",
    "MSTORE",
    "ADDRESS",
    "PUSH1",
    "MSTORE",
    "PUSH",
    "PUSH1",
    "MSTORE",
    "PUSH",
    "PUSH1",
    "MSTORE",
    "PUSH1",
    "PUSH1",
    "MSTORE",
    "PUSH",
    "PUSH1",
    "MSTORE",
    "PUSH",
    "PUSH1",
    "MSTORE",
    "CALL",
  ]
    .concat(first ? [] : ["AND"])
    .map((v: string): string => checkOp(v));
  if (
    parsed[2] !== "0xe4" ||
    parsed[7] !== "0xd505accf00000000000000000000000000000000000000000000000000000000" ||
    parsed[11] !== "0x04"
  )
    return NULL_TAIL_RESULT;
  return {
    success: true,
    tail: disassembly.slice(parsed.length),
  };
};

export const parseTransferFrom = (disassembly: Instruction[], first: boolean): TransferResult => {
  if (!first) first = false;
  const ops = disassembly.slice();
  const checkOp: (op: string) => string = makeCheckOp(ops);
  const parsed: string[] = [
    first ? "PC" : "PUSH1",
    first ? "RETURNDATASIZE" : "PUSH1",
    "PUSH1",
    first ? "RETURNDATASIZE" : "PUSH1",
    first ? "RETURNDATASIZE" : "PUSH1",
    "PUSH",
    "GAS",
    "PUSH32",
    "PUSH1",
    "MSTORE",
    "PUSH",
    "PUSH1",
    "MSTORE",
    "PUSH",
    "PUSH1",
    "MSTORE",
    "PUSH",
    "PUSH1",
    "MSTORE",
    "CALL"
  ]
    .concat(first ? [] : ["AND"])
    .map((v: string): string => checkOp(v));
  if (
    parsed[2] !== "0x64" ||
    parsed[7] !==
      "0x23b872dd00000000000000000000000000000000000000000000000000000000" ||
    parsed[11] !== "0x04"
  )
    return NULL_TRANSFER_RESULT;
  return {
    success: true,
    data: {
      token: getAddress(parsed[5]),
      from: getAddress(parsed[10]),
      to: getAddress(parsed[13]),
      amount: parsed[16]
    },
    tail: disassembly.slice(parsed.length),
  };
};


export function parseSendEther(disassembly: Instruction[]): TailResult {
  const ops = disassembly.slice();
  const checkOp: (op: string) => string = makeCheckOp(ops);
  const parsed = [
    "PUSH1",
    "PUSH1",
    "PUSH1",
    "PUSH1",
    "PUSH",
    "PUSH",
    "GAS",
    "CALL",
    "AND",
  ].map((v: string): string => checkOp(v));
  if (parsed.find((v) => v === 'false') === 'false' || parsed.slice(0, 4).find((v) => v !== "0x00")) return NULL_TAIL_RESULT;
  return {
    success: true,
    tail: disassembly.slice(parsed.length)
  };
}
