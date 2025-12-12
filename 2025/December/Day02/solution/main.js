const fs = require("fs");
const path = require("path");

function measureTimeMillis(fn) {
  const start = Date.now();
  const result = fn();
  return { time: Date.now() - start, result };
}

function numDigits(x) {
  if (x === 0n) return 1;
  let d = 0;
  let n = x;
  while (n !== 0n) {
    n /= 10n;
    d++;
  }
  return d;
}

function pow10(n) {
  let r = 1n;
  for (let i = 0; i < n; i++) r *= 10n;
  return r;
}

// Builds a number by repeating pattern p, k times (e.g., p=xyz, k=3 -> xyzxyzxyz)
function buildRepeated(p, k, pow10d) {
  let res = 0n;
  for (let i = 0; i < k; i++) {
    const next = res * pow10d + p;
    if (next < 0n) return BigInt(Number.MAX_SAFE_INTEGER); // overflow guard
    res = next;
  }
  return res;
}

// Merge overlapping or contiguous ranges
function mergeRanges(ranges) {
  const sorted = ranges.sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const merged = [];

  let [cs, ce] = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const [s, e] = sorted[i];
    if (s <= ce) {
      if (e > ce) ce = e;
    } else {
      merged.push([cs, ce]);
      cs = s;
      ce = e;
    }
  }
  merged.push([cs, ce]);
  return merged;
}

// Sum values that fall inside any provided range
function sumInsideRanges(values, ranges) {
  const sortedVals = Array.from(values).sort((a, b) => (a < b ? -1 : 1));
  let sum = 0n;
  let idx = 0;

  for (const v of sortedVals) {
    while (idx < ranges.length && v > ranges[idx][1]) idx++;
    if (idx >= ranges.length) break;
    const [s, e] = ranges[idx];
    if (v >= s && v <= e) sum += v;
  }
  return sum;
}

const { time: totalTime } = measureTimeMillis(() => {
  const filePath = process.argv[2] || "data/input.csv";
  const inputFile = path.resolve(filePath);

  if (!fs.existsSync(inputFile)) {
    throw new Error(`Input file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(inputFile, "utf8").trim();

  const ranges = raw
    .split(",")
    .map(token => token.trim().split("-"))
    .filter(parts => parts.length === 2)
    .map(([s, e]) => [BigInt(s), BigInt(e)]);

  const merged = mergeRanges(ranges);
  const minStart = merged[0][0];
  const maxEnd = merged[merged.length - 1][1];

  const maxDigits = numDigits(maxEnd);

  const part1Set = new Set();
  const part2Set = new Set();

  const { time: part1Time } = measureTimeMillis(() => {
    for (let L = 2; L <= maxDigits; L += 2) {
      const half = L / 2;
      const pow = pow10(half);
      const minHalf = pow / 10n;
      const maxHalf = pow - 1n;

      for (let p = minHalf; p <= maxHalf; p++) {
        const n = p * pow + p;
        if (n > maxEnd) break;
        if (n >= minStart) {
          part1Set.add(n);
          part2Set.add(n);
        }
      }
    }
  });

  const { time: part2Time } = measureTimeMillis(() => {
    for (let L = 2; L <= maxDigits; L++) {
      for (let k = 2; k <= L; k++) {
        if (L % k !== 0) continue;
        const d = L / k;
        if (d <= 0) continue;

        const pow = pow10(d);
        const minP = pow / 10n;
        const maxP = pow - 1n;

        for (let p = minP; p <= maxP; p++) {
          const n = buildRepeated(p, k, pow);
          if (n > maxEnd) break;
          if (n >= minStart) part2Set.add(n);
        }
      }
    }
  });

  const part1Answer = sumInsideRanges(part1Set, merged);
  const part2Answer = sumInsideRanges(part2Set, merged);

  console.log("\n========= Answers =========");
  console.log(`Part 1: ${part1Answer.toString()}`);
  console.log(`Part 2: ${part2Answer.toString()}`);

  console.log("\n========= Timings =========");
  console.log(`Part 1 Time: ${part1Time} ms`);
  console.log(`Part 2 Time: ${part2Time} ms`);
});

console.log(`Total Runtime: ${totalTime} ms\n`);
