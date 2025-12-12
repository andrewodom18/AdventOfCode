# Advent of Code Runner

Multi-language (JavaScript, Python, Kotlin) Advent of Code solutions with tiny CLI helpers and a lightweight web UI.

## Repository layout

``` text
AdventOfCode/
|
|-- run_js.mjs              # Node helper to run JS solutions
|-- run_py.py               # Python helper to run Py solutions
|-- run_kt.sh               # Kotlin helper to compile/run KT solutions
|
|-- Year/
|   \-- Month/
|       |-- Day01/
|       |   |-- data/input.csv
|       |   \-- solution/main.{js,py,kt}
|       |-- Day02/
|       |   |-- data/input.csv
|       |   \-- solution/main.{js,py,kt}
|       |-- ...
|       \-- Day03/...
|
\-- web/
    |-- server.js           # Local HTTP server that exposes/run solutions
    \-- public/
        |-- index.html
        \-- app.js
```

Every puzzle day lives in `YEAR/[Month]/DayNN/` with two children: `data/input.csv` and `solution/main.*` for each language you have implemented.

## Prerequisites

- Node.js 18+ (for the JS runner and the web server)
- Python 3 (for Python solutions)
- JDK + `kotlinc` on PATH (for Kotlin solutions; `run_kt.sh` compiles to a temp JAR, then runs it)
- Make sure `run_kt.sh` is executable (`chmod +x run_kt.sh` once, if needed).

## Running solutions from the CLI

You can point the helpers either at explicit file paths or at a date (year, month, day) and they will resolve `solution/main.*` and `data/input.csv` for you.

### Run by year/month/day (auto-resolves paths)

- JavaScript: `node run_js.mjs 2025 December 1`
- Python: `python3 run_py.py 2025 December 1`
- Kotlin: `./run_kt.sh 2025 December 1`

Month names are case-insensitive; the day argument can be `1` or `01`.

### Run by explicit paths

- JavaScript: `node run_js.mjs 2025/December/Day01/solution/main.js 2025/December/Day01/data/input.csv`
- Python: `python3 run_py.py 2025/December/Day01/solution/main.py 2025/December/Day01/data/input.csv`
- Kotlin: `./run_kt.sh 2025/December/Day01/solution/main.kt 2025/December/Day01/data/input.csv`

Notes:

- Each helper validates that both the solution file and `input.csv` exist before running.
- The Kotlin runner writes a JAR to `$TMPDIR` (or `/tmp`) and uses `java -jar` to execute it.

## Web runner (local server)

The `web` folder holds a no-dependency Node server plus a static front-end that can browse and execute any available solution.

1. From the repo root, start the server: `node web/server.js` (set `PORT=4000` to change the port).
2. Open `http://localhost:3000` (or your chosen port). The UI auto-detects available years/months/days and which languages have code and input.
3. Pick a date, then click Run under JavaScript, Python, or Kotlin. The server calls the same CLI helpers as above and streams back stdout/stderr, exit code, timing, and any detected `Part 1/Part 2` lines.

API endpoints (handy if you want to script):

- `GET /api/options` -> nested list of years/months/days plus defaults.
- `GET /api/solution?language=js|py|kt&year=YYYY&month=Month&day=DD` -> returns the source file.
- `GET /api/input?year=YYYY&month=Month&day=DD` -> returns the input.
- `POST /api/run` with JSON `{ language, year, month, day }` -> runs the solution and responds with stdout/stderr, exit code, and highlights.

## Adding a new puzzle day

1. Create the folder: `mkdir -p YEAR/Month/DayNN/{data,solution}` (Month capitalized).
2. Drop your input at `YEAR/Month/DayNN/data/input.csv`.
3. Add one or more solutions at `YEAR/Month/DayNN/solution/main.js|py|kt`.
4. Run via the CLI helpers or the web UI; both will automatically detect the new day.
