#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE' >&2
Usage:
  # Direct paths
  ./run_kt.sh path/to/solution/main.kt path/to/data/input.csv

  # By year/month/day (Auto-resolves to solution/main.kt and data/input.csv)
  ./run_kt.sh <year> <month> <day>
USAGE
  exit 1
}

if [[ $# -eq 0 || $# -gt 3 || $# -eq 1 ]]; then
  usage
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODE=""

if [[ $# -eq 2 ]]; then
  MODE="direct"
  KT_PATH="$1"
  CSV_PATH="$2"
elif [[ $# -eq 3 ]]; then
  MODE="day"
  YEAR="$1"
  MONTH_RAW="$2"
  DAY_INPUT="$3"

  if [[ ! "$DAY_INPUT" =~ ^[0-9]+$ ]]; then
    echo "Day must be numeric (got: $DAY_INPUT)" >&2
    exit 1
  fi

  MONTH="$(printf "%s" "$MONTH_RAW" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')"
  DAY_DIR="$(printf "Day%02d" "$DAY_INPUT")"

  KT_PATH="${YEAR}/${MONTH}/${DAY_DIR}/solution/main.kt"
  CSV_PATH="${YEAR}/${MONTH}/${DAY_DIR}/data/input.csv"
else
  usage
fi

KT_ABS="$(cd "$SCRIPT_DIR" && cd "$(dirname "$KT_PATH")" && pwd)/$(basename "$KT_PATH")"
CSV_ABS="$(cd "$SCRIPT_DIR" && cd "$(dirname "$CSV_PATH")" && pwd)/$(basename "$CSV_PATH")"

if [[ ! -f "$KT_ABS" ]]; then
  echo "Kotlin file not found: $KT_ABS" >&2
  exit 1
fi

if [[ ! -f "$CSV_ABS" ]]; then
  echo "Input file not found: $CSV_ABS" >&2
  exit 1
fi

JAR_PATH="${TMPDIR:-/tmp}/$(basename "$KT_PATH" .kt).jar"

echo "Compiling $KT_ABS -> $JAR_PATH"
kotlinc "$KT_ABS" -include-runtime -d "$JAR_PATH"

echo "Running with input $CSV_ABS"
java -jar "$JAR_PATH" "$CSV_ABS"


# Terminal Command: ./run_kt.sh year month day (I.e., ./run_kt.sh 2025 December 1)
#
# OR
#
# Terminal Command: ./run_kt.sh year/month/day/solution/main.kt year/month/day/data/input.csv