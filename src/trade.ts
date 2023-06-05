import { WETH_ADDRESSES } from "./WETH";
import { PERMIT2_ADDRESS } from "./permit2";
import * as evmdis from "./evmdis";
import { Instruction, leftZeroPad, addHexPrefix } from "./evmdis";
import { assert } from "matchstick-as/assembly/assert"
import { ethereum } from "@graphprotocol/graph-ts"
type CheckOpType = (op: string) => string;


class TransferResultData {
  token: string;
  to: string;
  from: string;
  amount: string;
  constructor(token: string, to: string, from: string, amount: string) {
    this.token = token;
    this.to = to;
    this.from = from;
    this.amount = amount;
  }
}

class TransferResult {
  public success: boolean;
  public tail: Instruction[];
  public data: TransferResultData;
  constructor(success: boolean, tail: Instruction[], data: TransferResultData) {
    this.success = success;
    this.tail = tail;
    this.data = data;
  }
}
class Offer {
  public token: string;
  public amount: string;
  constructor(token: string, amount: string) {
    this.token = token;
    this.amount = amount;
  }
}
class TradeResult {
  public success: boolean;
  public gets: Offer;
  public gives: Offer;
  public maker: string;
  public taker: string;
  public chainId: number;
  constructor(success: boolean, gets: Offer, gives: Offer, maker: string, taker: string, chainId: i32) {
    this.success = success;
    this.gets = gets;
    this.gives = gives;
    this.maker = maker;
    this.taker = taker;
    this.chainId = chainId;
  }
}
class TailResult {
  public success: boolean;
  public tail: Instruction[];
  constructor(success: boolean, tail: Instruction[]) {
    this.success = success;
    this.tail = tail;
  }
}

const NULL_TRADE_RESULT: TradeResult = new TradeResult(false, new Offer("", ""), new Offer("", ""), "", "", 0);

const NULL_TRANSFER_RESULT: TransferResult = new TransferResult(false, [], new TransferResultData("", "", "", ""));

const NULL_TAIL_RESULT: TailResult = new TailResult(false, []);

export const stripHexPrefix = (s: string): string =>
  s.substr(0, 2) == "0x" ? s.substr(2) : s;

const zeroPadBytes = (v: string, n: i32): string => {
  const fixed = addHexPrefix(stripHexPrefix(v));
  return fixed + "0".repeat(2 * (((fixed.length / 2) - n)));
};

const getAddress = (v: string): string => v;

export const toWETH = (chainId: i32): string => {
  if (!chainId) chainId = 1;
  const address = WETH_ADDRESSES.get(chainId) || "";
  return address;
};

const checkOp = (ary: Instruction[], op: string): string => {
  const item = ary.splice(0, 1)[0] || [];
  const opCode = item[0];
  const operand = item[3];
  if (!opCode) return "false";
  if (
    op == "ANY" ||
    (op == "PUSH" && opCode.substr(0, 4) == "PUSH") ||
    opCode == op
  )
    return operand || "";
  else return "false";
};

const mapCheckOps = (ary: Instruction[], ops: string[]): string[] => {
  const result: string[] = [];
  for (var i: i32 = 0; i < ops.length; i++) {
    result.push(checkOp(ary, ops[i]));
  }
  return result;
};

export const parsePermit2 = (
  disassembly: Instruction[],
  first: boolean
): TransferResult => {
  if (!first) first = false;
  const ops = disassembly.slice();
  const instructions = [
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
  ];
  if (!first) instructions.push("AND");
  if (instructions.length > ops.length) return NULL_TRANSFER_RESULT;
  const parsed: string[] = mapCheckOps(ops, instructions);
  if (
    findString(parsed, (v: string, i: i32, ary: string[]) => v == "false") ==
      "false" ||
    parsed[2] != "0x0184" ||
    parsed[5] != "0x22d473030f116ddee9f6b43ac78ba3" ||
    parsed[7] !=
      "0x30f28b7a00000000000000000000000000000000000000000000000000000000"
  )
    return NULL_TRANSFER_RESULT;
  const result: TransferResult = new TransferResult(true, disassembly.slice(parsed.length), new TransferResultData(getAddress(parsed[10]), parsed[22] == "0x" ? "CALLER" : getAddress(parsed[22]), getAddress(parsed[28]), parsed[13]));
  return result;
};

export function parseTransfer(
  disassembly: Instruction[],
  chainId: i32,
  first: boolean
): TransferResult {
  if (!first) first = false;
  if (!chainId) chainId = 1;
  const transferFrom: TransferResult = parseTransferFrom(disassembly.slice(), first);
  const transfer: TransferResult = !transferFrom.success
    ? parsePermit2(disassembly.slice(), first)
    : NULL_TRANSFER_RESULT;
  if (!transfer.success && !transferFrom.success) return NULL_TRANSFER_RESULT;
  var withdraw: TailResult = NULL_TAIL_RESULT;
  if (transfer.success && transfer.data.token == getAddress(toWETH(chainId))) {
    withdraw = parseWithdraw(transfer.tail.slice(), chainId, false);
  }
  const sendEther: TailResult = withdraw.success
    ? parseSendEther(withdraw.tail)
    : NULL_TAIL_RESULT;
  if (
    transfer.success &&
    transfer.data.token == getAddress(toWETH(chainId)) &&
    !(sendEther.success && withdraw.success)
  )
    return NULL_TRANSFER_RESULT;
  const transferData = transferFrom.success ? transferFrom : transfer;
  const tail = sendEther.success
    ? sendEther.tail
    : transfer.success
    ? transfer.tail
    : transferFrom.success
    ? transferFrom.tail
    : NULL_TAIL_RESULT.tail;
  const result: TransferResult = new TransferResult(true, tail, transferData.data);
  return result;
};

function findString(
  ary: string[],
  fn: (v: string, i: i32, ary: string[]) => boolean
): string {
  const i = ary.findIndex(fn);
  var result = (~i === 0) ? "" : ary[i];
  return result;
}

export function parseTrade(
  bytecode: string,
  chainId: i32
): TradeResult {
  if (!chainId) chainId = 1;
  const disassembly: Instruction[] = evmdis.disassemble(bytecode);
  const firstPermit: TailResult = parsePermit(disassembly, true);
  const secondPermit: TailResult = firstPermit.success
    ? parsePermit(firstPermit.tail, false)
    : NULL_TAIL_RESULT;

  const firstTransfer: TransferResult = parseTransfer(
    secondPermit.success
      ? secondPermit.tail
      : firstPermit.success
      ? firstPermit.tail
      : disassembly,
    chainId,
    !firstPermit.success
  );
  if (!firstTransfer.success) return NULL_TRADE_RESULT;
  const secondTransfer: TransferResult = parseTransfer(
    firstTransfer.tail,
    chainId,
    false
  );
  if (!secondTransfer.success) return NULL_TRADE_RESULT;
  const ops = secondTransfer.tail.slice();
  const parsed: string[] = mapCheckOps(ops, [
    "ISZERO",
    "PUSH2",
    "JUMPI",
    "PUSH",
    "SELFDESTRUCT",
    "JUMPDEST",
    "PUSH1",
    "PUSH1",
    "REVERT",
  ]);
  if (
    findString(parsed, (v: string, i: i32, ary: string[]) => v == "false") ==
      "false" ||
    findString(
      parsed.slice(6, 7),
      (v: string, i: i32, ary: string[]) => v != "0x00"
    ) != ""
  )
    return NULL_TRADE_RESULT;
  const tail = ops.slice(parsed.length);
  if (tail.length !== 0) return NULL_TRADE_RESULT;
  const taker = firstTransfer.data.from;
  const maker = secondTransfer.data.from;
  const gets: Offer = new Offer(firstTransfer.data.token, firstTransfer.data.amount);
  const gives: Offer = new Offer(secondTransfer.data.token, secondTransfer.data.amount);
  const result: TradeResult = new TradeResult(true, gets, gives, taker, maker, chainId);
  return result;
}

export function parseWithdraw(
  disassembly: Instruction[],
  chainId: i32,
  first: boolean
): TailResult {
  const ops = disassembly.slice();
  const instructions = [
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
  ];
  if (!first) instructions.push("AND");
  if (instructions.length > ops.length) return NULL_TAIL_RESULT;
  const parsed: string[] = mapCheckOps(ops, instructions);
  //assert.arrayEquals(ethereum.Value.fromStringArray(parsed).toArray(), ethereum.Value.fromStringArray([]).toArray());
  if (
    parsed[2] != "0x24" ||
    getAddress(parsed[5]) != getAddress(toWETH(chainId)) ||
    parsed[7] !=
      "0x2e1a7d4d00000000000000000000000000000000000000000000000000000000" ||
    parsed[11] != "0x04"
  )
    return NULL_TAIL_RESULT;
  const result: TailResult = new TailResult(true, disassembly.slice(parsed.length));
  return result;
};

export function parsePermit(
  disassembly: Instruction[],
  first: boolean
): TailResult {
  if (!first) first = false;
  const ops = disassembly.slice();
  const instructions = [
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
  ];
  if (!first) instructions.push("AND");
  if (instructions.length > ops.length) return NULL_TAIL_RESULT;
  const parsed: string[] = mapCheckOps(ops, instructions);
  if (
    parsed[2] != "0xe4" ||
    parsed[7] !=
      "0xd505accf00000000000000000000000000000000000000000000000000000000" ||
    parsed[11] != "0x04"
  )
    return NULL_TAIL_RESULT;
  const result: TailResult = new TailResult(true, disassembly.slice(parsed.length));
  return result;
}

export function parseTransferFrom(
  disassembly: Instruction[],
  first: boolean
): TransferResult {
  if (!first) first = false;
  const ops = disassembly.slice();
  const instructions = [
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
    "CALL",
  ];
  if (!first) instructions.push("AND");
  if (ops.length < instructions.length) {
    return NULL_TRANSFER_RESULT;
  }
  const parsed: string[] = mapCheckOps(ops, instructions);
  if (
    parsed[2] != "0x64" ||
    parsed[7] !=
      "0x23b872dd00000000000000000000000000000000000000000000000000000000" ||
    parsed[11] != "0x04"
  )
    return NULL_TRANSFER_RESULT;
  const result: TransferResult = new TransferResult(true, disassembly.slice(parsed.length), new TransferResultData(getAddress(parsed[5]), getAddress(parsed[10]), getAddress(parsed[13]), parsed[16]));
  return result;
}

export function parseSendEther(disassembly: Instruction[]): TailResult {
  const ops = disassembly.slice();
  const instructions = [
    "PUSH1",
    "PUSH1",
    "PUSH1",
    "PUSH1",
    "PUSH",
    "PUSH",
    "GAS",
    "CALL",
    "AND",
  ];
  if (instructions.length > ops.length) return NULL_TAIL_RESULT;
  const parsed = mapCheckOps(ops, instructions);
  
  if (
    findString(parsed, (v: string, i: i32, ary: string[]) => v == "false") == "false" ||
    findString(parsed.slice(0, 4), (v: string, i: i32, ary: string[]) => v != "0x00") != ''
  )
    return NULL_TAIL_RESULT;
  const result: TailResult = new TailResult(true, disassembly.slice(parsed.length));
  return result;
}
