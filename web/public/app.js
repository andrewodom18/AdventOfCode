const yearSelect = document.getElementById("yearSelect");
const monthSelect = document.getElementById("monthSelect");
const daySelect = document.getElementById("daySelect");
const inputHint = document.getElementById("inputHint");

const outputNodes = {
  js: document.querySelector('[data-output="js"]'),
  py: document.querySelector('[data-output="py"]'),
  kt: document.querySelector('[data-output="kt"]'),
};

const availabilityNodes = {
  js: document.querySelector('[data-availability="js"]'),
  py: document.querySelector('[data-availability="py"]'),
  kt: document.querySelector('[data-availability="kt"]'),
};

const runButtons = {
  js: document.querySelector('[data-run="js"]'),
  py: document.querySelector('[data-run="py"]'),
  kt: document.querySelector('[data-run="kt"]'),
};

const LANG_LABELS = { js: "JavaScript", py: "Python", kt: "Kotlin" };
const BADGE_CLASSES = {
  success:
    "inline-flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-100",
  error:
    "inline-flex items-center gap-2 rounded-full border border-rose-500/50 bg-rose-500/10 px-3 py-1 text-sm font-semibold text-rose-100",
  neutral:
    "inline-flex items-center gap-2 rounded-full border border-cyan-500/50 bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-100",
};

const state = {
  options: null,
  results: { js: null, py: null, kt: null },
  loading: { js: false, py: false, kt: false },
};

async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return {
      ok: res.ok,
      status: res.status,
      data: { error: text || `HTTP ${res.status}` },
    };
  }
}

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMs(ms) {
  if (ms == null || Number.isNaN(ms)) return "";
  return `${Number(ms).toLocaleString()} ms`;
}

function getMonths(year) {
  return state.options?.years.find((y) => y.year === year)?.months || [];
}

function getDays(year, month) {
  return getMonths(year).find((m) => m.month === month)?.days || [];
}

function getDayMeta(year, month, day) {
  if (!year || !month || !day) return undefined;
  const paddedDay = String(day).padStart(2, "0");
  return getDays(year, month).find((d) => d.day === paddedDay);
}

function setHint(message) {
  inputHint.textContent = message;
}

function populateSelect(select, values, placeholder, formatter) {
  select.innerHTML = "";
  if (placeholder) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = placeholder;
    select.append(opt);
  }
  values.forEach((value) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = formatter ? formatter(value) : value;
    select.append(opt);
  });
}

function populateYearSelect() {
  const years = state.options?.years.map((y) => y.year) || [];
  populateSelect(yearSelect, years, "Select year");
  yearSelect.value = "";
}

function populateMonthSelect(year) {
  const months = year ? getMonths(year).map((m) => m.month) : [];
  populateSelect(monthSelect, months, "Select month");
  monthSelect.value = "";
}

function populateDaySelect(year, month) {
  const days = year && month ? getDays(year, month).map((d) => d.day) : [];
  populateSelect(daySelect, days, "Select day", (value) => `Day ${value}`);
  daySelect.value = "";
}

function updateAvailability(meta) {
  Object.entries(availabilityNodes).forEach(([lang, node]) => {
    if (!meta) {
      return;
    }

    if (!meta.hasInput) {
      return;
    }

    if (!meta.languages[lang]) {
      return;
    }
  });
}

function setButtonState(lang, meta) {
  const button = runButtons[lang];
  const baseLabel = button.dataset.baseLabel || `Run ${LANG_LABELS[lang]}`;
  button.dataset.baseLabel = baseLabel;

  const disabled = !meta || !meta.hasInput || !meta.languages[lang] || state.loading[lang];
  button.disabled = disabled;
  button.textContent = state.loading[lang] ? "Running..." : baseLabel;
}

function updateButtons(meta) {
  setButtonState("js", meta);
  setButtonState("py", meta);
  setButtonState("kt", meta);
}

function renderResult(lang, payload) {
  const container = outputNodes[lang];
  if (!payload) {
    container.innerHTML = `<p class="text-sm text-slate-400">Awaiting a run for ${LANG_LABELS[lang]}.</p>`;
    return;
  }

  if (payload.error) {
    container.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <span class="${BADGE_CLASSES.error}">Error</span>
        <span class="text-xs text-slate-400">${escapeHtml(payload.runtime || "")}</span>
      </div>
      <div class="mt-3 text-xs font-mono leading-relaxed text-slate-100 bg-slate-900/80 border border-rose-500/30 rounded-xl p-3 whitespace-pre-wrap">${escapeHtml(payload.error)}</div>
    `;
    return;
  }

  const { exitCode, stdout, stderr, durationMs, highlights } = payload;
  const success = exitCode === 0;

  let html = `
    <div class="flex items-center justify-between gap-3">
      <span class="${success ? BADGE_CLASSES.success : BADGE_CLASSES.error}">
        ${success ? "Completed" : `Exited (${exitCode})`}
      </span>
      <span class="text-xs text-slate-400">${formatMs(durationMs) || ""}</span>
    </div>
  `;

  const showAnswers = (highlights?.part1 || highlights?.part2 || highlights?.processingMs || highlights?.totalMs) && success;

  if (showAnswers) {
    html += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">`;
    if (highlights.part1) {
      html += `<div class="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-100"><strong class="block text-xs uppercase tracking-wide text-slate-400 mb-1">Part 1</strong>${escapeHtml(highlights.part1)}</div>`;
    }
    if (highlights.part2) {
      html += `<div class="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-100"><strong class="block text-xs uppercase tracking-wide text-slate-400 mb-1">Part 2</strong>${escapeHtml(highlights.part2)}</div>`;
    }
    if (highlights.processingMs != null) {
      html += `<div class="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-100"><strong class="block text-xs uppercase tracking-wide text-slate-400 mb-1">Processing</strong>${formatMs(highlights.processingMs)}</div>`;
    }
    if (highlights.totalMs != null) {
      html += `<div class="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-100"><strong class="block text-xs uppercase tracking-wide text-slate-400 mb-1">Total runtime</strong>${formatMs(highlights.totalMs)}</div>`;
    }
    html += `</div>`;
  }

  if (stderr) {
    html += `<div class="text-xs font-mono leading-relaxed text-slate-100 bg-slate-900/70 border border-slate-800 rounded-xl p-3 whitespace-pre-wrap break-words"><strong class="text-slate-400 block mb-1 font-semibold">stderr</strong>${escapeHtml(stderr)}</div>`;
  }

  container.innerHTML = html;
}

function renderPending(lang) {
  const container = outputNodes[lang];
  container.innerHTML = `
    <div class="flex items-center justify-between gap-3">
      <span class="${BADGE_CLASSES.neutral}">Running...</span>
      <span class="text-xs text-slate-400">Please wait</span>
    </div>
    <p class="text-sm text-slate-400 mt-3">Executing ${LANG_LABELS[lang]} solution.</p>
  `;
}

async function fetchOptions() {
  try {
    const res = await fetch("/api/options");
    const { data, ok } = await parseJsonSafe(res);
    if (!ok) throw new Error(data?.error || "Failed to load options");

    state.options = data;
    populateYearSelect();
    populateMonthSelect();
    populateDaySelect();

    if (!data?.years?.length) {
      setHint("No puzzles found in the repository.");
      updateAvailability(null);
      updateButtons(null);
      return;
    }

    updateAvailability(null);
    updateButtons(null);
  } catch (error) {
    setHint("Failed to load puzzle metadata.");
    console.error(error);
  }
}

async function runLanguage(lang) {
  const year = yearSelect.value;
  const month = monthSelect.value;
  const day = daySelect.value;
  const meta = getDayMeta(year, month, day);

  if (!meta) {
    renderResult(lang, { error: "Select a valid puzzle day first." });
    return;
  }

  if (!meta.hasInput) {
    renderResult(lang, { error: "Input file missing for this day." });
    return;
  }

  if (!meta.languages[lang]) {
    renderResult(lang, { error: `No ${LANG_LABELS[lang]} solution for this day.` });
    return;
  }

  state.loading[lang] = true;
  updateButtons(meta);
  renderPending(lang);

  try {
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: lang, year, month, day }),
    });

    const { data, ok } = await parseJsonSafe(res);
    if (!ok) {
      renderResult(lang, { error: data?.error || "Run failed" });
      return;
    }

    state.results[lang] = data;
    renderResult(lang, data);
  } catch (error) {
    renderResult(lang, { error: error.message || "Unknown error" });
  } finally {
    state.loading[lang] = false;
    updateButtons(meta);
  }
}

function wireEvents() {
  const resetOutputs = () => {
    state.results = { js: null, py: null, kt: null };
    renderResult("js", null);
    renderResult("py", null);
    renderResult("kt", null);
  };

  yearSelect.addEventListener("change", () => {
    resetOutputs();
    if (!yearSelect.value) {
      populateMonthSelect();
      populateDaySelect();
      updateAvailability(null);
      updateButtons(null);
      return;
    }
    populateMonthSelect(yearSelect.value);
    populateDaySelect();
    const meta = getDayMeta(yearSelect.value, monthSelect.value, daySelect.value);
    updateAvailability(meta);
    updateButtons(meta);
  });

  monthSelect.addEventListener("change", () => {
    resetOutputs();
    if (!monthSelect.value) {
      populateDaySelect();
      const meta = getDayMeta(yearSelect.value, monthSelect.value, daySelect.value);
      updateAvailability(meta);
      updateButtons(meta);
      return;
    }
    populateDaySelect(yearSelect.value, monthSelect.value);
    const meta = getDayMeta(yearSelect.value, monthSelect.value, daySelect.value);
    updateAvailability(meta);
    updateButtons(meta);
  });

  daySelect.addEventListener("change", () => {
    resetOutputs();
    const meta = getDayMeta(yearSelect.value, monthSelect.value, daySelect.value);
    updateAvailability(meta);
    updateButtons(meta);
  });

  Object.entries(runButtons).forEach(([lang, btn]) => {
    btn.addEventListener("click", () => runLanguage(lang));
  });
}

function primeOutputs() {
  renderResult("js", null);
  renderResult("py", null);
  renderResult("kt", null);
}

function init() {
  wireEvents();
  primeOutputs();
  updateAvailability(null);
  updateButtons(null);
  fetchOptions();
}

document.addEventListener("DOMContentLoaded", init);
