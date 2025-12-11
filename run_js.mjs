import { existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

function usage() {
  console.error(`
Usage:
  # Direct paths
  ./run_js.mjs path/to/solution/main.js path/to/data/input.csv

  # By year/month/day (Auto-resolves paths)
  ./run_js.mjs <year> <month> <day>
`);
  process.exit(1);
}

const argv = process.argv.slice(2);

if (argv.length !== 2 && argv.length !== 3) {
  usage();
}

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
let JS_PATH = "";
let CSV_PATH = "";

if (argv.length === 2) {
  JS_PATH = argv[0];
  CSV_PATH = argv[1];
}

if (argv.length === 3) {
  const [YEAR, MONTH_RAW, DAY_INPUT] = argv;

  if (!/^[0-9]+$/.test(DAY_INPUT)) {
    console.error(`Day must be numeric (got: ${DAY_INPUT})`);
    process.exit(1);
  }

  const MONTH = MONTH_RAW.charAt(0).toUpperCase() + MONTH_RAW.slice(1).toLowerCase();
  const DAY_DIR = `Day${String(DAY_INPUT).padStart(2, "0")}`;

  JS_PATH = `${YEAR}/${MONTH}/${DAY_DIR}/solution/main.js`;
  CSV_PATH = `${YEAR}/${MONTH}/${DAY_DIR}/data/input.csv`;
}

// Absolute paths
const JS_ABS = resolve(SCRIPT_DIR, JS_PATH);
const CSV_ABS = resolve(SCRIPT_DIR, CSV_PATH);

if (!existsSync(JS_ABS)) {
  console.error(`JavaScript file not found: ${JS_ABS}`);
  process.exit(1);
}

if (!existsSync(CSV_ABS)) {
  console.error(`Input file not found: ${CSV_ABS}`);
  process.exit(1);
}

console.log(`Running ${JS_ABS} with input ${CSV_ABS}\n`);

const result = spawnSync("node", [JS_ABS, CSV_ABS], {
  stdio: "inherit",
});

if (result.error) {
  console.error("Error running solution:", result.error);
  process.exit(1);
}

// Terminal Command: node run_js.mjs year month day (I.e., node run_js.mjs 2025 December 1)
//
// OR
//
// Terminal Command: node run_js.mjs year/month/day/solution/main.js year/month/day/data/input.csv