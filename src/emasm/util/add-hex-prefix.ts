"use strict";

const addHexPrefix = (s: any): any => (s.substr(0, 2) === "0x" ? s : "0x" + s);

export default addHexPrefix;
