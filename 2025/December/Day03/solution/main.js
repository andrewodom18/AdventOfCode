const fs = require("fs");
const path = require("path");

function main() {
  const totalStart = Date.now();

  const filePath = process.argv[2] || "data/input.csv";
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Input file not found: ${filePath}`);
  }

  const rows = fs
    .readFileSync(resolvedPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.length > 0);

  let part1 = 0n;
  let part2 = 0n;

  const part1Start = Date.now();
  for (const row of rows) {
    part1 += BigInt(computeTwoDigitValue(row));
  }
  const part1Time = Date.now() - part1Start;

  const part2Start = Date.now();
  for (const row of rows) {
    if (row.length >= 12) {
      part2 += largest12DigitValue(row);
    }
  }
  const part2Time = Date.now() - part2Start;

  console.log("\n========= Answers =========");
  console.log(`Part 1: ${part1.toString()}`);
  console.log(`Part 2: ${part2.toString()}`);

  console.log("\n========= Timings =========");
  console.log(`Part 1 Time: ${part1Time}ms`);
  console.log(`Part 2 Time: ${part2Time}ms`);

  const totalTime = Date.now() - totalStart;
  console.log(`\nTotal Runtime: ${totalTime} ms\n`);
}

// Find the largest two-digit number that can be formed in a row
function computeTwoDigitValue(row) {
  const length = row.length;
  if (length < 3) return 0;

  let max1 = "";
  let max1Idx = -1;

  for (let i = 0; i < length - 1; i++) {
    const char = row[i];
    if (char > max1) {
      max1 = char;
      max1Idx = i;
    }
  }

  if (max1Idx === -1) return 0;

  let max2 = "";
  for (let i = max1Idx + 1; i < length; i++) {
    const char = row[i];
    if (char > max2) {
      max2 = char;
    }
  }

  const d1 = max1.charCodeAt(0) - 48;
  const d2 = max2.charCodeAt(0) - 48;

  return d1 >= 0 && d1 <= 9 && d2 >= 0 && d2 <= 9 ? d1 * 10 + d2 : 0;
}

// Find the largest 12-digit number that can be formed in a row
function largest12DigitValue(row) {
  const k = 12;
  let toDrop = row.length - k;

  const stack = [];
  for (const char of row) {
    while (
      stack.length > 0 &&
      toDrop > 0 &&
      stack[stack.length - 1] < char
    ) {
      stack.pop();
      toDrop--;
    }
    stack.push(char);
  }

  let value = 0n;
  for (let i = 0; i < k; i++) {
    value = value * 10n + BigInt(stack[i].charCodeAt(0) - 48);
  }

  return value;
}

main();
