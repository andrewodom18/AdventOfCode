const fs = require("fs");
const path = require("path");

function main() {
  const totalStart = Date.now();

  const filePath = process.argv[2] || "data/input.csv";
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Input file not found: ${filePath}`);
  }

  const lines = fs.readFileSync(resolvedPath, "utf8").split(/\r?\n/);

  // Find the blank line separating ranges and ingredient ids
  const blankIndex = lines.findIndex((line) => line.trim() === "");
  const rangeLines = lines.slice(0, blankIndex);
  const idLines = lines.slice(blankIndex + 1).filter((l) => l.length > 0);

  // Parse range lines (e.g. "3-5") into [3, 5]
  const ranges = rangeLines.map((line) => {
    const [a, b] = line.split("-").map((v) => BigInt(v.trim()));
    return [a, b];
  });

  // Sort ranges by starting value
  const sorted = ranges.slice().sort((a, b) =>
    a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
  );

  let merged = [];

  let part1 = 0n;
  let part2 = 0n;

  // ====================
  // Part 1
  // ====================
  const part1Start = Date.now();

  for (const idLine of idLines) {
    const id = BigInt(idLine);
    if (ranges.some(([start, end]) => id >= start && id <= end)) {
      part1++;
    }
  }

  const part1Time = Date.now() - part1Start;

  // Part 2
  const part2Start = Date.now();

  let [curStart, curEnd] = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const [start, end] = sorted[i];

    if (start <= curEnd + 1n) {
      // Overlapping or adjacent
      if (end > curEnd) curEnd = end;
    } else {
      merged.push([curStart, curEnd]);
      curStart = start;
      curEnd = end;
    }
  }

  // Add last merged range
  merged.push([curStart, curEnd]);

  // Sum sizes of merged ranges
  for (const [start, end] of merged) {
    part2 += end - start + 1n;
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

main();
