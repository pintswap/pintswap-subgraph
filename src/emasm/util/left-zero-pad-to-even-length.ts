"use strict";

const leftZeroPadToEvenLength = (s: string): string => (s.length % 2 === 0 ? s : "0" + s);

export default leftZeroPadToEvenLength;
