const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function normalizeDay(day) {
  const asNumber = Number(day);
  return Number.isFinite(asNumber) ? String(asNumber) : String(day);
}

function collectDays(basePath) {
  if (!fs.existsSync(basePath)) return [];

  return fs
    .readdirSync(basePath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^Day\d{2}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort()
    .map((dayDir) => {
      const dayNumber = Number(dayDir.replace("Day", ""));
      const dayPath = path.join(basePath, dayDir);
      const solutionPath = path.join(dayPath, "solution");

      const languages = {
        js: fs.existsSync(path.join(solutionPath, "main.js")),
        py: fs.existsSync(path.join(solutionPath, "main.py")),
        kt: fs.existsSync(path.join(solutionPath, "main.kt")),
      };

      const hasAnyLanguage = Object.values(languages).some(Boolean);
      const hasInput = fs.existsSync(path.join(dayPath, "data", "input.csv"));

      return {
        day: String(dayNumber).padStart(2, "0"),
        dayNumber,
        hasInput,
        languages,
        available: hasAnyLanguage && hasInput,
        basePath: path.relative(PROJECT_ROOT, dayPath),
      };
    });
}

function readAvailableDays() {
  const years = fs
    .readdirSync(PROJECT_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{4}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort()
    .reverse(); // newest first

  const shape = [];

  for (const year of years) {
    const yearPath = path.join(PROJECT_ROOT, year);
    const months = fs
      .readdirSync(yearPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !/^Day\d{2}$/.test(entry.name))
      .map((entry) => entry.name);

    const monthData = [];

    for (const month of months) {
      const monthPath = path.join(yearPath, month);
      const dayData = collectDays(monthPath);

      if (dayData.length) {
        monthData.push({ month, label: month, days: dayData });
      }
    }

    const rootDays = collectDays(yearPath);
    if (rootDays.length) {
      monthData.push({ month: "Root", label: "Root", days: rootDays });
    }

    if (monthData.length) {
      shape.push({ year, months: monthData });
    }
  }

  const defaults = (() => {
    for (const year of shape) {
      for (const month of year.months) {
        const firstDay = month.days.find((d) => d.available) || month.days[0];
        if (firstDay) {
          return { year: year.year, month: month.month, day: firstDay.day };
        }
      }
    }
    return { year: years[0] || "", month: "", day: "" };
  })();

  return { years: shape, defaults };
}

function findDayMeta(structure, year, month, day) {
  const normalizedDay = String(day).padStart(2, "0");
  const normalizedMonth = String(month || "").toLowerCase();
  return structure.years
    .find((y) => String(y.year) === String(year))?.months
    ?.find((m) => String(m.month).toLowerCase() === normalizedMonth)?.days
    ?.find((d) => d.day === normalizedDay);
}

function locateDayFallback(year, month, day) {
  const normalizedDay = String(day).padStart(2, "0");
  const candidates = [];

  if (month) {
    candidates.push(path.join(PROJECT_ROOT, year, month, `Day${normalizedDay}`));
  }
  candidates.push(path.join(PROJECT_ROOT, year, `Day${normalizedDay}`));

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate) || !fs.statSync(candidate).isDirectory()) continue;

    const solutionPath = path.join(candidate, "solution");
    const languages = {
      js: fs.existsSync(path.join(solutionPath, "main.js")),
      py: fs.existsSync(path.join(solutionPath, "main.py")),
      kt: fs.existsSync(path.join(solutionPath, "main.kt")),
    };
    const hasAnyLanguage = Object.values(languages).some(Boolean);
    const hasInput = fs.existsSync(path.join(candidate, "data", "input.csv"));

    return {
      day: normalizedDay,
      dayNumber: Number(normalizedDay),
      hasInput,
      languages,
      available: hasAnyLanguage && hasInput,
      basePath: path.relative(PROJECT_ROOT, candidate),
    };
  }

  return null;
}

function buildCommand(language, year, month, day) {
  const normalizedDay = normalizeDay(day);

  switch (language) {
    case "js":
      return { cmd: "node", args: ["run_js.mjs", year, month, normalizedDay] };
    case "py":
      return { cmd: "python3", args: ["run_py.py", year, month, normalizedDay] };
    case "kt":
      return { cmd: "./run_kt.sh", args: [year, month, normalizedDay] };
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

function runSolution(language, dayMeta) {
  return new Promise((resolve) => {
    const dayBase = path.join(PROJECT_ROOT, dayMeta.basePath);
    const inputPath = path.join(dayBase, "data", "input.csv");
    const solutions = {
      js: path.join(dayBase, "solution", "main.js"),
      py: path.join(dayBase, "solution", "main.py"),
      kt: path.join(dayBase, "solution", "main.kt"),
    };

    let cmd = "";
    let args = [];

    switch (language) {
      case "js":
        cmd = "node";
        args = ["run_js.mjs", solutions.js, inputPath];
        break;
      case "py":
        cmd = "python3";
        args = ["run_py.py", solutions.py, inputPath];
        break;
      case "kt":
        cmd = "./run_kt.sh";
        args = [solutions.kt, inputPath];
        break;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }

    const startedAt = Date.now();

    const child = spawn(cmd, args, { cwd: PROJECT_ROOT });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      resolve({
        exitCode: code,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        durationMs: Date.now() - startedAt,
        command: [cmd, ...args].join(" "),
      });
    });

    child.on("error", (error) => {
      resolve({
        exitCode: -1,
        stdout: "",
        stderr: error.message,
        durationMs: Date.now() - startedAt,
        command: [cmd, ...args].join(" "),
      });
    });
  });
}

function parseOutputForHighlights(stdout) {
  const lines = stdout.split(/\r?\n/);
  let part1TimeMs = null;
  let part2TimeMs = null;
  const highlights = {
    part1: null,
    part2: null,
    processingMs: null,
    totalMs: null,
  };

  for (const line of lines) {
    const label = (line.split(":")[0] || "").toLowerCase();

    if (!highlights.part1) {
      const part1 = line.match(/^\s*part\s*1[^:]*:\s*(.+)$/i);
      if (part1 && !label.includes("time")) {
        highlights.part1 = part1[1].trim();
      }
    }

    if (!highlights.part2) {
      const part2 = line.match(/^\s*part\s*2[^:]*:\s*(.+)$/i);
      if (part2 && !label.includes("time")) {
        highlights.part2 = part2[1].trim();
      }
    }

    const processing = line.match(/processing\s+time:\s*([0-9]+(?:\.[0-9]+)?)\s*ms/i);
    if (processing) highlights.processingMs = Number(processing[1]);

    const p1Time = line.match(/part\s*1\s*time[^:]*:\s*([0-9]+(?:\.[0-9]+)?)\s*ms?/i);
    if (p1Time && part1TimeMs == null) part1TimeMs = Number(p1Time[1]);

    const p2Time = line.match(/part\s*2\s*time[^:]*:\s*([0-9]+(?:\.[0-9]+)?)\s*ms?/i);
    if (p2Time && part2TimeMs == null) part2TimeMs = Number(p2Time[1]);

    const total = line.match(/total\s+runtime:\s*([0-9]+(?:\.[0-9]+)?)\s*ms/i);
    if (total) highlights.totalMs = Number(total[1]);
  }

  if (highlights.processingMs == null && part1TimeMs != null && part2TimeMs != null) {
    highlights.processingMs = Number(part1TimeMs) + Number(part2TimeMs);
  }

  return highlights;
}

function serveStatic(req, res, url) {
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const relativePath = path.normalize(requestedPath.replace(/^\//, ""));
  const resolvedPath = path.join(PUBLIC_DIR, relativePath);

  if (!resolvedPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(resolvedPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(resolvedPath);
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && url.pathname === "/api/options") {
    const structure = readAvailableDays();
    sendJson(res, 200, structure);
    return;
  }

  if (req.method === "GET" && url.pathname.replace(/\/+$/, "") === "/api/solution") {
    const language = url.searchParams.get("language");
    const year = url.searchParams.get("year");
    const month = url.searchParams.get("month");
    const day = url.searchParams.get("day");

    if (!["js", "py", "kt"].includes(language || "")) {
      sendJson(res, 400, { error: "Language must be one of: js, py, kt" });
      return;
    }

    if (!year || !month || !day) {
      sendJson(res, 400, { error: "Missing year, month, or day" });
      return;
    }

    const available = readAvailableDays();
    let dayMeta = findDayMeta(available, year, month, day) || locateDayFallback(year, month, day);

    if (!dayMeta) {
      sendJson(res, 404, { error: "Requested puzzle day not found" });
      return;
    }

    if (!dayMeta.languages[language]) {
      sendJson(res, 400, { error: `No ${language.toUpperCase()} solution found for ${year} ${month} day ${day}` });
      return;
    }

    const dayBase = path.join(PROJECT_ROOT, dayMeta.basePath);
    const target = path.join(dayBase, "solution", `main.${language === "kt" ? "kt" : language}`);

    if (!fs.existsSync(target)) {
      sendJson(res, 404, { error: "Solution file not found" });
      return;
    }

    const content = fs.readFileSync(target, "utf8");
    sendJson(res, 200, {
      language,
      year,
      month,
      day: String(day).padStart(2, "0"),
      path: path.relative(PROJECT_ROOT, target),
      content,
    });
    return;
  }

  if (req.method === "GET" && url.pathname.replace(/\/+$/, "") === "/api/input") {
    const year = url.searchParams.get("year");
    const month = url.searchParams.get("month");
    const day = url.searchParams.get("day");

    if (!year || !month || !day) {
      sendJson(res, 400, { error: "Missing year, month, or day" });
      return;
    }

    const available = readAvailableDays();
    let dayMeta = findDayMeta(available, year, month, day) || locateDayFallback(year, month, day);

    if (!dayMeta) {
      sendJson(res, 404, { error: "Requested puzzle day not found" });
      return;
    }

    if (!dayMeta.hasInput) {
      sendJson(res, 400, { error: "Input file missing for selected day" });
      return;
    }

    const dayBase = path.join(PROJECT_ROOT, dayMeta.basePath);
    const inputPath = path.join(dayBase, "data", "input.csv");

    if (!fs.existsSync(inputPath)) {
      sendJson(res, 404, { error: "Input file not found" });
      return;
    }

    const content = fs.readFileSync(inputPath, "utf8");
    sendJson(res, 200, {
      year,
      month,
      day: String(day).padStart(2, "0"),
      path: path.relative(PROJECT_ROOT, inputPath),
      content,
    });
    return;
  }

  if (req.method === "POST" && url.pathname.replace(/\/+$/, "") === "/api/run") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        res.writeHead(413);
        res.end();
        req.socket.destroy();
      }
    });

    req.on("end", async () => {
      let parsed;
      try {
        parsed = JSON.parse(body || "{}");
      } catch {
        sendJson(res, 400, { error: "Invalid JSON body" });
        return;
      }

      const { language, year, month, day } = parsed || {};

      if (!["js", "py", "kt"].includes(language)) {
        sendJson(res, 400, { error: "Language must be one of: js, py, kt" });
        return;
      }

      if (!year || !month || !day) {
        sendJson(res, 400, { error: "Missing year, month, or day" });
        return;
      }

    const available = readAvailableDays();
    let dayMeta = findDayMeta(available, year, month, day) || locateDayFallback(year, month, day);

      if (!dayMeta) {
        sendJson(res, 404, { error: "Requested puzzle day not found" });
        return;
      }

      if (!dayMeta.languages[language]) {
        sendJson(res, 400, { error: `No ${language.toUpperCase()} solution found for ${year} ${month} day ${day}` });
        return;
      }

      if (!dayMeta.hasInput) {
        sendJson(res, 400, { error: "Input file missing for selected day" });
        return;
      }

      const result = await runSolution(language, dayMeta);
      const highlights = parseOutputForHighlights(result.stdout);

      sendJson(res, 200, { ...result, highlights });
    });

    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  serveStatic(req, res, url);
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Web runner available at http://localhost:${PORT}`);
  });
}

module.exports = server;
