set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <path/to/file.kt> <path/to/input.csv>" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KT_PATH="$1"
CSV_PATH="$2"

KT_ABS="$(cd "$SCRIPT_DIR" && cd "$(dirname "$KT_PATH")" && pwd)/$(basename "$KT_PATH")"
CSV_ABS="$(cd "$SCRIPT_DIR" && cd "$(dirname "$CSV_PATH")" && pwd)/$(basename "$CSV_PATH")"

JAR_PATH="${TMPDIR:-/tmp}/$(basename "$KT_PATH" .kt).jar"

echo "Compiling $KT_ABS -> $JAR_PATH"
kotlinc "$KT_ABS" -include-runtime -d "$JAR_PATH"

echo "Running with input $CSV_ABS"
java -jar "$JAR_PATH" "$CSV_ABS"


# Terminal Command: ./run_kt.sh year/month/day/solution/main.kt year/month/day/data/input.csv