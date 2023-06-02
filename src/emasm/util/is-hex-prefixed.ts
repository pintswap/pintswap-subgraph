"use strict";

const isHexPrefixed = (s: any): any => s.substr(0, 2) === "0x";

export default isHexPrefixed;
