"use strict";

import isHexPrefixed from "./is-hex-prefixed";
const stripHexPrefix = (s: string): string => (isHexPrefixed(s) ? s.substr(2) : s);

export default stripHexPrefix;
