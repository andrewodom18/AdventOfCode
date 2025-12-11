#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <year> <month> <day>" >&2
  echo "Example: $0 2025 December 5" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
YEAR="$1"
MONTH_RAW="$2"
DAY_INPUT="$3"

if [[ ! "$DAY_INPUT" =~ ^[0-9]+$ ]]; then
  echo "Day must be numeric (got: $DAY_INPUT)" >&2
  exit 1
fi

MONTH="$(printf "%s" "$MONTH_RAW" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')"
DAY_DIR="$(printf "Day%02d" "$DAY_INPUT")"

KT_REL="${YEAR}/${MONTH}/${DAY_DIR}/solution/main.kt"
CSV_REL="${YEAR}/${MONTH}/${DAY_DIR}/data/input.csv"

KT_PATH="${SCRIPT_DIR}/${KT_REL}"
CSV_PATH="${SCRIPT_DIR}/${CSV_REL}"

if [[ ! -f "$KT_PATH" ]]; then
  echo "Kotlin file not found: $KT_PATH" >&2
  exit 1
fi

if [[ ! -f "$CSV_PATH" ]]; then
  echo "CSV input not found: $CSV_PATH" >&2
  exit 1
fi

"$SCRIPT_DIR/run_kt.sh" "$KT_REL" "$CSV_REL"

# Terminal Command: ./run_day.sh year month day