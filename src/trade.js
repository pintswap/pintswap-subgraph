"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSendEther = exports.parseTransferFrom = exports.parsePermit = exports.parseWithdraw = exports.parseTrade = exports.parseTransfer = exports.parsePermit2 = exports.toWETH = exports.stripHexPrefix = void 0;
var WETH_1 = require("./WETH");
var evmdis = require("./evmdis");
var evmdis_1 = require("./evmdis");
var TransferResultData = /** @class */ (function () {
    function TransferResultData(token, to, from, amount) {
        this.token = token;
        this.to = to;
        this.from = from;
        this.amount = amount;
    }
    return TransferResultData;
}());
var TransferResult = /** @class */ (function () {
    function TransferResult(success, tail, data) {
        this.success = success;
        this.tail = tail;
        this.data = data;
    }
    return TransferResult;
}());
var Offer = /** @class */ (function () {
    function Offer(token, amount) {
        this.token = token;
        this.amount = amount;
    }
    return Offer;
}());
var ParseTradeResult = /** @class */ (function () {
    function ParseTradeResult(success, gets, gives, maker, taker, chainId) {
        this.success = success;
        this.gets = gets;
        this.gives = gives;
        this.maker = maker;
        this.taker = taker;
        this.chainId = chainId;
    }
    return ParseTradeResult;
}());
var TailResult = /** @class */ (function () {
    function TailResult(success, tail) {
        this.success = success;
        this.tail = tail;
    }
    return TailResult;
}());
var NULL_TRADE_RESULT = new ParseTradeResult(false, new Offer("", ""), new Offer("", ""), "", "", 0);
var NULL_TRANSFER_RESULT = new TransferResult(false, [], new TransferResultData("", "", "", ""));
var NULL_TAIL_RESULT = new TailResult(false, []);
var stripHexPrefix = function (s) {
    return s.substr(0, 2) === "0x" ? s.substr(2) : s;
};
exports.stripHexPrefix = stripHexPrefix;
var zeroPadBytes = function (v, n) {
    var fixed = (0, evmdis_1.addHexPrefix)((0, exports.stripHexPrefix)(v));
    return fixed + "0".repeat(2 * (((fixed.length / 2) - n)));
};
var getAddress = function (v) { return v; };
var toWETH = function (chainId) {
    if (!chainId)
        chainId = 1;
    var address = WETH_1.WETH_ADDRESSES.get(chainId) || "";
    return address;
};
exports.toWETH = toWETH;
var checkOp = function (ary, op) {
    var item = ary.splice(0, 1)[0] || [];
    var opCode = item[0];
    var operand = item[2];
    if (!opCode)
        return "false";
    if (op === "ANY" ||
        (op === "PUSH" && opCode.substr(0, 4) === "PUSH") ||
        opCode === op)
        return operand || "";
    else
        return "false";
};
var mapCheckOps = function (ary, ops) {
    var result = [];
    for (var i = 0; i < ops.length; i++) {
        result.push(checkOp(ary, ops[i]));
    }
    return result;
};
var parsePermit2 = function (disassembly, first) {
    if (!first)
        first = false;
    var ops = disassembly.slice();
    var parsed = mapCheckOps(disassembly, [
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
    ]);
    if (findString(parsed, function (v, i, ary) { return v === "false"; }) ===
        "false" ||
        parsed[2] !== "0x0184" ||
        parsed[5] !== "0x22d473030f116ddee9f6b43ac78ba3" ||
        parsed[7] !==
            "0x30f28b7a00000000000000000000000000000000000000000000000000000000")
        return NULL_TRANSFER_RESULT;
    var result = new TransferResult(true, disassembly.slice(parsed.length), new TransferResultData(getAddress(parsed[10]), parsed[22] === "0x" ? "CALLER" : getAddress(parsed[22]), getAddress(parsed[28]), parsed[13]));
    return result;
};
exports.parsePermit2 = parsePermit2;
function parseTransfer(disassembly, chainId, first) {
    if (!first)
        first = false;
    if (!chainId)
        chainId = 1;
    var transferFrom = parseTransferFrom(disassembly, first);
    var transfer = !transferFrom.success
        ? (0, exports.parsePermit2)(disassembly, first)
        : NULL_TRANSFER_RESULT;
    if (!transfer.success && !transferFrom.success)
        return NULL_TRANSFER_RESULT;
    var withdraw = transfer.success && transfer.data.token === getAddress((0, exports.toWETH)(chainId))
        ? parseWithdraw(transfer.tail, false)
        : NULL_TAIL_RESULT;
    var sendEther = withdraw.success
        ? parseSendEther(withdraw.tail)
        : NULL_TAIL_RESULT;
    if (transfer.success &&
        transfer.data.token === getAddress((0, exports.toWETH)(chainId)) &&
        !(sendEther.success && withdraw.success))
        return NULL_TRANSFER_RESULT;
    var transferData = transferFrom.success ? transferFrom : transfer;
    var tail = sendEther.success
        ? sendEther.tail
        : transfer.success
            ? transfer.tail
            : transferFrom.success
                ? transferFrom.tail
                : NULL_TAIL_RESULT.tail;
    var result = new TransferResult(true, tail, transferData.data);
    return result;
}
exports.parseTransfer = parseTransfer;
;
function findString(ary, fn) {
    var i = ary.findIndex(fn);
    if (~i)
        return ary[i];
    else
        return "";
}
function parseTrade(bytecode, chainId) {
    if (!chainId)
        chainId = 1;
    var disassembly = evmdis.disassemble(bytecode);
    var firstPermit = parsePermit(disassembly, true);
    var secondPermit = firstPermit.success
        ? parsePermit(firstPermit.tail, false)
        : NULL_TAIL_RESULT;
    var firstTransfer = parseTransfer(secondPermit.success
        ? secondPermit.tail
        : firstPermit.success
            ? firstPermit.tail
            : disassembly, chainId, !firstPermit.success);
    if (!firstTransfer)
        return NULL_TRADE_RESULT;
    var secondTransfer = parseTransfer(firstTransfer.tail, chainId, false);
    if (!secondTransfer)
        return NULL_TRADE_RESULT;
    var ops = secondTransfer.tail.slice();
    var parsed = mapCheckOps(ops, [
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
    if (findString(parsed, function (v, i, ary) { return v === "false"; }) ===
        "" ||
        findString(parsed.slice(6, 7), function (v, i, ary) { return v !== "0x00"; }) !== "")
        return NULL_TRADE_RESULT;
    var tail = ops.slice(parsed.length);
    if (tail.length !== 0)
        return NULL_TRADE_RESULT;
    var taker = firstTransfer.data.from;
    var maker = secondTransfer.data.from;
    var gets = new Offer(firstTransfer.data.token, firstTransfer.data.amount);
    var gives = new Offer(secondTransfer.data.token, secondTransfer.data.amount);
    var result = new ParseTradeResult(true, gets, gives, taker, maker, chainId);
    return result;
}
exports.parseTrade = parseTrade;
function parseWithdraw(disassembly, chainId, first) {
    if (!chainId)
        chainId = 1;
    if (!first)
        first = false;
    var ops = disassembly.slice();
    var instructions = [
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
    if (!first)
        instructions.push("AND");
    var parsed = mapCheckOps(ops, instructions);
    if (parsed[2] !== "0x24" ||
        getAddress(parsed[5]) !== getAddress((0, exports.toWETH)(chainId)) ||
        parsed[7] !==
            "0x2e1a7d4d00000000000000000000000000000000000000000000000000000000" ||
        parsed[11] !== "0x04")
        return NULL_TAIL_RESULT;
    var result = new TailResult(true, disassembly.slice(parsed.length));
    return result;
}
exports.parseWithdraw = parseWithdraw;
;
function parsePermit(disassembly, first) {
    if (!first)
        first = false;
    var ops = disassembly.slice();
    var instructions = [
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
    if (!first)
        instructions.push("AND");
    var parsed = mapCheckOps(ops, instructions);
    if (parsed[2] !== "0xe4" ||
        parsed[7] !==
            "0xd505accf00000000000000000000000000000000000000000000000000000000" ||
        parsed[11] !== "0x04")
        return NULL_TAIL_RESULT;
    var result = new TailResult(true, disassembly.slice(parsed.length));
    return result;
}
exports.parsePermit = parsePermit;
function parseTransferFrom(disassembly, first) {
    if (!first)
        first = false;
    var ops = disassembly.slice();
    var instructions = [
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
    if (!first)
        instructions.push("AND");
    var parsed = mapCheckOps(ops, instructions);
    if (parsed[2] !== "0x64" ||
        parsed[7] !==
            "0x23b872dd00000000000000000000000000000000000000000000000000000000" ||
        parsed[11] !== "0x04")
        return NULL_TRANSFER_RESULT;
    var result = new TransferResult(false, disassembly.slice(parsed.length), new TransferResultData(getAddress(parsed[5]), getAddress(parsed[10]), getAddress(parsed[13]), parsed[16]));
    return result;
}
exports.parseTransferFrom = parseTransferFrom;
function parseSendEther(disassembly) {
    var ops = disassembly.slice();
    var parsed = mapCheckOps(ops, [
        "PUSH1",
        "PUSH1",
        "PUSH1",
        "PUSH1",
        "PUSH",
        "PUSH",
        "GAS",
        "CALL",
        "AND",
    ]);
    if (findString(parsed, function (v, i, ary) { return v === "false"; }) === "false" ||
        findString(parsed.slice(0, 4), function (v, i, ary) { return v !== "0x00"; }) === '')
        return NULL_TAIL_RESULT;
    var result = new TailResult(true, disassembly.slice(parsed.length));
    return result;
}
exports.parseSendEther = parseSendEther;
