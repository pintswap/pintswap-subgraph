"use strict";

import isHexPrefixed from "./is-hex-prefixed";
import stripHexPrefix from "./strip-hex-prefix";

const coerceToBN = (n: any): BigInt => {
  switch (typeof n) {
    case "number":
      return BigInt(n);
    case "string":
      if (isHexPrefixed(n)) return BigInt('0x' + stripHexPrefix(n));
      return BigInt(n);
    default:
      throw Error("Invalid argument to coerceToBN: " + n);
  }
};

export default coerceToBN;
