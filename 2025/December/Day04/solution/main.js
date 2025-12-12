const fs = require("fs");
const path = require("path");

function main() {
  const totalStart = Date.now();

  const filePath = process.argv[2] || "data/input.txt";
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Input file not found: ${filePath}`);
  }

  // Read grid once
  const grid = fs
    .readFileSync(resolvedPath, "utf8")
    .trimEnd()
    .split(/\r?\n/)
    .map((line) => line.split(""));

  const rows = grid.length;
  const columns = grid[0].length;

  // Directions for 8 neighbors (row, col pairs)
  const directions = [
    -1, -1, -1, 0, -1, 1,
    0, -1, 0, 1,
    1, -1, 1, 0, 1, 1
  ];

  let part1;
  let part2;

  // Part 1
  const part1Start = Date.now();
  let count = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      if (grid[row][col] !== "@") continue;

      let neighbors = 0;
      for (let i = 0; i < directions.length; i += 2) {
        const nr = row + directions[i];
        const nc = col + directions[i + 1];

        if (
          nr >= 0 && nr < rows &&
          nc >= 0 && nc < columns &&
          grid[nr][nc] === "@"
        ) {
          neighbors++;
        }
      }

      if (neighbors < 4) count++;
    }
  }

  part1 = count;
  const part1Time = Date.now() - part1Start;

  // Part 2
  const part2Start = Date.now();

  // Deep copy grid so it is editable
  const mutableGrid = grid.map((row) => row.slice());

  // Neighbor count grid
  const neighborCount = Array.from({ length: rows }, () =>
    Array(columns).fill(0)
  );

  function computeNeighbors(r, c) {
    let cnt = 0;
    for (let i = 0; i < directions.length; i += 2) {
      const nr = r + directions[i];
      const nc = c + directions[i + 1];
      if (
        nr >= 0 && nr < rows &&
        nc >= 0 && nc < columns &&
        mutableGrid[nr][nc] === "@"
      ) {
        cnt++;
      }
    }
    return cnt;
  }

  // Initialize neighbor counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      if (mutableGrid[r][c] === "@") {
        neighborCount[r][c] = computeNeighbors(r, c);
      }
    }
  }

  let removedTotal = 0;
  let queue = [];

  // Store initially accessible paper rolls
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      if (
        mutableGrid[r][c] === "@" &&
        neighborCount[r][c] < 4
      ) {
        queue.push([r, c]);
      }
    }
  }

  // Iterative removal
  while (queue.length > 0) {
    const nextQueue = [];

    for (const [r, c] of queue) {
      if (mutableGrid[r][c] !== "@") continue;

      // Remove paper roll
      mutableGrid[r][c] = ".";
      removedTotal++;

      // Update neighbors
      for (let i = 0; i < directions.length; i += 2) {
        const nr = r + directions[i];
        const nc = c + directions[i + 1];

        if (
          nr >= 0 && nr < rows &&
          nc >= 0 && nc < columns &&
          mutableGrid[nr][nc] === "@"
        ) {
          neighborCount[nr][nc]--;

          // If it just became accessible
          if (neighborCount[nr][nc] === 3) {
            nextQueue.push([nr, nc]);
          }
        }
      }
    }

    queue = nextQueue;
  }

  part2 = removedTotal;
  const part2Time = Date.now() - part2Start;

  console.log("\n========= Answers =========");
  console.log(`Part 1: ${part1}`);
  console.log(`Part 2: ${part2}`);

  console.log("\n========= Timings =========");
  console.log(`Part 1 Time: ${part1Time}ms`);
  console.log(`Part 2 Time: ${part2Time}ms`);

  const totalTime = Date.now() - totalStart;
  console.log(`\nTotal Runtime: ${totalTime} ms\n`);
}

main();
