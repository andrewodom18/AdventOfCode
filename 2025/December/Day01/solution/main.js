const fs = require("fs");

// ---------- Zero-count helpers ----------
function countZeroClicksRight(start, distance) {
  const s = start % 100;
  const stepsToZero = (s === 0 ? 100 : 100 - s);
  if (distance < stepsToZero) return 0;
  return 1 + Math.floor((distance - stepsToZero) / 100);
}

function countZeroClicksLeft(start, distance) {
  const s = start % 100;
  const stepsToZero = (s === 0 ? 100 : s);
  if (distance < stepsToZero) return 0;
  return 1 + Math.floor((distance - stepsToZero) / 100);
}

function measureTimeMillis(fn) {
  const start = Date.now();
  const result = fn();
  return { time: Date.now() - start, result };
}

// ---------- Main Program ----------
function main() {
  const startTotal = Date.now();

  const filePath = process.argv[2] || "data/input.csv";
  if (!fs.existsSync(filePath)) {
    console.error(`Input file not found: ${filePath}`);
    process.exit(1);
  }

  const instructions = fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => ({
      direction: line[0],
      distance: parseInt(line.slice(1), 10),
    }))
    .map(({ direction, distance }) => {
      if (direction !== "L" && direction !== "R") {
        throw new Error(`Invalid direction: ${direction}`);
      }
      return { direction, distance };
    });

  const { time: part1Time, result: part1ZeroCount } = measureTimeMillis(() => {
    let dial = 50;
    let count = 0;
    for (const { direction, distance } of instructions) {
      dial = direction === "L" ? dial - distance : dial + distance;
      dial %= 100;
      if (dial < 0) dial += 100;
      if (dial === 0) count++;
    }
    return count;
  });

  const { time: part2Time, result: part2ZeroCount } = measureTimeMillis(() => {
    let dial = 50;
    let hitsTotal = 0;
    for (const { direction, distance } of instructions) {
      const hits =
        direction === "L"
          ? countZeroClicksLeft(dial, distance)
          : countZeroClicksRight(dial, distance);

      hitsTotal += hits;
      dial = direction === "L" ? dial - distance : dial + distance;
      dial %= 100;
      if (dial < 0) dial += 100;
    }
    return hitsTotal;
  });

  const processingTime = part1Time + part2Time;
  const totalTime = Date.now() - startTotal;

  console.log("\n========= Answers =========");
  console.log(`Part 1: ${part1ZeroCount}`);
  console.log(`Part 2: ${part2ZeroCount}`);

  console.log("\n========= Timings =========");
  console.log(`Part 1 Time: ${part1Time} ms`);
  console.log(`Part 2 Time: ${part2Time} ms`);
  console.log(`Processing Time: ${processingTime} ms`);
  console.log(`Total Runtime: ${totalTime} ms\n`);
}

main();
