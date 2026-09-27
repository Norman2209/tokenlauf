// Prüft, dass die Lerninhalte konsistent sind und jede Musterlösung ihre eigenen Tests besteht.
// Aufruf: node tests/pruefe-loesungen.js  (oder: npm test)
const vm = require("vm");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const code =
  fs.readFileSync(path.join(root, "js/inhalte.js"), "utf8") + "\n" +
  fs.readFileSync(path.join(root, "js/app.js"), "utf8") +
  "\n;globalThis.__M = { PROFILE, LESSONS, workerHarness };";

// Minimaler Browser-Ersatz: app.js rendert beim Laden, das DOM wird hier nur geschluckt.
const dummy = new Proxy(function () {}, {
  get: (t, k) => (k === Symbol.toPrimitive ? () => "" : dummy),
  apply: () => dummy,
  set: () => true,
});
const browser = {
  document: dummy, window: dummy, history: dummy, location: { hash: "" },
  localStorage: { getItem: () => null, setItem() {} },
  console, URL, Blob: function () {}, Worker: function () {},
};
vm.createContext(browser);
vm.runInContext(code, browser);
const { PROFILE, LESSONS, workerHarness } = browser.__M;

const problems = [];
const ids = new Set();
LESSONS.forEach((l) => {
  if (ids.has(l.id)) problems.push(`Doppelte Lektions-ID: ${l.id}`);
  ids.add(l.id);
});
PROFILE.forEach((r) => r.lessons.forEach((id) => {
  if (!ids.has(id)) problems.push(`Stellenprofil verweist auf unbekannte Lektion: ${id}`);
}));
LESSONS.filter((l) => l.type === "fill").forEach((l) => {
  const marks = [...l.code.matchAll(/\[\[(\w+)\]\]/g)].map((m) => m[1]).sort().join();
  if (marks !== Object.keys(l.blanks).sort().join()) problems.push(`Lücken passen nicht zu blanks: ${l.id}`);
});
LESSONS.filter((l) => l.type === "sort").forEach((l) => l.items.forEach((it) => {
  if (!l.categories.some((c) => c.id === it.cat)) problems.push(`Unbekannte Kategorie "${it.cat}" in ${l.id}`);
}));
LESSONS.filter((l) => l.type === "quiz").forEach((l) => l.questions.forEach((q, i) => {
  if (!(q.correct >= 0 && q.correct < q.options.length)) problems.push(`Ungültige Antwort-Nummer in ${l.id}, Frage ${i + 1}`);
}));

async function pruefeCodeLektion(l) {
  const messages = [];
  const worker = {
    console: { log() {}, info() {}, warn() {}, error() {} },
    URL, JSON, Math, Object, Promise, Error, TypeError, Set, setTimeout,
  };
  worker.self = worker;
  worker.postMessage = (m) => messages.push(m);
  vm.createContext(worker);
  const tests = l.tests.map(([n, f]) => `[${JSON.stringify(n)}, ${f.toString()}]`).join(",\n");
  const src = `(${workerHarness.toString()})();
${l.solution}
;(async () => {
  for (const [name, fn] of [${tests}]) {
    try { await fn(self.__helpers); self.postMessage({ name, pass: true }); }
    catch (e) { self.postMessage({ name, pass: false, msg: self.__explain(e) }); }
  }
  self.postMessage({ done: true });
})();`;
  try {
    vm.runInContext(src, worker);
  } catch (e) {
    problems.push(`${l.id}: ${e.message}`);
    return;
  }
  for (let i = 0; i < 40 && !messages.some((m) => m.done); i++) await new Promise((r) => setTimeout(r, 25));
  messages.filter((m) => m.pass === false).forEach((m) => problems.push(`${l.id} / ${m.name}: ${m.msg}`));
  if (!messages.some((m) => m.done)) problems.push(`${l.id}: Tests wurden nicht fertig`);
}

(async () => {
  const codeLektionen = LESSONS.filter((l) => l.type === "code");
  for (const l of codeLektionen) await pruefeCodeLektion(l);
  console.log(`${LESSONS.length} Lektionen, davon ${codeLektionen.length} Code-Übungen geprüft.`);
  if (problems.length) {
    console.error(problems.map((p) => "✗ " + p).join("\n"));
    process.exit(1);
  }
  console.log("✓ Alles in Ordnung.");
})();
