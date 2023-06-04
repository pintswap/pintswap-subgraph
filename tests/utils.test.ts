import {
  assert,
  describe,
  test,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { ethereum } from "@graphprotocol/graph-ts";
import { stripHexPrefix } from "../src/evmdis";

describe("utils", () => {
  test("stripHexPrefix(s: string): string", () => {
    assert.equals(ethereum.Value.fromString(stripHexPrefix("0x5000")), ethereum.Value.fromString("5000"));
  });
});
