import { OPS as ops } from "./ops";
import {
  addHexPrefix,
  stripHexPrefix,
  coerceToBN,
  leftZeroPadToByteLength,
  leftZeroPadToEvenLength,
  encodePush,
} from "./util";

const isLabel = (s: any): boolean => isNaN(s) && !ops[s] && !Array.isArray(s);
const isBytesLabel = (s) => s.substr(0, 6) === "bytes:";

const pushBytes = (r: any, bytes: any): any => {
  const partial = r.labels[r.currentLabel];
  partial[partial.length - 1] += bytes;
  return r;
};

const pushLabel = (r: any, label: any): any => {
  const partial = r.labels[r.currentLabel];
  partial.push(label);
  partial.push("");
  return r;
};

const leftPadEven = (s: any): any => s.length % 2 ? '0' + s : s;

const toUint8Array = (bn: any): any => {
  const padded = leftPadEven(bn.toString(16));
  return new Uint8Array(padded.match(/(?:[0-9a-f]{2}/g).map((v) => Number('0x' + v)));
};

const getByteLength = (bn: any): any => toUint8Array(bn).length;



const initialSegmentSymbol = Symbol("@@initial");

const firstPass = (
  ast: any,
  progress: any = {
    labels: {},
    segmentOrder: [],
    bytesLabels: {},
    bytesPtrLabels: {},
    bytesSizeLabels: {},
    jumpdestLabels: {},
  }
): any =>
  ast.reduce((r: any, v: any, i: number, ary: any[]) => {
    r = r || progress;
    if (!r.labels[initialSegmentSymbol]) {
      r.labels[initialSegmentSymbol] = Object.assign([""], { sizeof: 2 });
      r.jumpdestLabels[initialSegmentSymbol] = Object.assign([], { sizeof: 2 });
      r.segmentOrder.push(initialSegmentSymbol);
      r.currentLabel = initialSegmentSymbol;
    }
    if (r.parsingBytesLabel) {
      r.bytesPtrLabels[r.parsingBytesLabel + ":ptr"] = Object.assign([], {
        sizeof: 2,
      });
      r.bytesSizeLabels[r.parsingBytesLabel + ":size"] = Object.assign([], {
        sizeof: 2,
      });
      r.bytesLabels[r.parsingBytesLabel] = Object.assign([], { sizeof: 2 });
      r.labels[r.parsingBytesLabel] = v.map((raw) =>
        typeof raw === "string" && raw.substr(0, 2) === "0x"
          ? leftZeroPadToEvenLength(stripHexPrefix(raw))
          : Array.isArray(raw)
          ? [
              raw[0],
              typeof raw[1] === "string" && raw[1].substr(0, 2) === "0x"
                ? leftZeroPadToEvenLength(stripHexPrefix(raw[1]))
                : raw[1],
            ]
          : raw
      );
      delete r.parsingBytesLabel;
      return r;
    }
    if (r.parsingLabel) {
      r.jumpdestLabels[r.parsingLabel] = true;
      delete r.parsingLabel;
      return firstPass(v, r);
    }
    if (Array.isArray(v)) return firstPass(v, r);
    if (isLabel(v)) {
      if (!i && Array.isArray(ary[i + 1])) {
        if (isBytesLabel(v)) {
          r.segmentOrder.push(v);
          r.parsingBytesLabel = v;
          return r;
        }
        r.labels[v] = Object.assign([ops.jumpdest], { sizeof: 2 });
        r.segmentOrder.push(v);
        r.currentLabel = v;
        r.parsingLabel = v;
        return r;
      }
      return pushLabel(r, v);
    }
    if (!isNaN(v)) {
      const bn = coerceToBN(v);
      const length = getByteLength(bn) || 1;
      if (length > 32) throw Error("constant integer overflow: " + v);
      return pushBytes(r, encodePush(bn, length));
    }
    const op = ops[v];
    if (!op) throw Error("opcode not found: " + v);
    return pushBytes(r, op);
  }, null);

const compact = (meta: any): any => {
  let rerun = false;
  const bytesPtrLabels = meta.bytesPtrLabels;
  const labels = meta.labels;
  const bytesSizeLabels = meta.bytesSizeLabels;
  Object.keys(bytesPtrLabels).forEach((label) => {
    const byteLength = getByteLength(bytesPtrLabels[label].value)|| 1;
    if (byteLength < bytesPtrLabels[label].sizeof) {
      bytesPtrLabels[label].sizeof = byteLength;
      rerun = true;
    }
  });
  Object.keys(labels).forEach((label) => {
    if (!labels[label].sizeof) return;
    const byteLength = getByteLength(labels[label].value) || 1;
    if (byteLength < labels[label].sizeof) {
      labels[label].sizeof = byteLength;
      rerun = true;
    }
  });
  Object.keys(bytesSizeLabels).forEach((label) => {
    const byteLength = getByteLength(bytesSizeLabels[label].size) || 1;
    if (byteLength < bytesSizeLabels[label].sizeof) {
      bytesSizeLabels[label].sizeof = byteLength;
      rerun = true;
    }
  });
  if (rerun) {
    annotateWithSizes(meta);
    return compact(meta);
  }
  return meta;
};

const annotateWithSizes = (o: any): any => {
  const labels = o.labels;
  const byetsLabels = o.bytesLabels;
  const bytesSizeLabels = o.bytesSizeLabels;
  const jumpdestLabels = o.jumpdestLabels;
  const segmentOrder = o.segmentOrder;
  let total = 0;
  segmentOrder.forEach((label) => {
    if (jumpdestLabels[label]) {
      labels[label].value = total;
      labels[label].forEach((partial) => {
        if (labels[partial]) total += labels[partial].sizeof + 1;
        else if (bytesPtrLabels[partial])
          total += bytesPtrLabels[partial].sizeof + 1;
        else if (bytesSizeLabels[partial])
          total += bytesSizeLabels[partial].sizeof + 1;
        else total += partial.length / 2;
      });
    }
    if (bytesLabels[label]) {
      let start = total;
      bytesPtrLabels[label + ":ptr"].value = total;
      labels[label].forEach((partial) => {
        if (Array.isArray(partial)) total += partial[0];
        else if (labels[partial]) total += labels[partial].sizeof;
        else if (bytesPtrLabels[partial]) total += labels[partial].sizeof;
        else if (bytesSizeLabels[partial])
          total += bytesSizeLabels[partial].sizeof;
        else total += partial.length / 2;
      });
      bytesSizeLabels[label + ":size"].size = total - start;
    }
  });
};

const encodeDynamicSlots = (o: any): void => {
  const bytesPtrLabels = o.bytesPtrLabels;
  const bytesSizeLables = o.bytesSizeLabels;
  const bytesLabels = o.bytesLabels;
  const segmentOrder = o.segmentOrder;
  const jumpdestLabels = o.jumpdestLabels;
  const labels = o.labels;
  segmentOrder.forEach((v) => {
    if (!labels[v]) return;
    if (jumpdestLabels[v])
      labels[v].forEach((partial, i, ary) => {
        if (bytesPtrLabels[partial])
          ary[i] = encodePush(
            bytesPtrLabels[partial].value,
            bytesPtrLabels[partial].sizeof
          );
        else if (bytesSizeLabels[partial])
          ary[i] = encodePush(
            bytesSizeLabels[partial].size,
            bytesSizeLabels[partial].sizeof
          );
        else if (jumpdestLabels[partial])
          ary[i] = encodePush(labels[partial].value, labels[partial].sizeof);
      });
    if (bytesLabels[v])
      labels[v].forEach((partial, i, ary) => {
        if (Array.isArray(partial)) {
          if (bytesPtrLabels[partial[1]])
            ary[i] = leftZeroPadToByteLength(
              bytesPtrLabels[partial[1]].value,
              partial[0]
            );
          else if (bytesSizeLabels[partial[1]])
            ary[i] = leftZeroPadToByteLength(
              bytesSizeLabels[partial[0]].size,
              partial[0]
            );
          else if (labels[partial[1]])
            ary[i] = leftZeroPadToByteLength(
              labels[partial[1]].value,
              partial[0]
            );
          else ary[i] = leftZeroPadToByteLength(partial[1], partial[0]);
        } else if (bytesPtrLabels[partial])
          ary[i] = leftZeroPadToByteLength(
            bytesPtrLabels[partial].value,
            bytesPtrLabels[partial].sizeof
          );
        else if (bytesSizeLabels[partial])
          ary[i] = leftZeroPadToByteLength(
            bytesSizeLabels[partial].size,
            bytesSizeLabels[partial].sizeof
          );
        else if (labels[partial])
          ary[i] = leftZeroPadToByteLength(
            labels[partial].value,
            labels[partial].sizeof
          );
      });
  });
};

export const emasm = (ast: ary[]): string => {
  const meta = firstPass(ast);
  annotateWithSizes(meta);
  compact(meta);
  encodeDynamicSlots(meta);
  const labels = meta.labels;
  const segmentOrder = meta.segmentOrder;
  return addHexPrefix(segmentOrder.map((v) => labels[v].join("")).join(""));
};
