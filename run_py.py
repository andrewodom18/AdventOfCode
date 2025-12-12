import sys
import os
import subprocess
from pathlib import Path


def usage():
    print(
        "Usage:\n"
        "  # Direct paths:\n"
        "  python3 run_py.py path/to/solution/main.py path/to/data/input.csv\n\n"
        "  # By year/month/day:\n"
        "  python3 run_py.py <year> <month> <day>"
    )
    sys.exit(1)

if len(sys.argv) not in {3, 4}:
    usage()

script_dir = Path(__file__).resolve().parent

if len(sys.argv) == 3:
    # Direct mode
    mode = "direct"
    py_path = Path(sys.argv[1])
    csv_path = Path(sys.argv[2])

elif len(sys.argv) == 4:
    # Day mode
    mode = "day"
    year = sys.argv[1]
    month_raw = sys.argv[2]
    day_input = sys.argv[3]

    if not day_input.isdigit():
        print(f"Day must be numeric (got: {day_input})", file=sys.stderr)
        sys.exit(1)

    # Capitalize first letter of month, lowercase rest
    month = month_raw.capitalize()

    day_dir = f"Day{int(day_input):02d}"

    py_path = Path(year) / month / day_dir / "solution" / "main.py"
    csv_path = Path(year) / month / day_dir / "data" / "input.csv"

else:
    usage()


# Resolve absolute paths
py_abs = (script_dir / py_path).resolve()
csv_abs = (script_dir / csv_path).resolve()

if not py_abs.is_file():
    print(f"Python solution file not found: {py_abs}", file=sys.stderr)
    sys.exit(1)

if not csv_abs.is_file():
    print(f"Input file not found: {csv_abs}", file=sys.stderr)
    sys.exit(1)


print(f"Running {py_abs} with input {csv_abs}")

try:
    subprocess.run(["python3", str(py_abs), str(csv_abs)], check=True)
except subprocess.CalledProcessError as e:
    print(f"Error while running {py_abs}", file=sys.stderr)
    sys.exit(e.returncode)

# Terminal Command: python3 run_py.py <year> <month> <day>. (I.e., python run_py.py 2025 December 1)
#
# OR
#
# Terminal Command: python3 run_py.py year/month/day/solution/main.py year/month/day/data/input.csv
