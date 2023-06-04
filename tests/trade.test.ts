import {
  assert,
  describe,
  test,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import { parseTrade } from "../src/trade"
import { toByteArray } from "../src/evmdis";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0
const data = "0x583d60e43d3d73a0b86991c6218b36c1d19d4a2e9eb0ce3606eb485a7fd505accf0000000000000000000000000000000000000000000000000000000060005273bad7bd52dd2a31a7a9d4a9abbcb0556e26833fe460045230602452620f4240604452636478c6ce606452601c6084527f11638a393d2e0c5a335dbcf91610c8a10f7b43ac5a94906ce1daee5093295e6e60a4527f22f60e967861d41b4e5a0f1ec6864a756d1b929b98baa4c2106a377d5493294760c452f16000600060646000600073a0b86991c6218b36c1d19d4a2e9eb0ce3606eb485a7f23b872dd0000000000000000000000000000000000000000000000000000000060005273bad7bd52dd2a31a7a9d4a9abbcb0556e26833fe4600452731552b1a051430290f1b5e31f156e3cd501f520c3602452620f4240604452f11660006000610184600060006e22d473030f116ddee9f6b43ac78ba35a7f30f28b7a0000000000000000000000000000000000000000000000000000000060005273dac17f958d2ee523a2206206994597c13d831ec7600452620f4240602452636477761c604452636478c79c60645273bad7bd52dd2a31a7a9d4a9abbcb0556e26833fe4608452620f424060a452731552b1a051430290f1b5e31f156e3cd501f520c360c45261010060e4526041610104527f64b75d90acd7f70b608c6598e07bc99fd69c95222273960b244c641ae1ed80f3610124527f6311b27574957f4ee499a484408c64602f8955e9d55210d25b3356cd44ffd09d610144527f1b0000000000000000000000000000000000000000000000000000000000000061016452f1161561027457731552b1a051430290f1b5e31f156e3cd501f520c3ff5b60006000fd";

var wethData = "0x583d6101843d3d6e22d473030f116ddee9f6b43ac78ba35a7f30f28b7a0000000000000000000000000000000000000000000000000000000060005273c02aaa39b223fe8d0a0e5c4f27ead9083c756cc26004526658d15e1762800060245263646c002560445263646d51a5606452306084526658d15e1762800060a452737a8192079e2983c6ab03bbd6adde2f8f4cd625e560c45261010060e4526041610104527f50c93defd68873ab01f820bf6b046d4374033c611c62f30e88a027747b6f7ec7610124527f3257bf1e006ca6b1bbdc10a64156ed9684120b72ca9c7c752dff7f41a8709dfc610144527f1c0000000000000000000000000000000000000000000000000000000000000061016452f16000600060246000600073c02aaa39b223fe8d0a0e5c4f27ead9083c756cc25a7f2e1a7d4d000000000000000000000000000000000000000000000000000000006000526658d15e17628000600452f11660006000600060006658d15e1762800073367a633b010c906ae770b665c9a9df5b47b645475af11660006000610184600060006e22d473030f116ddee9f6b43ac78ba35a7f30f28b7a0000000000000000000000000000000000000000000000000000000060005273dac17f958d2ee523a2206206994597c13d831ec76004526302faf08060245263646c002c60445263646d51ac606452737a8192079e2983c6ab03bbd6adde2f8f4cd625e56084526302faf08060a45273367a633b010c906ae770b665c9a9df5b47b6454760c45261010060e4526041610104527fc5f36134c5abd44652e90476855b874e6de8b47655130ad41ceb2fbe02a6efef610124527f456610b0e62e2e5dda36b142de63ba6dea10035ea8735846a9a78fe83b76a988610144527f1b0000000000000000000000000000000000000000000000000000000000000061016452f116156102cb5773367a633b010c906ae770b665c9a9df5b47b64547ff5b60006000fd";

describe("trade.ts", () => {
  test("parseTrade", () => {
    const result = parseTrade(data, 1);
    assert.booleanEquals(result.success, true);
  })
  test("parseTrade (ETH)", () => {
    const wethResult = parseTrade(wethData, 1);
    assert.booleanEquals(wethResult.success, true);
  })
})
