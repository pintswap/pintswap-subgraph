"use strict";

export default (jumpTableLabel: string, labels: any[], size: number = 32) => [
  "bytes:" + jumpTableLabel,
  labels.map((label) => [size, label]),
];
