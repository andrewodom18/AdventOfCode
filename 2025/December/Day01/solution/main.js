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

// ---------- Main Program ----------
function main() {
  const startTotal = Date.now();

  const filePath = process.argv[2] || "data/input.csv";
  if (!fs.existsSync(filePath)) {
    console.error(`Input file not found: ${filePath}`);
    process.exit(1);
  }

  let dial = 50;
  let part1ZeroCount = 0;
  let part2ZeroCount = 0;

  const startProcessing = Date.now();
  const lines = fs.readFileSync(filePath, "utf8").split("\n");

  for (const line of lines) {
    if (!line.trim()) continue;

    const direction = line[0];
    const distance = parseInt(line.slice(1), 10);

    let hits = 0;

    if (direction === "L") {
      hits = countZeroClicksLeft(dial, distance);
      dial -= distance;
    } else if (direction === "R") {
      hits = countZeroClicksRight(dial, distance);
      dial += distance;
    } else {
      throw new Error(`Invalid direction: ${direction}`);
    }

    part2ZeroCount += hits;

    // Normalize dial to [0, 99]
    dial %= 100;
    if (dial < 0) dial += 100;

    if (dial === 0) part1ZeroCount++;
  }

  const processingTime = Date.now() - startProcessing;
  const totalTime = Date.now() - startTotal;

  console.log("\n========= Answers =========");
  console.log(`Part 1 password: ${part1ZeroCount}`);
  console.log(`Part 2 password: ${part2ZeroCount}`);

  console.log("\n========= Timings =========");
  console.log(`Processing time: ${processingTime} ms`);
  console.log(`Total runtime: ${totalTime} ms\n`);
}

main();
