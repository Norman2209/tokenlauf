/* =========================================================
   Zustand (lokal im Browser)
   ========================================================= */
const STORE_KEY = "tokenlauf-v1";
const freshState = () => ({ done: {}, code: {}, quiz: {}, fill: {}, sort: {}, current: LESSONS[0].id });
let state = freshState();
try {
  const saved = JSON.parse(localStorage.getItem(STORE_KEY));
  if (saved && typeof saved === "object") state = { ...state, ...saved };
} catch (e) { /* ohne Speicher weiter */ }
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignorieren */ } }
if (!byId(state.current) && state.current !== "profil" && state.current !== "spickzettel") state.current = LESSONS[0].id;
const hashId = location.hash.slice(1);
if (byId(hashId) || hashId === "profil" || hashId === "spickzettel") state.current = hashId;

/* =========================================================
   Simulierte Laufzeit im Web Worker
   ========================================================= */
function workerHarness() {
  const fmt = (v) => {
    if (typeof v === "string") return JSON.stringify(v);
    if (v === undefined) return "undefined";
    if (typeof v === "function") return "[Funktion " + (v.name || "anonym") + "]";
    if (v instanceof Error) return v.name + ": " + v.message;
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  };
  const logFmt = (v) => (typeof v === "string" ? v : fmt(v));
  ["log", "info", "warn", "error"].forEach((lvl) => {
    console[lvl] = (...args) => self.postMessage({ type: "log", level: lvl, text: args.map(logFmt).join(" ") });
  });

  const deepEqual = (a, b) => {
    if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 1e-9 || Object.is(a, b);
    if (Object.is(a, b)) return true;
    if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
  };
  const fail = (msg) => { const e = new Error(msg); e.isAssert = true; throw e; };
  self.__helpers = {
    eq: (actual, expected, label) => {
      if (!deepEqual(actual, expected)) fail(`${label ? label + ": " : ""}erwartet ${fmt(expected)}, erhalten ${fmt(actual)}`);
    },
    assert: (cond, msg) => { if (!cond) fail(msg); },
  };
  self.__explain = (e) => {
    if (!e) return "Unbekannter Fehler";
    const m = String(e.message || e);
    if (e.isAssert) return m;
    const r = m.match(/^(\S+) is not defined$/) || m.match(/^Can't find variable: (\S+)$/);
    if (e.name === "ReferenceError" && r) return `„${r[1]}“ ist nicht definiert. Hast du es angelegt und genau so geschrieben (Groß-/Kleinschreibung)?`;
    return `${e.name || "Fehler"}: ${m}`;
  };

  // Übungs-API
  const KUNDEN = {
    42: { id: 42, name: "Erika Musterfrau", email: "erika@example.com", score: 720, typ: "gold" },
    7: { id: 7, name: "Max Mustermann", email: "max@example.com", score: 410, typ: "silber" },
  };
  const STATUS_TEXT = { 200: "OK", 201: "Created", 400: "Bad Request", 404: "Not Found", 503: "Service Unavailable" };
  const fetchLog = [];
  const respond = (status, body) => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: STATUS_TEXT[status] || "",
    headers: { get: (h) => (String(h).toLowerCase() === "content-type" ? "application/json" : null) },
    json: async () => JSON.parse(JSON.stringify(body)),
    text: async () => JSON.stringify(body),
  });
  self.fetch = async (url, options = {}) => {
    const method = String(options.method || "GET").toUpperCase();
    let u;
    try { u = new URL(String(url)); } catch (e) { u = null; }
    if (!u || u.host !== "api.example.com") {
      throw new TypeError(`In dieser App ist nur die Übungs-API unter https://api.example.com erreichbar (angefragt: ${url})`);
    }
    const path = u.pathname.replace(/\/$/, "");
    let res;
    const m = path.match(/^\/kunden\/([^/]+)$/);
    if (m && method === "GET") {
      if (m[1] === "13") res = respond(503, { fehler: "Kundensystem wird gewartet" });
      else if (KUNDEN[m[1]]) res = respond(200, KUNDEN[m[1]]);
      else res = respond(404, { fehler: "Kunde nicht gefunden" });
    } else if (path === "/bestellungen" && method === "POST") {
      try { res = respond(201, { id: "B-" + (3000 + fetchLog.length), ...JSON.parse(options.body || "{}"), status: "angelegt" }); }
      catch (e) { res = respond(400, { fehler: "Body ist kein gültiges JSON" }); }
    } else {
      res = respond(404, { fehler: `Unbekannter Endpunkt ${method} ${path}` });
    }
    fetchLog.push({ method, url: String(url), status: res.status });
    console.info(`[fetch] ${method} ${url} → ${res.status} ${res.statusText}`);
    return res;
  };
  self.__helpers.fetchLog = () => fetchLog.slice();

  // Simulierte Engine
  const workers = {};
  self.zeebe = {
    createWorker(config) {
      if (!config || typeof config.taskType !== "string") throw new Error('createWorker braucht ein Objekt mit taskType, z. B. { taskType: "mein-typ", taskHandler: ... }');
      if (typeof config.taskHandler !== "function") throw new Error("createWorker braucht eine taskHandler-Funktion");
      workers[config.taskType] = config;
      console.info(`[zeebe] Worker für Task-Typ "${config.taskType}" registriert`);
      return { close() {} };
    },
    publishMessage(msg) {
      if (!msg || typeof msg.name !== "string") return Promise.reject(new Error('publishMessage braucht ein Objekt mit name, z. B. { name: "ZahlungEingegangen", correlationKey: "B-1" }'));
      if (msg.correlationKey === undefined) return Promise.reject(new Error(`publishMessage("${msg.name}") braucht einen correlationKey`));
      if (msg.messageId && published.some((m) => m.messageId === msg.messageId)) {
        console.warn(`[zeebe] Nachricht mit messageId "${msg.messageId}" existiert bereits und wird verworfen`);
        return Promise.reject(new Error(`Nachricht mit messageId "${msg.messageId}" wurde bereits veröffentlicht`));
      }
      published.push(JSON.parse(JSON.stringify(msg)));
      console.info(`[zeebe] Nachricht "${msg.name}" veröffentlicht, correlationKey ${fmt(msg.correlationKey)}${msg.variables ? ", Variablen " + fmt(msg.variables) : ""}`);
      return Promise.resolve({ key: String(++jobKey) });
    },
  };
  const published = [];
  self.__helpers.messages = () => published.slice();
  let jobKey = 2251799813685000;
  self.__helpers.runJob = async (taskType, variables) => {
    const w = workers[taskType];
    if (!w) {
      const known = Object.keys(workers);
      fail(`Kein Worker für den Task-Typ "${taskType}" registriert.` + (known.length ? ` Registriert ist: ${known.map((k) => `"${k}"`).join(", ")}` : " Rufst du zeebe.createWorker auf?"));
    }
    let result = null;
    const key = String(++jobKey);
    const settle = (r) => {
      if (result) throw new Error(`Job ${key} wurde bereits mit ${result.status} abgeschlossen. Pro Job nur eine Aktion aufrufen (return nicht vergessen).`);
      result = r;
      return Promise.resolve("JOB_ACTION_ACKNOWLEDGEMENT");
    };
    const job = {
      key, type: taskType, retries: 3,
      variables: JSON.parse(JSON.stringify(variables)),
      complete(vars = {}) {
        console.info(`[zeebe] Job ${key} → complete(${fmt(vars)})`);
        return settle({ status: "complete", variables: vars });
      },
      fail(a, b) {
        const o = a && typeof a === "object" ? a : { errorMessage: a, retries: b };
        console.info(`[zeebe] Job ${key} → fail(${fmt(o.errorMessage)}${o.retries !== undefined ? ", retries: " + o.retries : ""})`);
        return settle({ status: "fail", errorMessage: o.errorMessage, retries: o.retries });
      },
      error(a, b) {
        const o = a && typeof a === "object" ? a : { errorCode: a, errorMessage: b };
        console.info(`[zeebe] Job ${key} → error(${fmt(o.errorCode)}${o.errorMessage ? ", " + fmt(o.errorMessage) : ""})`);
        return settle({ status: "error", errorCode: o.errorCode, errorMessage: o.errorMessage });
      },
    };
    console.info(`[zeebe] Job ${key} aktiviert (${taskType}), Variablen: ${fmt(variables)}`);
    try { await w.taskHandler(job); }
    catch (e) {
      if (e && e.isAssert) throw e;
      fail(`Der Handler hat eine Ausnahme geworfen: ${self.__explain(e)}. In echt würde der Job fehlschlagen und erneut versucht.`);
    }
    if (!result) fail("Der Handler hat weder job.complete() noch job.fail() oder job.error() aufgerufen. Der Job würde nach dem Timeout erneut vergeben.");
    return result;
  };
}

function runInWorker(lesson, code) {
  return new Promise((resolve) => {
    const prefix = `(${workerHarness.toString()})();\n`;
    const testList = lesson.tests.map(([name, fn]) => `[${JSON.stringify(name)}, ${fn.toString()}]`).join(",\n");
    const suffix = `
;(async () => {
  const __tests = [${testList}];
  for (const [name, fn] of __tests) {
    try { await fn(self.__helpers); self.postMessage({ type: "test", name, pass: true }); }
    catch (e) { self.postMessage({ type: "test", name, pass: false, msg: self.__explain(e) }); }
  }
  self.postMessage({ type: "done" });
})();`;
    const offset = prefix.split("\n").length - 1;
    const userLines = code.split("\n").length;
    const out = { logs: [], tests: [], error: null, timeout: false };
    let worker = null, timer = null, url = null, closed = false;
    const finish = () => {
      if (closed) return;
      closed = true;
      clearTimeout(timer);
      if (worker) worker.terminate();
      if (url) URL.revokeObjectURL(url);
      resolve(out);
    };
    try {
      url = URL.createObjectURL(new Blob([prefix + code + "\n" + suffix], { type: "text/javascript" }));
      worker = new Worker(url);
    } catch (e) {
      out.error = { message: "Der Code konnte nicht gestartet werden: " + e.message, line: null };
      return finish();
    }
    timer = setTimeout(() => { out.timeout = true; finish(); }, 4000);
    worker.onmessage = (ev) => {
      const m = ev.data;
      if (m.type === "log") out.logs.push(m);
      else if (m.type === "test") out.tests.push(m);
      else if (m.type === "done") finish();
    };
    worker.onerror = (ev) => {
      ev.preventDefault();
      const line = ev.lineno - offset;
      let msg = String(ev.message || "Unbekannter Fehler").replace(/^Uncaught\s+/, "");
      const r = msg.match(/^ReferenceError: (\S+) is not defined$/) || msg.match(/^ReferenceError: Can't find variable: (\S+)$/);
      if (r) msg = `„${r[1]}“ ist nicht definiert. Tippfehler oder fehlt die Deklaration?`;
      out.error = { message: msg, line: line >= 1 && line <= userLines ? line : null };
      finish();
    };
  });
}

/* =========================================================
   Rendering
   ========================================================= */
const sidebar = document.getElementById("sidebar");
const main = document.getElementById("main");

function doneCount() { return LESSONS.filter((l) => state.done[l.id]).length; }

function renderProgress() {
  const n = doneCount();
  document.getElementById("progress-text").textContent = `${n} von ${LESSONS.length} Schritten`;
  document.getElementById("progress-fill").style.width = `${(n / LESSONS.length) * 100}%`;
}

function renderSidebar() {
  const allDone = doneCount() === LESSONS.length;
  const covered = PROFILE.filter((r) => r.lessons.every((id) => state.done[id])).length;
  let html = `<button class="profile-link" data-id="profil" aria-current="${state.current === "profil"}">Dein Anforderungsprofil<small>${covered} von ${PROFILE.length} Bereichen abgedeckt</small></button>
    <button class="profile-link" data-id="spickzettel" aria-current="${state.current === "spickzettel"}">JS-Spickzettel<small>Syntax zum Nachschlagen</small></button>
    <div class="path">
    <div class="ev-row start"><span class="ev"></span><span>Start</span></div>`;
  MODULES.forEach((m, mi) => {
    html += `<section class="lane"><h3 class="lane-title"><small>Modul ${mi + 1}</small>${esc(m.title)}</h3><ol>`;
    m.lessons.forEach((l) => {
      const cur = l.id === state.current;
      html += `<li><button class="step${state.done[l.id] ? " done" : ""}" data-id="${l.id}" aria-current="${cur}">
        <span class="shape ${TYPE_SHAPE[l.type]}" aria-hidden="true"></span>${esc(l.title)}
      </button></li>`;
    });
    html += `</ol></section>`;
  });
  html += `<div class="ev-row end${allDone ? " reached" : ""}"><span class="ev"></span><span>${allDone ? "Prozess abgeschlossen" : "Ziel"}</span></div></div>
    <div class="path-legend" aria-label="Legende">
      <div><span class="shape task"></span>Code oder Lückentext (Task)</div>
      <div><span class="shape gw"></span>Quiz oder Zuordnen (Gateway: du entscheidest)</div>
      <div><span class="shape ev2"></span>Wissen (Zwischenereignis)</div>
      <div><span class="token-dot"></span>Dein Token: hier stehst du</div>
    </div>
    <div class="reset-zone"><button class="btn-quiet" id="reset-progress">Fortschritt zurücksetzen</button></div>`;
  sidebar.innerHTML = html;
  sidebar.querySelectorAll(".step, .profile-link").forEach((b) => b.addEventListener("click", () => go(b.dataset.id)));
  armButton(document.getElementById("reset-progress"), "Wirklich alles zurücksetzen?", () => {
    state = freshState();
    save();
    go(LESSONS[0].id);
  }, "danger");
}

// Zweistufige Bestätigung statt confirm()
function armButton(btn, armedText, action, armedClass = "armed") {
  const original = btn.textContent;
  let t = null;
  btn.addEventListener("click", () => {
    if (btn.dataset.armed === "1") { clearTimeout(t); btn.dataset.armed = ""; btn.textContent = original; btn.classList.remove(armedClass); action(); return; }
    btn.dataset.armed = "1"; btn.textContent = armedText; btn.classList.add(armedClass);
    t = setTimeout(() => { btn.dataset.armed = ""; btn.textContent = original; btn.classList.remove(armedClass); }, 3500);
  });
}

function go(id) {
  state.current = id;
  save();
  document.body.classList.remove("nav-open");
  document.getElementById("nav-toggle").setAttribute("aria-expanded", "false");
  try { history.replaceState(null, "", "#" + id); } catch (e) { /* ignorieren */ }
  render();
  window.scrollTo({ top: 0 });
}

function markDone(lesson) {
  if (state.done[lesson.id]) return;
  state.done[lesson.id] = true;
  save();
  renderSidebar();
  renderProgress();
  const chip = document.getElementById("status-chip");
  if (chip) { chip.textContent = "Erledigt"; chip.classList.add("done"); }
}

function lessonHead(l) {
  return `<header class="lesson-head">
    <div class="eyebrow"><span>Modul ${l.moduleNr} · ${esc(l.module.title)}</span><span>Schritt ${l.index + 1} von ${LESSONS.length}</span>
      <span class="chip">${TYPE_LABEL[l.type]}</span>
      <span class="chip${state.done[l.id] ? " done" : ""}" id="status-chip">${state.done[l.id] ? "Erledigt" : "Offen"}</span></div>
    <h1>${esc(l.title)}</h1>
  </header>`;
}

function lessonFoot(l) {
  const prev = LESSONS[l.index - 1], next = LESSONS[l.index + 1];
  return `<nav class="lesson-foot" aria-label="Schritte">
    ${prev ? `<button class="navbtn" data-go="${prev.id}"><small>Zurück</small>${esc(prev.title)}</button>` : ""}
    ${next ? `<button class="navbtn next" data-go="${next.id}"><small>Weiter</small>${esc(next.title)}</button>` : ""}
  </nav>`;
}

function render() {
  renderSidebar();
  renderProgress();
  const l = byId(state.current);
  if (!l) state.current === "spickzettel" ? renderSpickzettel() : renderProfile();
  else if (l.type === "code") renderCode(l);
  else if (l.type === "fill") renderFill(l);
  else if (l.type === "sort") renderSort(l);
  else renderQuiz(l);
  main.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));
}

/* ---------- Code-Übung ---------- */
function renderCode(l) {
  const code = state.code[l.id] ?? l.starter;
  main.innerHTML = `${lessonHead(l)}
    <div class="lesson-grid split">
      <div class="theory">${l.theory}</div>
      <div class="workspace">
        <div class="task-box"><div class="label">Deine Aufgabe</div>${l.task}</div>
        <div class="editor">
          <div class="editor-bar">
            <span class="file">${esc(l.file)}</span>
            <button class="tool" id="btn-hint">Tipp</button>
            <button class="tool" id="btn-solution">Lösung</button>
            <button class="tool" id="btn-reset">Zurücksetzen</button>
          </div>
          <div class="editor-body">
            <pre class="gutter" id="gutter" aria-hidden="true"></pre>
            <textarea id="code-${l.id}" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Code-Editor"></textarea>
          </div>
          <div class="run-bar">
            <button class="btn-primary" id="btn-run"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1l9 5-9 5z" fill="currentColor"/></svg>Prüfen</button>
            <span class="kbd"><kbd>⌘</kbd>/<kbd>Strg</kbd> + <kbd>Enter</kbd> · <kbd>Esc</kbd> dann <kbd>Tab</kbd> verlässt den Editor</span>
          </div>
        </div>
        <div class="reveal hint" id="hint" hidden><div class="label">Tipp</div><p>${l.hint}</p></div>
        <div class="reveal" id="solution" hidden><div class="label">Musterlösung</div>${pre(l.solution)}<button class="btn-quiet" id="btn-take">In den Editor übernehmen</button></div>
        <div class="results" id="results"></div>
      </div>
    </div>
    ${lessonFoot(l)}`;

  const ta = document.getElementById(`code-${l.id}`);
  const gutter = document.getElementById("gutter");
  ta.value = code;
  const updateGutter = () => {
    const n = ta.value.split("\n").length;
    gutter.textContent = Array.from({ length: n }, (_, i) => i + 1).join("\n");
    gutter.scrollTop = ta.scrollTop;
  };
  updateGutter();
  let saveT = null, tabEscape = false;
  ta.addEventListener("input", () => {
    updateGutter();
    clearTimeout(saveT);
    saveT = setTimeout(() => { state.code[l.id] = ta.value; save(); }, 300);
  });
  ta.addEventListener("scroll", () => { gutter.scrollTop = ta.scrollTop; });
  ta.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { tabEscape = true; return; }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); run(); return; }
    if (e.key === "Tab" && !tabEscape) {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: en } = ta;
      if (e.shiftKey) {
        const lineStart = ta.value.lastIndexOf("\n", s - 1) + 1;
        if (ta.value.slice(lineStart, lineStart + 2) === "  ") { ta.setRangeText("", lineStart, lineStart + 2, "preserve"); ta.selectionStart = ta.selectionEnd = Math.max(lineStart, s - 2); }
      } else {
        ta.setRangeText("  ", s, en, "end");
      }
      ta.dispatchEvent(new Event("input"));
      return;
    }
    tabEscape = false;
    if (e.key === "Enter" && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      const s = ta.selectionStart;
      const lineStart = ta.value.lastIndexOf("\n", s - 1) + 1;
      const line = ta.value.slice(lineStart, s);
      let indent = line.match(/^\s*/)[0];
      if (/[{[(]\s*$/.test(line)) indent += "  ";
      ta.setRangeText("\n" + indent, s, ta.selectionEnd, "end");
      ta.dispatchEvent(new Event("input"));
    }
  });

  const results = document.getElementById("results");
  const renderPending = () => {
    results.innerHTML = `<h4>Tests</h4><ul class="tests">${l.tests.map(([n]) => `<li><span class="ic" aria-hidden="true"></span><span>${esc(n)}</span></li>`).join("")}</ul>
      <pre class="console"><span class="empty">${state.done[l.id] ? "Diese Übung hast du schon bestanden. Du kannst sie jederzeit erneut prüfen." : "Noch nicht geprüft. Drück auf „Prüfen“, um deinen Code auszuführen."}</span></pre>`;
  };
  renderPending();

  const runBtn = document.getElementById("btn-run");
  async function run() {
    if (runBtn.disabled) return;
    state.code[l.id] = ta.value; save();
    runBtn.disabled = true; runBtn.lastChild.textContent = "Läuft …";
    const out = await runInWorker(l, ta.value);
    runBtn.disabled = false; runBtn.lastChild.textContent = "Prüfen";
    const passed = out.tests.filter((t) => t.pass).length;
    const allPass = !out.error && !out.timeout && passed === l.tests.length;
    let banner = "";
    if (out.error) {
      banner = `<div class="banner bad"><span><strong>${out.line ? `Fehler in Zeile ${out.line}` : "Fehler beim Ausführen"}:</strong> ${esc(out.error.message)}</span></div>`;
    } else if (out.timeout) {
      banner = `<div class="banner bad"><span>Dein Code läuft länger als 4 Sekunden und wurde gestoppt. Vermutlich eine Endlosschleife oder ein <code>await</code>, das nie fertig wird.</span></div>`;
    } else if (allPass) {
      const next = LESSONS[l.index + 1];
      banner = `<div class="banner ok"><span>Alle ${passed} Tests bestanden.</span>${next ? `<button class="btn-primary" data-go="${next.id}">Weiter: ${esc(next.title)}</button>` : ""}</div>`;
    } else {
      banner = `<div class="banner bad"><span>${passed} von ${l.tests.length} Tests bestanden. Die Meldungen unten zeigen, was noch nicht passt.</span></div>`;
    }
    const testsHtml = l.tests.map(([n]) => {
      const t = out.tests.find((x) => x.name === n);
      if (!t) return `<li class="skip"><span class="ic" aria-hidden="true"></span><span>${esc(n)}<span class="msg" style="color:var(--ink-3)">nicht ausgeführt</span></span></li>`;
      return t.pass
        ? `<li class="pass"><span class="ic" aria-hidden="true">✓</span><span>${esc(n)}</span></li>`
        : `<li class="fail"><span class="ic" aria-hidden="true">✕</span><span>${esc(n)}<span class="msg">${esc(t.msg)}</span></span></li>`;
    }).join("");
    const logs = out.logs.length
      ? out.logs.map((m) => `<span class="${m.level}">${esc(m.text)}</span>`).join("\n")
      : `<span class="empty">Keine Ausgabe</span>`;
    results.innerHTML = `${banner}<h4>Tests</h4><ul class="tests">${testsHtml}</ul><h4>Konsole</h4><pre class="console">${logs}</pre>`;
    results.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));
    if (allPass) markDone(l);
  }
  runBtn.addEventListener("click", run);
  document.getElementById("btn-hint").addEventListener("click", () => { const h = document.getElementById("hint"); h.hidden = !h.hidden; });
  document.getElementById("btn-solution").addEventListener("click", () => { const s = document.getElementById("solution"); s.hidden = !s.hidden; });
  document.getElementById("btn-take").addEventListener("click", () => { ta.value = l.solution; ta.dispatchEvent(new Event("input")); ta.focus(); });
  armButton(document.getElementById("btn-reset"), "Code verwerfen?", () => {
    ta.value = l.starter; delete state.code[l.id]; save(); updateGutter(); renderPending();
  });
}

/* ---------- Quiz & Wissen ---------- */
function renderQuiz(l) {
  const answered = state.quiz[l.id] || {};
  const questions = l.questions || [];
  main.innerHTML = `${lessonHead(l)}
    <div class="lesson-grid">
      <div class="theory">${l.theory}</div>
      ${l.widget === "legend" ? legendHtml(LEGEND_BASIC) : ""}
      ${l.widget === "legend-events" ? legendHtml(LEGEND_EVENTS) : ""}
      ${l.widget === "gateway" ? `<div id="sim-host"></div>` : ""}
      ${l.after || ""}
      ${questions.length ? `<div class="quiz" id="quiz">${questions.map((q, qi) => `
        <div class="q" data-q="${qi}">
          <div class="q-head"><span class="q-nr">${qi + 1}/${questions.length}</span><span>${q.q}</span></div>
          <div class="opts">${q.options.map((o, oi) => `<button class="opt" data-o="${oi}">${o}</button>`).join("")}</div>
          <div class="q-feedback" aria-live="polite"></div>
        </div>`).join("")}</div>` : ""}
      ${l.type === "info" ? `<div class="mark-read"><button class="btn-primary" id="btn-read">${state.done[l.id] ? "Erledigt" : "Als erledigt markieren"}</button></div>` : ""}
      <div id="quiz-done"></div>
    </div>
    ${lessonFoot(l)}`;

  if (l.widget === "gateway") gatewaySim(document.getElementById("sim-host"));

  const showDone = () => {
    const next = LESSONS[l.index + 1];
    document.getElementById("quiz-done").innerHTML = `<div class="banner ok" style="border-radius:12px;max-width:72ch"><span>Alle Fragen richtig beantwortet.</span>${next ? `<button class="btn-primary" data-go="${next.id}">Weiter: ${esc(next.title)}</button>` : ""}</div>`;
    document.querySelectorAll("#quiz-done [data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));
  };
  const setRight = (qEl, q, oi) => {
    qEl.querySelectorAll(".opt").forEach((b) => { b.disabled = true; if (+b.dataset.o === oi) b.classList.add("right"); });
    const fb = qEl.querySelector(".q-feedback");
    fb.className = "q-feedback";
    fb.innerHTML = `<strong>Richtig.</strong> ${q.explain}`;
  };
  document.querySelectorAll(".q").forEach((qEl) => {
    const qi = +qEl.dataset.q, q = questions[qi];
    if (answered[qi] === q.correct) setRight(qEl, q, q.correct);
    qEl.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => {
      const oi = +b.dataset.o;
      if (oi === q.correct) {
        setRight(qEl, q, oi);
        state.quiz[l.id] = { ...(state.quiz[l.id] || {}), [qi]: oi };
        save();
        if (questions.every((qq, i) => (state.quiz[l.id] || {})[i] === qq.correct)) { markDone(l); showDone(); }
      } else {
        b.classList.add("wrong");
        const fb = qEl.querySelector(".q-feedback");
        fb.className = "q-feedback bad";
        fb.innerHTML = `<strong>Nicht ganz.</strong> Versuch es mit einer anderen Antwort.`;
      }
    }));
  });
  if (questions.length && state.done[l.id]) showDone();

  const readBtn = document.getElementById("btn-read");
  if (readBtn) readBtn.addEventListener("click", () => { markDone(l); readBtn.textContent = "Erledigt"; });
}

/* ---------- Lückentext ---------- */
const normBlank = (s) => String(s).replace(/\s+/g, "");
function renderFill(l) {
  const saved = (state.fill[l.id] ||= {});
  const parts = l.code.replace(/^\n/, "").split(/\[\[(\w+)\]\]/);
  let nr = 0;
  const codeHtml = parts.map((p, i) => {
    if (i % 2 === 0) return hl(p);
    nr++;
    const w = Math.max(...l.blanks[p].map((a) => a.length)) + 2;
    return `<input class="blank" id="blank-${l.id}-${p}" data-b="${p}" style="width:${w}ch" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Lücke ${nr}" placeholder="${nr}" value="${esc(saved[p] || "")}">`;
  }).join("");
  main.innerHTML = `${lessonHead(l)}
    <div class="lesson-grid split">
      <div class="theory">${l.theory}</div>
      <div class="workspace">
        <div class="task-box"><div class="label">Deine Aufgabe</div>${l.task}</div>
        <div class="editor">
          <div class="editor-bar">
            <span class="file">${esc(l.file)}</span>
            <button class="tool" id="btn-hint">Tipp</button>
            <button class="tool" id="btn-solution">Lösung einsetzen</button>
          </div>
          <pre class="code fill-code"><code>${codeHtml}</code></pre>
          <div class="run-bar">
            <button class="btn-primary" id="btn-check">Prüfen</button>
            <span class="kbd"><kbd>Enter</kbd> in einer Lücke prüft ebenfalls</span>
          </div>
        </div>
        <div class="reveal hint" id="hint" hidden><div class="label">Tipp</div><p>${l.hint}</p></div>
        <div id="fill-result" aria-live="polite"></div>
      </div>
    </div>
    ${lessonFoot(l)}`;

  const inputs = [...main.querySelectorAll(".blank")];
  const check = () => {
    let right = 0;
    inputs.forEach((inp) => {
      const ok = l.blanks[inp.dataset.b].some((a) => normBlank(a) === normBlank(inp.value));
      inp.classList.toggle("right", ok);
      inp.classList.toggle("wrong", !ok);
      if (ok) right++;
    });
    const res = document.getElementById("fill-result");
    if (right === inputs.length) {
      const next = LESSONS[l.index + 1];
      res.innerHTML = `<div class="banner ok" style="border-radius:12px"><span>Alle ${right} Lücken richtig.</span>${next ? `<button class="btn-primary" data-go="${next.id}">Weiter: ${esc(next.title)}</button>` : ""}</div>`;
      res.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));
      markDone(l);
    } else {
      res.innerHTML = `<div class="banner bad" style="border-radius:12px"><span>${right} von ${inputs.length} Lücken richtig. Die rot markierten passen noch nicht.</span></div>`;
    }
  };
  inputs.forEach((inp) => {
    inp.addEventListener("input", () => {
      inp.classList.remove("right", "wrong");
      state.fill[l.id][inp.dataset.b] = inp.value;
      save();
    });
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); check(); } });
  });
  document.getElementById("btn-check").addEventListener("click", check);
  document.getElementById("btn-hint").addEventListener("click", () => { const h = document.getElementById("hint"); h.hidden = !h.hidden; });
  armButton(document.getElementById("btn-solution"), "Wirklich einsetzen?", () => {
    inputs.forEach((inp) => { inp.value = l.blanks[inp.dataset.b][0]; state.fill[l.id][inp.dataset.b] = inp.value; });
    save();
    check();
  });
  if (state.done[l.id]) check();
}

/* ---------- Zuordnen ---------- */
function renderSort(l) {
  const saved = (state.sort[l.id] ||= {});
  const catById = Object.fromEntries(l.categories.map((c) => [c.id, c]));
  main.innerHTML = `${lessonHead(l)}
    <div class="lesson-grid">
      <div class="theory">${l.theory}</div>
      <div class="sort-wrap">
        <div class="task-box"><div class="label">Deine Aufgabe</div>${l.task}
          <div class="cats">${l.categories.map((c) => `<span class="cat">${c.color ? `<span class="sw" style="background:${c.color}"></span>` : ""}${esc(c.label)}</span>`).join("")}</div>
        </div>
        <ol class="sort-list">${l.items.map((it, i) => `<li class="sort-item" data-i="${i}">
          <div class="sort-text">${it.text}</div>
          <select id="sort-${l.id}-${i}" data-i="${i}" aria-label="Zuordnung für Aussage ${i + 1}">
            <option value="">Zuordnen …</option>
            ${l.categories.map((c) => `<option value="${c.id}"${saved[i] === c.id ? " selected" : ""}>${esc(c.label)}</option>`).join("")}
          </select>
          <div class="sort-why"></div>
        </li>`).join("")}</ol>
        <div><button class="btn-primary" id="btn-check">Prüfen</button></div>
        <div id="sort-result" aria-live="polite"></div>
      </div>
    </div>
    ${lessonFoot(l)}`;

  const rows = [...main.querySelectorAll(".sort-item")];
  const check = () => {
    let right = 0, open = 0;
    rows.forEach((row) => {
      const i = +row.dataset.i, it = l.items[i];
      const val = row.querySelector("select").value;
      const why = row.querySelector(".sort-why");
      row.classList.remove("right", "wrong");
      why.textContent = "";
      if (!val) { open++; return; }
      if (val === it.cat) { right++; row.classList.add("right"); why.textContent = it.why; }
      else row.classList.add("wrong");
    });
    const res = document.getElementById("sort-result");
    if (right === rows.length) {
      const next = LESSONS[l.index + 1];
      res.innerHTML = `<div class="banner ok" style="border-radius:12px"><span>Alles richtig zugeordnet.</span>${next ? `<button class="btn-primary" data-go="${next.id}">Weiter: ${esc(next.title)}</button>` : ""}</div>`;
      res.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));
      markDone(l);
    } else {
      res.innerHTML = `<div class="banner bad" style="border-radius:12px"><span>${right} von ${rows.length} richtig${open ? `, ${open} noch offen` : ""}. Rot markierte Zeilen passen noch nicht.</span></div>`;
    }
  };
  rows.forEach((row) => row.querySelector("select").addEventListener("change", (e) => {
    state.sort[l.id][row.dataset.i] = e.target.value;
    save();
    row.classList.remove("right", "wrong");
    row.querySelector(".sort-why").textContent = "";
  }));
  document.getElementById("btn-check").addEventListener("click", check);
  if (state.done[l.id]) check();
}

/* ---------- Anforderungsprofil ---------- */
function renderProfile() {
  const cards = PROFILE.map((r) => {
    const done = r.lessons.filter((id) => state.done[id]).length, total = r.lessons.length;
    const [label, cls] = done === total ? ["Abgedeckt", "ok"] : done ? ["Im Aufbau", "mid"] : ["Offen", "open"];
    return `<article class="req">
      <div class="req-head"><span class="pill ${cls}">${label}</span><span class="req-count">${done} / ${total}</span></div>
      <h3>${esc(r.text)}</h3>
      <div class="req-bar" aria-hidden="true"><span style="width:${(done / total) * 100}%"></span></div>
      <ul class="req-lessons">${r.lessons.map((id) => {
        const l = byId(id);
        return `<li><button class="req-link${state.done[id] ? " done" : ""}" data-go="${id}"><span class="shape ${TYPE_SHAPE[l.type]}" aria-hidden="true"></span>${esc(l.title)}<span class="req-mod">Modul ${l.moduleNr}</span></button></li>`;
      }).join("")}</ul>
    </article>`;
  }).join("");
  const firstOpen = LESSONS.find((l) => !state.done[l.id]);
  main.innerHTML = `<header class="lesson-head">
      <div class="eyebrow"><span>Übersicht</span><span>${doneCount()} von ${LESSONS.length} Schritten erledigt</span></div>
      <h1>Dein Anforderungsprofil</h1>
      <p class="lead">Jede Anforderung mit den Schritten, die sie abdecken. Manche Schritte zahlen auf mehrere Anforderungen ein.</p>
      ${firstOpen ? `<div><button class="btn-primary" data-go="${firstOpen.id}">Weiter lernen: ${esc(firstOpen.title)}</button></div>` : ""}
    </header>
    <div class="profile">${cards}</div>`;
}

/* ---------- JS-Spickzettel ---------- */
function renderSpickzettel() {
  const sections = SPICKZETTEL.map((s) => `
    <h2>${esc(s.title)}</h2>
    <div class="profile">${s.items.map((it) => `<article class="req">
      <h3><code>${esc(it.term)}</code></h3>
      <p>${it.note}</p>
      ${pre(it.code)}
      ${it.pitfall ? `<p class="note">${it.pitfall}</p>` : ""}
      ${it.lesson ? `<button class="req-deep" data-go="${it.lesson}">Vertiefung: ${esc(byId(it.lesson).title)}</button>` : ""}
    </article>`).join("")}</div>`).join("");
  main.innerHTML = `<header class="lesson-head">
      <div class="eyebrow"><span>Nachschlagen</span></div>
      <h1>JS-Spickzettel</h1>
      <p class="lead">Alle JavaScript-Konstrukte, die dir im Lernpfad begegnen – mit Beispiel, der Stolperfalle, auf die Einsteiger meistens laufen, und einem Link zur Lektion, die das Thema zuerst einführt.</p>
    </header>
    ${sections}`;
}

/* ---------- BPMN-Legende ---------- */
const LEGEND_BASIC = [
    ["Startereignis", "Hier beginnt jede Prozessinstanz.", `<circle class="bp" cx="32" cy="24" r="15"/>`],
    ["Endereignis", "Der Token ist am Ziel, der Pfad endet.", `<circle class="bp bp-thick" cx="32" cy="24" r="14"/>`],
    ["Service Task", "Automatischer Schritt. Dein Worker erledigt ihn.", `<rect class="bp" x="6" y="5" width="52" height="38" rx="7"/><circle cx="16" cy="15" r="5" fill="none" stroke="var(--ink)" stroke-width="2.4" stroke-dasharray="2.2 1.8"/><circle cx="16" cy="15" r="1.8" class="bp-fill"/>`],
    ["User Task", "Ein Mensch erledigt die Aufgabe in der Tasklist.", `<rect class="bp" x="6" y="5" width="52" height="38" rx="7"/><circle cx="16" cy="13" r="3.2" class="bp-fill"/><path d="M10 22c1-4 3.5-5 6-5s5 1 6 5z" class="bp-fill"/>`],
    ["Exklusives Gateway", "Genau ein Weg, abhängig von Bedingungen.", `<path class="bp" d="M32 3 L53 24 L32 45 L11 24 Z"/><path class="bp-line" d="M25 17 L39 31 M39 17 L25 31" stroke-width="3"/>`],
    ["Paralleles Gateway", "Alle Wege gleichzeitig, danach wird gewartet.", `<path class="bp" d="M32 3 L53 24 L32 45 L11 24 Z"/><path class="bp-line" d="M32 14 V34 M22 24 H42" stroke-width="3"/>`],
    ["Timer-Ereignis", "Wartet bis zu einem Zeitpunkt oder eine Dauer.", `<circle class="bp" cx="32" cy="24" r="17"/><circle class="bp" cx="32" cy="24" r="13"/><path class="bp-line" d="M32 16 V24 L37 27"/>`],
    ["Error Boundary Event", "Fängt einen BPMN-Fehler aus job.error() ab.", `<circle class="bp" cx="32" cy="24" r="17"/><circle class="bp" cx="32" cy="24" r="13"/><path class="bp-fill" d="M25 31 L29 17 L33 25 L39 16 L35 31 L31 23 Z"/>`],
];
const LEGEND_EVENTS = [
  ["Nachrichten-Start", "Eine eingehende Nachricht startet eine neue Instanz.", `<circle class="bp" cx="32" cy="24" r="17"/><rect class="bp" x="23" y="17" width="18" height="13" rx="1" style="stroke-width:1.6"/><path class="bp-line" d="M23 17 L32 24 L41 17" style="stroke-width:1.6"/>`],
  ["Nachricht empfangen", "Der Token wartet, bis eine passende Nachricht korreliert.", `<circle class="bp" cx="32" cy="24" r="18"/><circle class="bp" cx="32" cy="24" r="14.5"/><rect class="bp" x="24" y="18" width="16" height="12" rx="1" style="stroke-width:1.5"/><path class="bp-line" d="M24 18 L32 24.5 L40 18" style="stroke-width:1.5"/>`],
  ["Nachricht senden", "Der Prozess verschickt eine Nachricht (gefülltes Symbol).", `<circle class="bp" cx="32" cy="24" r="18"/><circle class="bp" cx="32" cy="24" r="14.5"/><rect class="bp-fill" x="24" y="18" width="16" height="12" rx="1"/><path d="M24 18 L32 24.5 L40 18" fill="none" stroke="var(--surface)" stroke-width="1.5"/>`],
  ["Timer, unterbrechend", "Am Rand eines Tasks: bricht ihn nach Ablauf ab.", `<circle class="bp" cx="32" cy="24" r="18"/><circle class="bp" cx="32" cy="24" r="14.5"/><path class="bp-line" d="M32 16 V24 L37 27"/>`],
  ["Timer, nicht unterbrechend", "Gestrichelt: startet einen Zusatzpfad, der Task läuft weiter.", `<circle class="bp" cx="32" cy="24" r="18" stroke-dasharray="4 3"/><circle class="bp" cx="32" cy="24" r="14.5" stroke-dasharray="4 3"/><path class="bp-line" d="M32 16 V24 L37 27"/>`],
  ["Signal", "Eine Rundsendung an alle wartenden Instanzen, ohne Korrelation.", `<circle class="bp" cx="32" cy="24" r="18"/><circle class="bp" cx="32" cy="24" r="14.5"/><path class="bp" d="M32 15 L40.5 30 L23.5 30 Z" style="stroke-width:1.6"/>`],
  ["Ereignisbasiertes Gateway", "Wartet auf mehrere Ereignisse, das erste gewinnt.", `<path class="bp" d="M32 3 L53 24 L32 45 L11 24 Z"/><circle class="bp" cx="32" cy="24" r="10" style="stroke-width:1.4"/><circle class="bp" cx="32" cy="24" r="7.5" style="stroke-width:1.4"/><path class="bp" d="M32 19.5 L36.3 22.6 L34.6 27.6 L29.4 27.6 L27.7 22.6 Z" style="stroke-width:1.2"/>`],
  ["Terminierendes Ende", "Beendet sofort die ganze Instanz, auch parallele Pfade.", `<circle class="bp bp-thick" cx="32" cy="24" r="14"/><circle class="bp-fill" cx="32" cy="24" r="7.5"/>`],
];
function legendHtml(items) {
  return `<div class="legend">${items.map(([t, d, svg]) => `<figure>
    <svg width="64" height="48" viewBox="0 0 64 48" aria-hidden="true">${svg}</svg>
    <figcaption><strong>${t}</strong><span>${d}</span></figcaption></figure>`).join("")}</div>`;
}

/* ---------- Gateway-Simulator ---------- */
function gatewaySim(host) {
  let mode = "xor", betrag = 1200;
  host.innerHTML = `<div class="sim">
    <div class="sim-controls">
      <div class="seg" role="group" aria-label="Gateway-Typ">
        <button data-mode="xor" aria-pressed="true">Exklusiv (XOR)</button>
        <button data-mode="and" aria-pressed="false">Parallel (AND)</button>
      </div>
      <label class="slider" for="sim-betrag">betrag = <output id="sim-out">1200</output>
        <input type="range" id="sim-betrag" min="0" max="2000" step="50" value="1200"></label>
    </div>
    <div class="sim-canvas">
      <svg viewBox="0 0 680 220" role="img" aria-label="Prozessdiagramm: Bestellung prüfen, Gateway, Manager-Freigabe oder automatische Freigabe, Ende">
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z"/></marker>
          <marker id="arr-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z"/></marker>
        </defs>
        <path id="f1" class="flow" d="M58 110 H78"/>
        <path id="f2" class="flow" d="M200 110 H230"/>
        <path id="f3" class="flow" d="M260 82 V42 H368"/>
        <path id="f4" class="flow" d="M260 138 V178 H368"/>
        <path id="f5" class="flow" d="M500 42 H560 V80"/>
        <path id="f6" class="flow" d="M500 178 H560 V140"/>
        <path id="f7" class="flow" d="M588 110 H620"/>
        <path id="dflt" d="M253 153 L267 145" stroke="var(--ink-3)" stroke-width="1.6"/>
        <text class="cond" id="c1" x="268" y="72">betrag &gt; 1000</text>
        <text class="cond" id="c2" x="270" y="166">default</text>

        <circle class="node" id="n0" cx="40" cy="110" r="17"/>
        <rect class="node" id="t1" x="80" y="82" width="120" height="56" rx="9"/>
        <text class="meta" x="90" y="97">SERVICE</text>
        <text x="140" y="118" text-anchor="middle">Bestellung prüfen</text>
        <path class="node" id="g1" d="M260 82 L288 110 L260 138 L232 110 Z"/>
        <path id="g1m" d="" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" fill="none"/>
        <rect class="node" id="t2" x="370" y="14" width="130" height="56" rx="9"/>
        <text class="meta" x="380" y="29">USER</text>
        <text x="435" y="50" text-anchor="middle">Manager-Freigabe</text>
        <rect class="node" id="t3" x="370" y="150" width="130" height="56" rx="9"/>
        <text class="meta" x="380" y="165">SERVICE</text>
        <text x="435" y="182" text-anchor="middle"><tspan x="435">Automatisch</tspan><tspan x="435" dy="15">freigeben</tspan></text>
        <path class="node" id="g2" d="M560 82 L588 110 L560 138 L532 110 Z"/>
        <path id="g2m" d="" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle class="node" id="n9" cx="640" cy="110" r="16" style="stroke-width:4"/>

        <circle class="tok" id="k2" cx="494" cy="20" r="7"/>
        <circle class="tok" id="k3" cx="494" cy="156" r="7"/>
      </svg>
    </div>
    <p class="sim-status" id="sim-status" aria-live="polite"></p>
  </div>`;

  const $ = (id) => host.querySelector("#" + id);
  const xMark = (cx) => `M${cx - 7} 103 L${cx + 7} 117 M${cx + 7} 103 L${cx - 7} 117`;
  const plusMark = (cx) => `M${cx} 100 V120 M${cx - 10} 110 H${cx + 10}`;

  function update() {
    const upper = mode === "and" || betrag > 1000;
    const lower = mode === "and" || betrag <= 1000;
    const on = { f1: true, f2: true, f3: upper, f5: upper, f4: lower, f6: lower, f7: true };
    Object.entries(on).forEach(([id, v]) => {
      $(id).classList.toggle("on", v);
      $(id).setAttribute("marker-end", v ? "url(#arr-on)" : "url(#arr)");
    });
    ["n0", "t1", "g1", "g2", "n9"].forEach((id) => $(id).classList.add("on"));
    $("t2").classList.toggle("on", upper);
    $("t3").classList.toggle("on", lower);
    $("k2").style.display = upper ? "" : "none";
    $("k3").style.display = lower ? "" : "none";
    $("g1m").setAttribute("d", mode === "xor" ? xMark(260) : plusMark(260));
    $("g2m").setAttribute("d", mode === "xor" ? xMark(560) : plusMark(560));
    $("c1").style.display = $("c2").style.display = $("dflt").style.display = mode === "xor" ? "" : "none";
    $("sim-out").textContent = betrag;
    $("sim-status").innerHTML = mode === "xor"
      ? (betrag > 1000
          ? `<code>${betrag} &gt; 1000</code> ist <strong>wahr</strong>. Der Token nimmt den oberen Pfad zur Manager-Freigabe.`
          : `<code>${betrag} &gt; 1000</code> ist <strong>falsch</strong>. Keine Bedingung passt, der Default-Flow führt zur automatischen Freigabe.`)
      : `Das parallele Gateway erzeugt <strong>zwei Token</strong>, beide Pfade laufen gleichzeitig. Der Betrag spielt keine Rolle. Das rechte Gateway wartet, bis beide angekommen sind.`;
  }
  host.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    host.querySelectorAll("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    update();
  }));
  $("sim-betrag").addEventListener("input", (e) => { betrag = +e.target.value; update(); });
  update();
}

/* ---------- Start ---------- */
document.getElementById("nav-toggle").addEventListener("click", () => {
  const open = document.body.classList.toggle("nav-open");
  document.getElementById("nav-toggle").setAttribute("aria-expanded", String(open));
});
render();
