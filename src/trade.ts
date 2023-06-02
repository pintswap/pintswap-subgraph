import { WETH9 } from "./WETH9";
import { PERMIT2_ADDRESS, Permit2ABI } from "./permit2";
import * as evmdis from "./evmdis";
export const addHexPrefix = (s) => (s.substr(0, 2) === "0x" ? s : "0x" + s);
export type Instruction = string[];
type CheckOpType = (op: string) => string;
type TransferResult = {
  tail: Instruction[];
  data: {
    token: string;
    to: string;
    from: string;
    amount: string;
  }
};
type Offer = {
  token: string;
  amount: string;
}
type ParseTradeResult = {
  gets: Offer;
  gives: Offer;
  maker: string;
  taker: string;
  chainId: number;
};
type TailResult = {
  tail: Instruction[]
};

export const stripHexPrefix = (s) =>
  s.substr(0, 2) === "0x" ? s.substr(2) : s;

const getUint = (v: number) => BigInt(v);

const stripZerosLeft = (v: string) => (v.substr(0, 2) === '0x' ? '0x' : '') + stripHexPrefix(v).replace(/^0+/, '');

const zeroPadBytes = (v: string, n: number): string => ((v) => v + '0'.repeat(2*((v.length / 2) - n)))(addHexPrefix(stripHexPrefix(v)))

const getAddress = (v: string): string => addHexPrefix(v.substr(-40));

export const leftZeroPad = (s: string, n: number): string => {
  return "0".repeat(n - s.length) + s;
}

import { WETH_ADDRESSES } from "./WETH9";

export const toWETH = (chainId: number) => {
  if (!chainId) chainId = 1;
  const chain = String(chainId);
  const address = WETH_ADDRESSES[chain];
  return address;
};

export const numberToHex = (v: number): string => addHexPrefix(Buffer.from(new Uint32Array([v])).toString('hex'));


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
  const checkOp = makeCheckOp(ops);
  const parsed = [
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
    .map((v) => checkOp(v));
  if (
    parsed.find((v) => v === 'false') === 'false' ||
    parsed[2] !== "0x0184" ||
    parsed[5] !== "0x22d473030f116ddee9f6b43ac78ba3" ||
    parsed[7] !==
      "0x30f28b7a00000000000000000000000000000000000000000000000000000000"
  )
    return null;
  return {
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
  const transfer = !transferFrom && parsePermit2(disassembly, first);
  if (!transfer && !transferFrom) return null;
  const withdraw = transfer && transfer.data.token === getAddress(toWETH(chainId)) && parseWithdraw(transfer.tail);
  const sendEther =
    withdraw && parseSendEther(withdraw.tail);
  if (
    transfer &&
    transfer.data.token === getAddress(toWETH(chainId)) &&
    !(sendEther && withdraw)
  )
    return null;
  const data = transferFrom && transferFrom.data || transfer && transfer.data;
  const tail = sendEther && sendEther.tail || (transfer || transferFrom).tail
  return {
    data: data,
    tail: tail
  };
};



export const parseTrade = (bytecode: string, chainId: number): ParseTradeResult => {
  if (!chainId) chainId = 1;
  const disassembly = evmdis.disassemble(bytecode);
  const firstPermit = parsePermit(disassembly, true);
  const secondPermit = firstPermit && parsePermit(firstPermit.tail, false);
  const firstTransfer = parseTransfer(secondPermit && secondPermit.tail || firstPermit && firstPermit.tail || disassembly, chainId, !firstPermit);
  if (!firstTransfer) return null;
  const secondTransfer = parseTransfer(firstTransfer.tail, chainId, false);
  if (!secondTransfer) return null;
  const ops = secondTransfer.tail.slice();
  const checkOp = makeCheckOp(ops);
  const parsed = [
    "ISZERO",
    "PUSH2",
    "JUMPI",
    "PUSH",
    "SELFDESTRUCT",
    "JUMPDEST",
    "PUSH1",
    "PUSH1",
    "REVERT",
  ].map((v) => checkOp(v));
  if (
    parsed.find((v) => v === 'false') === 'false' ||
    parsed.slice(6, 7).find((v) => v !== "0x00")
  )
    return null;
  const tail = ops.slice(parsed.length);
  if (tail.length !== 0) return null;
  const data = {
    firstPermit: firstPermit && firstPermit.data,
    secondPermit: secondPermit && secondPermit.data,
    firstTransfer: firstTransfer.data,
    secondTransfer: secondTransfer.data,
  };
  let permitData = null;
  if (firstPermit) {
    permitData = {};
    if (secondPermit) {
      permitData.maker = firstPermit.data;
      permitData.taker = secondPermit.data;
    } else {
      if (firstPermit.data.token === (firstTransfer.data.transferFrom || firstTransfer.data.transfer).token) permitData.taker = firstPermit.data;
      else permitData.maker = firstPermit.data;
    }
  }
  const taker = (firstTransfer.data.transfer || firstTransfer.data.transferFrom).from;
  const maker = (secondTransfer.data.transfer || secondTransfer.data.transferFrom).from;
  const gets = {
    token: (firstTransfer.data.transfer || firstTransfer.data.transferFrom).token,
    amount: (firstTransfer.data.transfer || firstTransfer.data.transferFrom).amount
  };
  const gives = {
    token: (secondTransfer.data.transfer || secondTransfer.data.transferFrom).token,
    amount: (secondTransfer.data.transfer || secondTransfer.data.transferFrom).amount
  };
  return {
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
  const checkOp = makeCheckOp(ops);
  const parsed = [
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
    .map((v) => checkOp(v));
  if (
    parsed[2] !== "0x24" ||
    getAddress(parsed[5]) !== getAddress(toWETH(chainId)) ||
    parsed[7] !==
      "0x2e1a7d4d00000000000000000000000000000000000000000000000000000000" ||
    parsed[11] !== "0x04"
  )
    return null;
  return {
    tail: disassembly.slice(parsed.length),
  };
};

export const parsePermit = (disassembly: Instruction[], first: boolean): TailResult => {
  if (!first) first = false;
  const ops = disassembly.slice();
  const checkOp = makeCheckOp(ops);
  const parsed = [
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
    .map((v) => checkOp(v));
  if (
    parsed[2] !== "0xe4" ||
    parsed[7] !== "0xd505accf00000000000000000000000000000000000000000000000000000000" ||
    parsed[11] !== "0x04"
  )
    return null;
  return {
    tail: disassembly.slice(parsed.length),
  };
};

export const parseTransferFrom = (disassembly: Instruction[], first: boolean): TransferResult => {
  if (!first) first = false;
  const ops = disassembly.slice();
  const checkOp = makeCheckOp(ops);
  const parsed = [
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
    .map((v) => checkOp(v));
  if (
    parsed[2] !== "0x64" ||
    parsed[7] !==
      "0x23b872dd00000000000000000000000000000000000000000000000000000000" ||
    parsed[11] !== "0x04"
  )
    return null;
  return {
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
  const checkOp = makeCheckOp(ops);
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
  ].map((v) => checkOp(v));
  if (parsed.find((v) => v === 'false') === 'false' || parsed.slice(0, 4).find((v) => v !== "0x00")) return null;
  return {
    tail: disassembly.slice(parsed.length)
  };
}
