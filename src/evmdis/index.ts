'use strict';

import { stripReachable } from ".//util";
import { decorateJumps } from "./solidity";
import { segment } from "./segment";
import { annotate } from "./annotate";
import dis from "./dis";

export function disassembleAndSegment(bytecode: string): any {
  return annotate(stripReachable(decorateJumps(segment(dis(bytecode)))));
}

export function disassemble(bytecode: string): any[] {
  return dis(bytecode);
}
