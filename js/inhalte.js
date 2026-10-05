/* =========================================================
   Hilfsfunktionen
   ========================================================= */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const KEYWORDS = /^(const|let|var|function|return|if|else|for|of|in|while|async|await|new|throw|try|catch|true|false|null|undefined|and|or|not|then|import|from|public|private|protected|final|static|void|int|double|boolean|record|this|throws|extends|implements|interface|class|export|default)$/;
function hl(src) {
  const re = /(\/\/[^\n]*|#[^\n]*$)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(@[A-Za-z]\w*)|\b([A-Za-z_]\w*)\b|\b(\d+(?:\.\d+)?)\b/gm;
  let out = "", last = 0, m;
  while ((m = re.exec(src))) {
    out += esc(src.slice(last, m.index));
    if (m[1]) out += `<span class="c">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="s">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="a">${esc(m[3])}</span>`;
    else if (m[4]) out += KEYWORDS.test(m[4]) ? `<span class="k">${m[4]}</span>` : esc(m[4]);
    else if (m[5]) out += `<span class="n">${m[5]}</span>`;
    last = re.lastIndex;
  }
  return out + esc(src.slice(last));
}
const pre = (src) => `<pre class="code"><code>${hl(src.replace(/^\n/, "").replace(/\s+$/, ""))}</code></pre>`;

/* =========================================================
   Lerninhalte
   Tests sind Funktionen, die im Web Worker neben deinem Code laufen.
   Sie bekommen Helfer: eq, assert, runJob, fetchLog.
   ========================================================= */
const MODULES = [
{
  id: "m1", title: "Grundlagen", sub: "JavaScript-Bausteine für Prozessdaten",
  lessons: [
  {
    id: "variablen", type: "code", title: "Variablen & Datentypen", file: "variablen.js",
    theory: `
      <p class="story"><b>NordPaket GmbH —</b> Du fängst heute im Team Prozessautomatisierung an. Dein erster Auftrag: den Bestellprozess von NordPaket Schritt für Schritt automatisieren. Los geht's, wie bei jedem Prozess, bei den Daten, die darin mitlaufen.</p>
      <p>In jedem automatisierten Prozess wandern Daten mit: eine Auftragsnummer, ein Betrag, die Info, ob Expressversand gewünscht ist. In Camunda heißen sie <strong>Prozessvariablen</strong>. In deinem Code speicherst du solche Werte in Variablen.</p>
      ${pre(`
// const: der Wert bleibt gleich
const kundenname = "Erika Musterfrau";   // string (Text)
const bestellwert = 129.95;               // number (Zahl)
const istNeukunde = false;                // boolean (wahr/falsch)

// let: der Wert darf sich später ändern
let versuche = 0;
versuche = versuche + 1;

console.log(kundenname, bestellwert, versuche);
`)}
      <p>Nimm standardmäßig <code>const</code>. Nur wenn du einen Wert später neu zuweisen musst, nimm <code>let</code>. <code>var</code> ist veraltet und kommt in modernem Code nicht mehr vor.</p>
      <h3>Die Datentypen, die dir ständig begegnen</h3>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Typ</th><th>Beispiel</th><th>Im Prozess z. B.</th></tr></thead>
        <tbody>
          <tr><td>string</td><td><code>"A-1001"</code></td><td>Auftragsnummer, E-Mail</td></tr>
          <tr><td>number</td><td><code>249.9</code></td><td>Betrag, Menge, Score</td></tr>
          <tr><td>boolean</td><td><code>true</code></td><td>Express? Freigegeben?</td></tr>
          <tr><td>null</td><td><code>null</code></td><td>bewusst leer, z. B. noch kein Prüfer</td></tr>
          <tr><td>object</td><td><code>{ name: "Erika" }</code></td><td>Kunde, Bestellung</td></tr>
          <tr><td>array</td><td><code>[1, 2, 3]</code></td><td>Positionen, Freigeber</td></tr>
        </tbody>
      </table></div>
      <p class="note">Dezimalzahlen schreibst du mit Punkt: <code>249.9</code>, nicht <code>249,9</code>.</p>`,
    task: `
      <p>Lege drei Konstanten an:</p>
      <ul>
        <li><code>auftragsnummer</code> mit dem Text <code>"A-1001"</code></li>
        <li><code>betrag</code> mit der Zahl <code>249.9</code></li>
        <li><code>istExpress</code> mit dem Wert <code>true</code></li>
      </ul>
      <p>Gib alle drei mit <code>console.log</code> aus und schau dir die Konsole an.</p>`,
    starter: `// Lege hier deine drei Konstanten an
const auftragsnummer = "";

console.log(auftragsnummer);
`,
    hint: `Texte stehen in Anführungszeichen, Zahlen und <code>true</code>/<code>false</code> nicht. Also <code>const betrag = 249.9;</code>, nicht <code>"249.9"</code>.`,
    solution: `const auftragsnummer = "A-1001";
const betrag = 249.9;
const istExpress = true;

console.log(auftragsnummer, betrag, istExpress);
`,
    tests: [
      ['auftragsnummer ist der Text "A-1001"', ({ eq, assert }) => {
        assert(typeof auftragsnummer === "string", "auftragsnummer sollte ein Text (string) sein, ist aber " + typeof auftragsnummer);
        eq(auftragsnummer, "A-1001", "auftragsnummer");
      }],
      ["betrag ist die Zahl 249.9", ({ eq, assert }) => {
        assert(typeof betrag !== "undefined", "betrag ist noch nicht angelegt");
        assert(typeof betrag === "number", "betrag sollte eine Zahl (number) sein, ist aber " + typeof betrag);
        eq(betrag, 249.9, "betrag");
      }],
      ["istExpress ist true", ({ eq, assert }) => {
        assert(typeof istExpress !== "undefined", "istExpress ist noch nicht angelegt");
        assert(typeof istExpress === "boolean", "istExpress sollte ein boolean sein, ist aber " + typeof istExpress);
        eq(istExpress, true, "istExpress");
      }],
    ],
  },
  {
    id: "bedingungen", type: "code", title: "Bedingungen & Funktionen", file: "versand.js",
    theory: `
      <p>Ein <strong>exklusives Gateway</strong> in BPMN schickt den Prozess je nach Daten auf genau einen Weg. Im Code ist das eine <code>if</code>-Abfrage. Damit du Logik wiederverwenden kannst, packst du sie in eine <strong>Funktion</strong>: Sie bekommt Werte (Parameter) und gibt mit <code>return</code> ein Ergebnis zurück.</p>
      ${pre(`
function pruefeFreigabe(betrag) {
  if (betrag > 1000) {
    return "manager";
  } else if (betrag > 500) {
    return "teamleitung";
  } else {
    return "automatisch";
  }
}

console.log(pruefeFreigabe(750)); // "teamleitung"
`)}
      <p>Als BPMN sieht dieselbe Entscheidung so aus: ein <strong>exklusives Gateway</strong> mit einem Pfad je Bedingung. Der letzte Pfad hat keine eigene Bedingung, er ist der <strong>Default-Flow</strong> und entspricht dem <code>else</code> im Code.</p>
      <div class="sim"><div class="sim-canvas">
        <svg viewBox="0 0 620 244" role="img" aria-label="BPMN-Diagramm: Start, exklusives Gateway 'pruefeFreigabe', drei Pfade nach Betrag, drei Enden mit dem jeweiligen Rückgabewert">
          <defs>
            <marker id="arr-cond" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--ink-3)"/></marker>
          </defs>
          <path class="flow" marker-end="url(#arr-cond)" d="M47 120 H96"/>
          <path class="flow" marker-end="url(#arr-cond)" d="M144 120 V40 H522"/>
          <path class="flow" marker-end="url(#arr-cond)" d="M144 120 H522"/>
          <path class="flow" marker-end="url(#arr-cond)" d="M144 120 V200 H522"/>

          <text class="cond" x="215" y="32">betrag &gt; 1000</text>
          <text class="cond" x="215" y="112">betrag &gt; 500</text>
          <text class="cond" x="215" y="216">sonst (Default-Flow)</text>

          <circle class="bp" cx="32" cy="120" r="15"/>
          <path class="bp" d="M120 96 L144 120 L120 144 L96 120 Z"/>
          <path class="bp-line" d="M112 112 L128 128 M128 112 L112 128" stroke-width="3"/>

          <circle class="bp bp-thick" cx="536" cy="40" r="14"/>
          <circle class="bp bp-thick" cx="536" cy="120" r="14"/>
          <circle class="bp bp-thick" cx="536" cy="200" r="14"/>
          <text x="536" y="66" text-anchor="middle">return "manager"</text>
          <text x="536" y="146" text-anchor="middle">return "teamleitung"</text>
          <text x="536" y="226" text-anchor="middle">return "automatisch"</text>
        </svg>
      </div></div>
      <p class="note">Das ist eine Analogie für das <strong>Muster</strong>, nicht für den <strong>Ort</strong>: Dein <code>if</code> hier ist reine JavaScript-Übung. Im echten Prozess steht die Gateway-Bedingung als <strong>FEEL-Ausdruck im Modell</strong> (z. B. <code>= betrag &gt; 1000</code>) und wird von der Engine ausgewertet, nicht von deinem Code. Dein Job Worker liefert nur die Variable, auf die sich die Bedingung bezieht, z. B. mit <code>job.complete({ betrag: 750 })</code>. FEEL lernst du in Modul 3, Job Worker in Modul 4 – dort fügt sich das zusammen.</p>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Operator</th><th>Bedeutung</th><th>Beispiel</th></tr></thead>
        <tbody>
          <tr><td><code>===</code> / <code>!==</code></td><td>gleich / ungleich</td><td><code>status === "offen"</code></td></tr>
          <tr><td><code>&gt;</code> <code>&gt;=</code> <code>&lt;</code> <code>&lt;=</code></td><td>größer / kleiner</td><td><code>betrag &gt;= 100</code></td></tr>
          <tr><td><code>&amp;&amp;</code></td><td>und</td><td><code>istVip &amp;&amp; betrag &gt; 50</code></td></tr>
          <tr><td><code>||</code></td><td>oder</td><td><code>land === "DE" || land === "AT"</code></td></tr>
          <tr><td><code>!</code></td><td>nicht</td><td><code>!istGesperrt</code></td></tr>
        </tbody>
      </table></div>
      <p>Die Reihenfolge zählt: Die erste zutreffende Bedingung gewinnt, der Rest wird übersprungen. Genau so arbeitet eine DMN-Tabelle mit Hit Policy FIRST, die dir in Modul 3 begegnet.</p>`,
    task: `
      <p>Schreibe die Funktion <code>versandart(betrag, istExpress)</code>. Sie gibt zurück:</p>
      <ul>
        <li><code>"express"</code>, wenn <code>istExpress</code> wahr ist (egal wie hoch der Betrag)</li>
        <li>sonst <code>"kostenlos"</code>, wenn der Betrag mindestens 100 ist</li>
        <li>sonst <code>"standard"</code></li>
      </ul>`,
    starter: `function versandart(betrag, istExpress) {
  // Deine Logik hier
  return "standard";
}

console.log(versandart(120, false)); // erwartet: "kostenlos"
`,
    hint: `Prüfe zuerst <code>istExpress</code>, dann den Betrag. "Mindestens 100" heißt <code>betrag &gt;= 100</code>.`,
    solution: `function versandart(betrag, istExpress) {
  if (istExpress) {
    return "express";
  } else if (betrag >= 100) {
    return "kostenlos";
  }
  return "standard";
}

console.log(versandart(120, false)); // "kostenlos"
`,
    tests: [
      ['versandart(50, true) → "express"', ({ eq }) => eq(versandart(50, true), "express")],
      ['versandart(150, true) → "express" (Express hat Vorrang)', ({ eq }) => eq(versandart(150, true), "express")],
      ['versandart(100, false) → "kostenlos"', ({ eq }) => eq(versandart(100, false), "kostenlos")],
      ['versandart(99.99, false) → "standard"', ({ eq }) => eq(versandart(99.99, false), "standard")],
    ],
  },
  {
    id: "schleifen", type: "code", title: "Arrays & Schleifen", file: "summe.js",
    theory: `
      <p>Eine Bestellung hat mehrere Positionen. So etwas speicherst du als <strong>Array</strong> (Liste) von <strong>Objekten</strong>. Auf Eigenschaften greifst du mit einem Punkt zu, auf Listenelemente mit ihrer Position in eckigen Klammern.</p>
      ${pre(`
const bestellung = {
  id: "B-2001",
  positionen: [
    { artikel: "Kabel", preis: 4.5, menge: 10 },
    { artikel: "Router", preis: 89, menge: 1 },
  ],
};

console.log(bestellung.positionen.length);      // 2
console.log(bestellung.positionen[0].artikel);  // "Kabel"

let stueckzahl = 0;
for (const position of bestellung.positionen) {
  stueckzahl = stueckzahl + position.menge;
}
console.log(stueckzahl); // 11
`)}
      <p>Arrays zählen ab 0. <code>for...of</code> geht jedes Element der Reihe nach durch. So ähnlich arbeitet in BPMN eine <strong>Multi-Instance-Aktivität</strong>: Sie führt eine Aufgabe für jedes Element einer Liste aus. Die drei waagrechten Striche im Symbol markieren <strong>sequentiell</strong>, also nacheinander wie <code>for...of</code>. Drei senkrechte Striche stünden für <strong>parallel</strong>, dazu mehr in Modul 3.</p>
      <div class="sim"><div class="sim-canvas">
        <svg viewBox="0 0 460 150" role="img" aria-label="BPMN-Diagramm: Start, Multi-Instance-Aktivität 'Position verarbeiten' mit sequentiellem Marker, für jede Position in positionen, Ende">
          <defs>
            <marker id="arr-mi" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--ink-3)"/></marker>
          </defs>
          <path class="flow" marker-end="url(#arr-mi)" d="M47 93 H120"/>
          <path class="flow" marker-end="url(#arr-mi)" d="M300 93 H361"/>

          <text class="cond" x="120" y="45">für jede Position in positionen</text>

          <circle class="bp" cx="32" cy="93" r="15"/>
          <rect class="bp" x="120" y="57" width="180" height="72" rx="9"/>
          <text class="meta" x="130" y="72">SERVICE</text>
          <text x="210" y="98" text-anchor="middle">Position verarbeiten</text>
          <g stroke="var(--ink)" stroke-width="1.8" stroke-linecap="round">
            <line x1="200" y1="112" x2="220" y2="112"/>
            <line x1="200" y1="117" x2="220" y2="117"/>
            <line x1="200" y1="122" x2="220" y2="122"/>
          </g>
          <circle class="bp bp-thick" cx="376" cy="93" r="15"/>
        </svg>
      </div></div>`,
    task: `
      <p>Schreibe <code>gesamtsumme(positionen)</code>. Die Funktion bekommt ein Array wie</p>
      ${pre(`[{ preis: 10, menge: 2 }, { preis: 5.5, menge: 4 }]`)}
      <p>und gibt die Summe aller <code>preis * menge</code> zurück (hier <code>42</code>). Ein leeres Array ergibt <code>0</code>.</p>`,
    starter: `function gesamtsumme(positionen) {
  let summe = 0;
  // Gehe alle Positionen durch und addiere preis * menge

  return summe;
}

console.log(gesamtsumme([{ preis: 10, menge: 2 }, { preis: 5.5, menge: 4 }]));
`,
    hint: `Nutze <code>for (const p of positionen) { ... }</code> und darin <code>summe = summe + p.preis * p.menge;</code>`,
    solution: `function gesamtsumme(positionen) {
  let summe = 0;
  for (const p of positionen) {
    summe = summe + p.preis * p.menge;
  }
  return summe;
}

console.log(gesamtsumme([{ preis: 10, menge: 2 }, { preis: 5.5, menge: 4 }])); // 42
`,
    tests: [
      ["Zwei Positionen ergeben 42", ({ eq }) => eq(gesamtsumme([{ preis: 10, menge: 2 }, { preis: 5.5, menge: 4 }]), 42)],
      ["Eine Position: 89 × 3 = 267", ({ eq }) => eq(gesamtsumme([{ preis: 89, menge: 3 }]), 267)],
      ["Leeres Array ergibt 0", ({ eq }) => eq(gesamtsumme([]), 0)],
    ],
  },
  {
    id: "array-methoden", type: "code", title: "filter, map & find", file: "auftraege.js",
    theory: `
      <p>Statt Schleifen von Hand zu schreiben, nutzt moderner Code die eingebauten Array-Methoden. Du übergibst ihnen eine kleine Funktion, die für jedes Element aufgerufen wird.</p>
      ${pre(`
const tickets = [
  { id: "T-1", prio: "hoch", offen: true },
  { id: "T-2", prio: "niedrig", offen: false },
  { id: "T-3", prio: "hoch", offen: true },
];

// filter: behält nur Elemente, für die die Bedingung true ist
const dringend = tickets.filter((t) => t.prio === "hoch");

// map: macht aus jedem Element etwas Neues
const ids = dringend.map((t) => t.id);            // ["T-1", "T-3"]

// find: das erste passende Element (oder undefined)
const t2 = tickets.find((t) => t.id === "T-2");

// some: gibt es mindestens eins?
const nochWasOffen = tickets.some((t) => t.offen); // true

// reduce: alles zu einem Wert zusammenfassen
// n ist der Zwischenstand (startet bei 0, dem letzten Argument), t das aktuelle Element
const anzahlOffen = tickets.reduce((n, t) => (t.offen ? n + 1 : n), 0);
`)}
      <p><code>(t) =&gt; t.prio === "hoch"</code> ist eine <strong>Pfeilfunktion</strong>: eine kurze Funktion ohne Namen. Die Methoden ändern das ursprüngliche Array nicht, sondern liefern ein neues. Das macht Worker-Code gut nachvollziehbar.</p>`,
    task: `
      <p>Schreibe zwei Funktionen:</p>
      <ul>
        <li><code>offeneAuftragsIds(auftraege)</code> gibt ein Array mit den <code>id</code>s aller Aufträge zurück, deren <code>status</code> <code>"offen"</code> ist.</li>
        <li><code>findeAuftrag(auftraege, id)</code> gibt den Auftrag mit dieser <code>id</code> zurück, oder <code>undefined</code>, wenn es ihn nicht gibt.</li>
      </ul>`,
    starter: `const auftraege = [
  { id: "A-1", status: "offen" },
  { id: "A-2", status: "erledigt" },
  { id: "A-3", status: "offen" },
];

function offeneAuftragsIds(auftraege) {
  // filter + map
}

function findeAuftrag(auftraege, id) {
  // find
}

console.log(offeneAuftragsIds(auftraege)); // ["A-1", "A-3"]
`,
    hint: `<code>return auftraege.filter((a) =&gt; a.status === "offen").map((a) =&gt; a.id);</code> Und für die zweite: <code>find</code> mit <code>a.id === id</code>.`,
    solution: `const auftraege = [
  { id: "A-1", status: "offen" },
  { id: "A-2", status: "erledigt" },
  { id: "A-3", status: "offen" },
];

function offeneAuftragsIds(auftraege) {
  return auftraege
    .filter((a) => a.status === "offen")
    .map((a) => a.id);
}

function findeAuftrag(auftraege, id) {
  return auftraege.find((a) => a.id === id);
}

console.log(offeneAuftragsIds(auftraege)); // ["A-1", "A-3"]
`,
    tests: [
      ['offeneAuftragsIds liefert ["A-1", "A-3"]', ({ eq }) => eq(offeneAuftragsIds([{ id: "A-1", status: "offen" }, { id: "A-2", status: "erledigt" }, { id: "A-3", status: "offen" }]), ["A-1", "A-3"])],
      ["offeneAuftragsIds([]) liefert []", ({ eq }) => eq(offeneAuftragsIds([]), [])],
      ['findeAuftrag findet "A-2"', ({ eq }) => eq(findeAuftrag([{ id: "A-1", status: "offen" }, { id: "A-2", status: "erledigt" }], "A-2"), { id: "A-2", status: "erledigt" })],
      ["findeAuftrag liefert undefined für unbekannte id", ({ eq }) => eq(findeAuftrag([{ id: "A-1", status: "offen" }], "A-99"), undefined)],
    ],
  },
  {
    id: "grundlagen-quiz", type: "quiz", title: "Kurz-Check: Grundlagen",
    theory: `<p>Vier Fragen zu den Grundlagen. Du kannst so oft antworten, bis es passt.</p>`,
    questions: [
      { q: `Was ergibt <code>"5" === 5</code>?`, options: ["<code>true</code>", "<code>false</code>", "Einen Fehler"], correct: 1,
        explain: `<code>===</code> vergleicht Wert <em>und</em> Typ. Ein Text ist keine Zahl, also <code>false</code>. Mit <code>==</code> wäre es <code>true</code>. Deshalb nimmst du immer <code>===</code>.` },
      { q: `Eine Variable zählt Wiederholungsversuche hoch. Wie legst du sie an?`, options: ["<code>const versuche = 0;</code>", "<code>let versuche = 0;</code>", "<code>versuche := 0;</code>"], correct: 1,
        explain: `Der Wert ändert sich, also <code>let</code>. Eine <code>const</code> neu zuzuweisen führt zu einem TypeError.` },
      { q: `Was liefert <code>[3, 8, 12].filter((z) =&gt; z &gt; 5)</code>?`, options: ["<code>[8, 12]</code>", "<code>[false, true, true]</code>", "<code>8</code>"], correct: 0,
        explain: `<code>filter</code> behält die Elemente, für die die Bedingung stimmt. <code>[false, true, true]</code> käme bei <code>map</code> heraus, <code>8</code> bei <code>find</code>.` },
      { q: `Wie verarbeitest du jede Position einer Bestellung der Reihe nach?`, options: ["<code>for (const p of positionen) { … }</code>", "<code>if (positionen) { … }</code>", "<code>while (true) { … }</code>"], correct: 0,
        explain: `<code>for...of</code> läuft genau einmal über jedes Element. <code>while (true)</code> ohne Abbruch wäre eine Endlosschleife.` },
    ],
  },
  ],
},
{
  id: "m2", title: "Daten & Schnittstellen", sub: "JSON, Mapping und REST-APIs",
  lessons: [
  {
    id: "json", type: "code", title: "JSON lesen und schreiben", file: "json.js",
    theory: `
      <p class="story"><b>NordPaket GmbH —</b> Der Webshop schickt dir Bestelldaten als JSON. Bevor du sie in den Prozess einspeist, musst du sie lesen und richtig umformen können.</p>
      <p>Wenn Systeme Daten austauschen, dann fast immer als <strong>JSON</strong>. Auch Camunda speichert Prozessvariablen als JSON. JSON sieht aus wie ein JavaScript-Objekt, ist aber Text mit strengeren Regeln: Schlüssel in doppelten Anführungszeichen, keine Funktionen, kein <code>undefined</code>, kein Komma am Ende.</p>
      ${pre(`
const text = '{"kunde": {"name": "Erika", "vip": true}}';

const daten = JSON.parse(text);        // Text → Objekt
console.log(daten.kunde.name);         // "Erika"

const zurueck = JSON.stringify(daten); // Objekt → Text
console.log(zurueck);
`)}
      <p>Echte Daten sind oft unvollständig. Zwei Operatoren schützen dich vor Abstürzen:</p>
      ${pre(`
const kunde = { name: "Max" };          // keine Adresse!

kunde.adresse.stadt                     // TypeError: Cannot read properties of undefined
kunde.adresse?.stadt                    // undefined statt Absturz
kunde.adresse?.stadt ?? "unbekannt"     // "unbekannt" als Ersatzwert
`)}
      <p><code>?.</code> (Optional Chaining) bricht ab, wenn links nichts steht. <code>??</code> liefert den rechten Wert, wenn links <code>null</code> oder <code>undefined</code> steht.</p>`,
    task: `
      <p>Schreibe <code>kundenStadt(jsonText)</code>. Die Funktion bekommt JSON als <em>Text</em>, zum Beispiel</p>
      ${pre(`{"kunde": {"name": "Erika", "adresse": {"stadt": "Köln", "plz": "50667"}}}`)}
      <p>und gibt <code>kunde.adresse.stadt</code> zurück. Fehlt die Adresse, gibt sie <code>"unbekannt"</code> zurück.</p>`,
    starter: `function kundenStadt(jsonText) {
  // 1. Text in ein Objekt umwandeln
  // 2. Stadt auslesen, mit Ersatzwert "unbekannt"
}

console.log(kundenStadt('{"kunde": {"name": "Max"}}')); // "unbekannt"
`,
    hint: `Erst <code>const daten = JSON.parse(jsonText);</code>, dann <code>return daten.kunde?.adresse?.stadt ?? "unbekannt";</code>`,
    solution: `function kundenStadt(jsonText) {
  const daten = JSON.parse(jsonText);
  return daten.kunde?.adresse?.stadt ?? "unbekannt";
}

console.log(kundenStadt('{"kunde": {"name": "Max"}}')); // "unbekannt"
`,
    tests: [
      ['Mit Adresse → "Köln"', ({ eq }) => eq(kundenStadt('{"kunde": {"name": "Erika", "adresse": {"stadt": "Köln", "plz": "50667"}}}'), "Köln")],
      ['Ohne Adresse → "unbekannt"', ({ eq }) => eq(kundenStadt('{"kunde": {"name": "Max"}}'), "unbekannt")],
      ['Andere Stadt → "Leipzig"', ({ eq }) => eq(kundenStadt('{"kunde": {"adresse": {"stadt": "Leipzig"}}}'), "Leipzig")],
    ],
  },
  {
    id: "mapping", type: "code", title: "Daten in Form bringen", file: "mapping.js",
    theory: `
      <p>Eine API liefert selten genau die Struktur, die dein Prozess braucht. Oft ist die Antwort tief verschachtelt, englisch benannt und enthält viel Überflüssiges. Bevor du Daten an den Prozess zurückgibst, bringst du sie in Form. Das nennt man <strong>Mapping</strong>.</p>
      <p>In Camunda gibt es dafür zwei Orte: <strong>Input-/Output-Mappings</strong> direkt am BPMN-Element (mit FEEL) oder die Umwandlung im Worker-Code. Gib nur zurück, was der Prozess wirklich braucht. Jede Variable landet im Zustand der Prozessinstanz und ist in Operate sichtbar.</p>
      ${pre(`
const antwort = {
  data: { product: { sku: "R-100", title: "Router", stock: { available: 3 } } },
};

// Destructuring: Werte gezielt herausziehen
const { sku, title, stock } = antwort.data.product;

const artikel = {
  artikelNr: sku,
  name: title,
  lieferbar: stock.available > 0,
};

// Template-Literal: Text mit eingesetzten Werten
const zeile = \`\${title} (\${sku})\`;   // "Router (R-100)"
`)}`,
    task: `
      <p>Schreibe <code>mappeKunde(antwort)</code>. Die API liefert:</p>
      ${pre(`
{
  data: {
    customer: {
      id: "K-42",
      firstName: "Erika",
      lastName: "Musterfrau",
      rating: { score: 720, updated: "2026-09-01" }
    }
  },
  meta: { requestId: "f3a9", durationMs: 41 }
}`)}
      <p>Der Prozess braucht genau dieses Objekt:</p>
      ${pre(`{ kundeId: "K-42", name: "Erika Musterfrau", score: 720, kreditwuerdig: true }`)}
      <p><code>kreditwuerdig</code> ist <code>true</code> ab einem Score von 600.</p>`,
    starter: `function mappeKunde(antwort) {
  const { id, firstName, lastName, rating } = antwort.data.customer;

  return {
    // kundeId, name, score, kreditwuerdig
  };
}

console.log(mappeKunde({
  data: { customer: { id: "K-42", firstName: "Erika", lastName: "Musterfrau", rating: { score: 720 } } },
}));
`,
    hint: `<code>name: \`\${firstName} \${lastName}\`</code> und <code>kreditwuerdig: rating.score &gt;= 600</code>`,
    solution: `function mappeKunde(antwort) {
  const { id, firstName, lastName, rating } = antwort.data.customer;

  return {
    kundeId: id,
    name: \`\${firstName} \${lastName}\`,
    score: rating.score,
    kreditwuerdig: rating.score >= 600,
  };
}

console.log(mappeKunde({
  data: { customer: { id: "K-42", firstName: "Erika", lastName: "Musterfrau", rating: { score: 720 } } },
}));
`,
    tests: [
      ["Erika (Score 720) wird korrekt gemappt", ({ eq }) => eq(
        mappeKunde({ data: { customer: { id: "K-42", firstName: "Erika", lastName: "Musterfrau", rating: { score: 720, updated: "2026-09-01" } } }, meta: { requestId: "f3a9", durationMs: 41 } }),
        { kundeId: "K-42", name: "Erika Musterfrau", score: 720, kreditwuerdig: true })],
      ["Max (Score 410) ist nicht kreditwürdig", ({ eq }) => eq(
        mappeKunde({ data: { customer: { id: "K-7", firstName: "Max", lastName: "Mustermann", rating: { score: 410 } } } }),
        { kundeId: "K-7", name: "Max Mustermann", score: 410, kreditwuerdig: false })],
      ["Grenzfall: Score 600 ist kreditwürdig", ({ eq }) => eq(
        mappeKunde({ data: { customer: { id: "K-1", firstName: "A", lastName: "B", rating: { score: 600 } } } }).kreditwuerdig, true, "kreditwuerdig")],
    ],
  },
  {
    id: "async", type: "code", title: "async/await & REST", file: "kunden-api.js",
    theory: `
      <p>Service Tasks rufen häufig andere Systeme über <strong>REST-APIs</strong> auf: CRM, ERP, Zahlungsdienst. Das dauert, deshalb laufen solche Aufrufe <strong>asynchron</strong>. <code>fetch</code> liefert ein Promise, also ein Versprechen auf ein späteres Ergebnis. Mit <code>await</code> wartest du darauf. <code>await</code> funktioniert nur in Funktionen, die mit <code>async</code> markiert sind.</p>
      ${pre(`
async function ladeKunde(id) {
  const response = await fetch(\`https://api.example.com/kunden/\${id}\`);

  if (!response.ok) {                  // Status außerhalb von 200–299
    throw new Error(\`Fehler \${response.status}\`);
  }
  return await response.json();        // Body als Objekt
}

// Daten senden: POST mit JSON-Body (innerhalb einer async-Funktion)
const response = await fetch("https://api.example.com/bestellungen", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ artikel: "Router", menge: 1 }),
});
`)}
      <h3>Die Übungs-API</h3>
      <p>Echte Server sind aus dieser App heraus nicht erreichbar. <code>fetch</code> spricht hier mit einer simulierten API unter <code>https://api.example.com</code>:</p>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Anfrage</th><th>Antwort</th></tr></thead>
        <tbody>
          <tr><td><code>GET /kunden/42</code></td><td>200, Erika Musterfrau (Score 720)</td></tr>
          <tr><td><code>GET /kunden/7</code></td><td>200, Max Mustermann (Score 410)</td></tr>
          <tr><td><code>GET /kunden/13</code></td><td>503, Kundensystem wird gewartet</td></tr>
          <tr><td><code>GET /kunden/…</code> sonst</td><td>404, Kunde nicht gefunden</td></tr>
          <tr><td><code>POST /bestellungen</code></td><td>201, legt eine Bestellung an</td></tr>
        </tbody>
      </table></div>`,
    task: `
      <p>Schreibe <code>async function ladeKunde(id)</code>:</p>
      <ul>
        <li>Rufe <code>GET https://api.example.com/kunden/&lt;id&gt;</code> auf.</li>
        <li>Ist die Antwort ok, gib den JSON-Body zurück.</li>
        <li>Sonst wirf einen Fehler mit der Nachricht <code>Kunde &lt;id&gt; nicht gefunden</code>, also z. B. <code>"Kunde 999 nicht gefunden"</code>.</li>
      </ul>`,
    starter: `async function ladeKunde(id) {
  const response = await fetch(\`https://api.example.com/kunden/\${id}\`);

  // Prüfe response.ok und gib die Daten zurück
}

// Hier, außerhalb einer async-Funktion, gibt es kein await auf oberster Ebene.
// Deshalb .then() statt await – beides wartet auf dasselbe Promise.
ladeKunde(42).then((kunde) => console.log(kunde));
`,
    hint: `<code>if (!response.ok) { throw new Error(\`Kunde \${id} nicht gefunden\`); }</code> und danach <code>return await response.json();</code>`,
    solution: `async function ladeKunde(id) {
  const response = await fetch(\`https://api.example.com/kunden/\${id}\`);

  if (!response.ok) {
    throw new Error(\`Kunde \${id} nicht gefunden\`);
  }
  return await response.json();
}

// Hier, außerhalb einer async-Funktion, gibt es kein await auf oberster Ebene.
// Deshalb .then() statt await – beides wartet auf dasselbe Promise.
ladeKunde(42).then((kunde) => console.log(kunde));
`,
    tests: [
      ["ladeKunde(42) liefert Erika Musterfrau", async ({ eq, assert }) => {
        const kunde = await ladeKunde(42);
        assert(kunde && typeof kunde === "object", "ladeKunde(42) sollte ein Objekt liefern, liefert aber " + JSON.stringify(kunde));
        eq(kunde.name, "Erika Musterfrau", "kunde.name");
      }],
      ["Ruft die Übungs-API mit /kunden/42 auf", async ({ assert, fetchLog }) => {
        await ladeKunde(42);
        assert(fetchLog().some((f) => f.url.endsWith("/kunden/42")), "Es gab keinen fetch-Aufruf auf https://api.example.com/kunden/42");
      }],
      ['ladeKunde(999) wirft "Kunde 999 nicht gefunden"', async ({ eq, assert }) => {
        let fehler = null;
        try { await ladeKunde(999); } catch (e) { fehler = e; }
        assert(fehler, "ladeKunde(999) sollte einen Fehler werfen, hat aber keinen geworfen");
        eq(fehler.message, "Kunde 999 nicht gefunden", "Fehlermeldung");
      }],
    ],
  },
  {
    id: "rest-design", type: "quiz", title: "REST-APIs entwerfen",
    theory: `
      <p>Bisher hast du APIs aufgerufen. In Integrationsprojekten entwirfst du sie auch: für Worker, für Fachanwendungen, für Partner. Ein gutes REST-API ist um <strong>Ressourcen</strong> gebaut, also um Substantive, nicht um Aktionen.</p>
      ${pre(`
GET    /bestellungen?status=offen&seite=2   Liste, gefiltert und seitenweise
GET    /bestellungen/B-2001                 eine Bestellung
POST   /bestellungen                        neu anlegen → 201 + Location-Header
PUT    /bestellungen/B-2001                 komplett ersetzen
PATCH  /bestellungen/B-2001                 teilweise ändern
DELETE /bestellungen/B-2001                 löschen → 204
POST   /bestellungen/B-2001/stornierung     fachliche Aktion als Unterressource
`)}
      <h3>Idempotenz</h3>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Methode</th><th>Ändert Daten</th><th>Idempotent</th></tr></thead>
        <tbody>
          <tr><td><code>GET</code></td><td>nein</td><td>ja</td></tr>
          <tr><td><code>PUT</code></td><td>ja</td><td>ja</td></tr>
          <tr><td><code>DELETE</code></td><td>ja</td><td>ja</td></tr>
          <tr><td><code>POST</code></td><td>ja</td><td>nein</td></tr>
          <tr><td><code>PATCH</code></td><td>ja</td><td>nicht garantiert</td></tr>
        </tbody>
      </table></div>
      <p><strong>Idempotent</strong> heißt: Zweimal senden hat dieselbe Wirkung wie einmal. Das ist bei Retries entscheidend. Ein Worker, der nach einem Timeout einen <code>POST</code> wiederholt, legt sonst womöglich zwei Zahlungen an. Abhilfe schafft ein <code>Idempotency-Key</code>-Header, den der Server sich merkt.</p>
      <h3>Statuscodes und was dein Worker daraus macht</h3>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Code</th><th>Bedeutung</th><th>Typische Reaktion im Worker</th></tr></thead>
        <tbody>
          <tr><td>200 / 201 / 204</td><td>OK / angelegt / ohne Inhalt</td><td><code>complete</code></td></tr>
          <tr><td>400 / 422</td><td>Anfrage ungültig / fachlich nicht verarbeitbar</td><td>meist <code>error</code> oder <code>fail</code> ohne Retries</td></tr>
          <tr><td>401 / 403</td><td>nicht angemeldet / keine Berechtigung</td><td><code>fail</code>, Konfiguration prüfen</td></tr>
          <tr><td>404</td><td>gibt es nicht</td><td>oft fachlich: <code>error</code></td></tr>
          <tr><td>409</td><td>Konflikt mit dem aktuellen Zustand</td><td>fachlich: <code>error</code></td></tr>
          <tr><td>500 / 503</td><td>Serverfehler / vorübergehend nicht verfügbar</td><td><code>fail</code> mit Retries</td></tr>
        </tbody>
      </table></div>
      <p>Beschreibe APIs mit <strong>OpenAPI</strong>. Bei „Contract First“ einigen sich Teams zuerst auf die Spezifikation und bauen dann parallel. Bei inkompatiblen Änderungen versionierst du, zum Beispiel mit <code>/v2/bestellungen</code>.</p>`,
    questions: [
      { q: `Welcher Endpunkt folgt den REST-Konventionen?`, options: ["<code>POST /erstelleBestellung</code>", "<code>POST /bestellungen</code>", "<code>GET /bestellungen/anlegen</code>"], correct: 1,
        explain: `Die Ressource ist das Substantiv, die HTTP-Methode ist das Verb.` },
      { q: `Ein Worker bekommt bei <code>POST /zahlungen</code> einen Timeout und versucht es erneut. Was ist das Risiko?`, options: ["Keins, POST ist idempotent", "Eine doppelte Zahlung. Abhilfe: ein Idempotency-Key, den der Server prüft", "Der zweite Aufruf liefert immer 404"], correct: 1,
        explain: `Der erste Aufruf kann angekommen sein, nur die Antwort ging verloren. Mit demselben Idempotency-Key erkennt der Server die Wiederholung.` },
      { q: `Jemand ist angemeldet, darf die Ressource aber nicht sehen. Welcher Status passt?`, options: ["401", "403", "404"], correct: 1,
        explain: `401 heißt „nicht angemeldet“, 403 heißt „angemeldet, aber nicht berechtigt“.` },
      { q: `Eine Bestellung soll storniert werden, ist aber schon versendet. Welcher Status passt am besten?`, options: ["409 Conflict", "500 Internal Server Error", "200 mit Fehlertext im Body"], correct: 0,
        explain: `Die Anfrage ist korrekt, passt aber nicht zum aktuellen Zustand der Ressource. 500 würde einen Serverfehler vortäuschen.` },
      { q: `Ihr fügt der Antwort ein neues, optionales Feld hinzu. Braucht ihr eine neue API-Version?`, options: ["Ja, immer", "Nein, das ist abwärtskompatibel, solange Clients unbekannte Felder ignorieren", "Nur bei GET-Endpunkten"], correct: 1,
        explain: `Neue Versionen brauchst du bei Änderungen, die bestehende Clients brechen: Felder entfernen, umbenennen, Typen ändern.` },
    ],
  },
  {
    id: "http-quiz", type: "quiz", title: "Kurz-Check: HTTP & JSON",
    theory: `<p>HTTP-Statuscodes entscheiden später, wie dein Worker reagiert. Deshalb lohnt es sich, die wichtigsten zu kennen: <code>2xx</code> Erfolg, <code>4xx</code> Fehler der Anfrage, <code>5xx</code> Fehler des Servers.</p>`,
    questions: [
      { q: `Du willst im CRM einen neuen Kunden anlegen. Welche HTTP-Methode nimmst du?`, options: ["<code>GET</code>", "<code>POST</code>", "<code>DELETE</code>"], correct: 1,
        explain: `<code>POST</code> legt neue Ressourcen an. <code>GET</code> liest nur, <code>PUT</code>/<code>PATCH</code> ändern, <code>DELETE</code> löscht.` },
      { q: `Die API antwortet mit Status <code>404</code>. Was bedeutet das?`, options: ["Der Server ist überlastet", "Die angefragte Ressource gibt es nicht", "Alles in Ordnung"], correct: 1,
        explain: `404 Not Found. Nochmal fragen hilft hier nicht, der Kunde existiert einfach nicht.` },
      { q: `Der Zahlungsdienst antwortet mit <code>503 Service Unavailable</code>. Wie sollte dein Worker reagieren?`, options: ["<code>job.fail(…)</code>, damit die Engine es später erneut versucht", "<code>job.error(…)</code>, weil die Zahlung fachlich abgelehnt wurde", "<code>job.complete(…)</code> und einfach weitermachen"], correct: 0,
        explain: `503 ist ein vorübergehendes technisches Problem. Ein späterer Versuch kann klappen, also <code>fail</code> mit Retries. Mehr dazu in Modul 4.` },
      { q: `Welches davon ist gültiges JSON?`, options: [`<code>{name: "Erika"}</code>`, `<code>{"name": "Erika", "vip": true}</code>`, `<code>{'name': 'Erika',}</code>`], correct: 1,
        explain: `JSON verlangt doppelte Anführungszeichen um Schlüssel und Texte und erlaubt kein Komma am Ende.` },
    ],
  },
  ],
},
{
  id: "m3", title: "Prozesse modellieren", sub: "BPMN, FEEL und DMN",
  lessons: [
  {
    id: "bpmn", type: "quiz", title: "BPMN-Grundelemente", widget: "legend",
    theory: `
      <p class="story"><b>NordPaket GmbH —</b> Zeit, den Bestellprozess erstmals als Diagramm zu zeichnen, statt nur in Code zu denken.</p>
      <p><strong>BPMN</strong> (Business Process Model and Notation) ist die grafische Sprache, in der du Prozesse für Camunda modellierst. Das Diagramm ist gleichzeitig Dokumentation und ausführbares Programm: Die Engine liest die BPMN-Datei (XML) und führt sie aus.</p>
      <p>Durch den Prozess wandert ein <strong>Token</strong>. Er markiert, wo eine Prozessinstanz gerade steht. Kommt er an einem Service Task an, legt die Engine einen <strong>Job</strong> an, den dein Code abarbeitet. Genau so wandert der gelbe Token durch deinen Lernpfad.</p>`,
    questions: [
      { q: `Welches Element wird von deinem Code, also einem Job Worker, abgearbeitet?`, options: ["User Task", "Service Task", "Exklusives Gateway"], correct: 1,
        explain: `Für Service Tasks legt die Engine Jobs an. Ein Worker, der sich für den passenden Task-Typ registriert hat, holt sie ab.` },
      { q: `Eine Rechnung über 5.000 € braucht die Freigabe eines Menschen. Welches Element modellierst du?`, options: ["Service Task", "User Task", "Timer-Ereignis"], correct: 1,
        explain: `User Tasks erscheinen in der Tasklist. Dort erledigt ein Mensch die Aufgabe, danach läuft der Prozess weiter.` },
      { q: `Was ist ein Token?`, options: ["Ein Zugangsschlüssel für die API", "Eine Markierung, wo eine Prozessinstanz gerade steht", "Ein anderer Name für ein Prozessmodell"], correct: 1,
        explain: `Richtig. Verwechslungsgefahr: Bei der Anmeldung an Camunda gibt es auch OAuth-Tokens. Im Modell ist aber immer die Ausführungsmarke gemeint.` },
      { q: `Wie oft kann ein Prozessmodell gleichzeitig laufen?`, options: ["Nur einmal", "Beliebig oft, jede Ausführung ist eine eigene Prozessinstanz", "Einmal pro Benutzer"], correct: 1,
        explain: `Das Modell ist die Vorlage. Jede Bestellung, jeder Antrag startet eine eigene Instanz mit eigenen Variablen.` },
    ],
  },
  {
    id: "gateways", type: "quiz", title: "Gateways simulieren", widget: "gateway",
    theory: `
      <p>An den ausgehenden Pfeilen (Sequenzflüssen) eines exklusiven Gateways stehen <strong>Bedingungen</strong> als FEEL-Ausdruck, zum Beispiel <code>= betrag &gt; 1000</code>. Die Engine prüft sie und nimmt den ersten Pfad, dessen Bedingung wahr ist. Ein <strong>Default-Flow</strong> (mit Querstrich markiert) greift, wenn keine Bedingung passt.</p>
      <p>Ein <strong>paralleles Gateway</strong> hat keine Bedingungen. Es schickt einen Token auf jeden ausgehenden Pfad. Das zusammenführende parallele Gateway wartet, bis alle angekommen sind.</p>
      <p>Probier es aus: Schiebe den Betrag und wechsle den Gateway-Typ.</p>`,
    questions: [
      { q: `Oben steht <code>betrag &gt; 1000</code>, unten der Default-Flow. Welchen Weg nimmt ein Auftrag mit <code>betrag = 1000</code>?`, options: ["Oben (Manager-Freigabe)", "Unten (Automatisch freigeben)", "Beide Wege"], correct: 1,
        explain: `<code>1000 &gt; 1000</code> ist falsch, also greift der Default-Flow. Grenzfälle wie diesen solltest du beim Modellieren immer bewusst entscheiden.` },
      { q: `Keine Bedingung trifft zu und es gibt keinen Default-Flow. Was passiert in Camunda 8?`, options: ["Der Token nimmt zufällig einen Pfad", "Die Engine erzeugt einen Incident und die Instanz bleibt stehen", "Der Prozess endet erfolgreich"], correct: 1,
        explain: `Die Instanz hängt mit einem Incident, den du in Operate siehst und nach der Korrektur auflösen kannst.` },
      { q: `Was macht ein zusammenführendes paralleles Gateway?`, options: ["Es lässt den ersten Token durch und verwirft den Rest", "Es wartet, bis auf allen eingehenden Pfaden ein Token angekommen ist", "Es prüft eine Bedingung"], correct: 1,
        explain: `Erst wenn alle parallelen Zweige fertig sind, geht es mit einem einzigen Token weiter.` },
    ],
  },
  {
    id: "ereignisse", type: "quiz", title: "Ereignisse & Nachrichten", widget: "legend-events",
    theory: `
      <p>Ereignisse beschreiben, dass etwas <em>passiert</em>: Eine Nachricht kommt an, eine Frist läuft ab, ein Fehler tritt auf. Die Form verrät die Rolle: dünner Kreis heißt Start, doppelter Kreis Zwischenereignis, dicker Kreis Ende. Das Symbol innen verrät den Typ.</p>`,
    after: `
      <div class="theory">
      <h3>Wartepunkte: Nachrichten</h3>
      <p>Ein Nachrichten-Zwischenereignis lässt den Token warten, bis eine passende Nachricht kommt. Camunda ordnet sie über den <strong>Correlation Key</strong> zu, zum Beispiel <code>= bestellId</code>. So findet „Zahlung zu B-2001 eingegangen“ genau die richtige Instanz. Wie du Nachrichten aus Code sendest, lernst du in Modul 6.</p>
      <h3>Boundary Events: unterbrechend oder nicht</h3>
      <p>Ein Ereignis am Rand eines Tasks reagiert, während der Task läuft. <strong>Unterbrechend</strong> (durchgezogener Rand) bricht den Task ab und nimmt den Ausnahmepfad. <strong>Nicht unterbrechend</strong> (gestrichelter Rand) startet zusätzlich einen Pfad, der Task läuft weiter. Typisch: nach 2 Tagen erinnern (nicht unterbrechend), nach 5 Tagen eskalieren (unterbrechend).</p>
      <h3>Ereignisbasiertes Gateway</h3>
      <p>Es wartet auf mehrere mögliche Ereignisse, das erste gewinnt. Beispiel: Entweder die Zahlung kommt an, oder nach 14 Tagen läuft der Timer ab und die Bestellung wird storniert.</p>
      <h3>Timer-Ausdrücke (ISO 8601)</h3>
      ${pre(`
PT48H                        Dauer: 48 Stunden
P14D                         Dauer: 14 Tage
R3/PT10M                     Zyklus: 3-mal alle 10 Minuten
2026-12-24T09:00:00+01:00    fester Zeitpunkt
`)}
      </div>`,
    questions: [
      { q: `Der Lieferant soll nach 2 Tagen ohne Antwort erinnert werden, die Aufgabe bleibt aber offen. Welches Element?`, options: ["Unterbrechendes Timer-Boundary-Event", "Nicht unterbrechendes Timer-Boundary-Event", "Timer-Startereignis"], correct: 1,
        explain: `Nicht unterbrechend: Die Erinnerung läuft auf einem zusätzlichen Pfad, der Task bleibt aktiv.` },
      { q: `Wie findet eine eingehende Nachricht die richtige Prozessinstanz?`, options: ["Über Nachrichtenname und Correlation Key", "Über die Reihenfolge des Eingangs", "Die Engine stellt sie allen wartenden Instanzen zu"], correct: 0,
        explain: `Der Name bestimmt, welches Ereignis gemeint ist. Der Correlation Key, etwa die Bestellnummer, bestimmt die Instanz.` },
      { q: `Entweder kommt die Zahlung, oder nach 14 Tagen wird storniert. Was modellierst du?`, options: ["Exklusives Gateway mit Bedingung", "Ereignisbasiertes Gateway mit Nachrichten- und Timer-Ereignis", "Paralleles Gateway"], correct: 1,
        explain: `Ein exklusives Gateway entscheidet anhand von Daten, die jetzt schon da sind. Hier muss der Prozess warten, welches Ereignis zuerst eintritt.` },
      { q: `Was bedeutet der Ausdruck <code>PT48H</code>?`, options: ["48 Tage", "48 Stunden", "Täglich um 0:48 Uhr"], correct: 1,
        explain: `P leitet eine Dauer ein, T trennt den Zeitanteil ab. <code>P2D</code> wäre dasselbe als 2 Tage.` },
    ],
  },
  {
    id: "subprozesse", type: "quiz", title: "Subprozesse & Multi-Instance",
    theory: `
      <p>Komplexe Prozesse werden schnell unübersichtlich. BPMN bietet drei Werkzeuge, um sie zu strukturieren:</p>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Element</th><th>Wofür</th><th>Beispiel</th></tr></thead>
        <tbody>
          <tr><td>Eingebetteter Subprozess</td><td>Schritte gruppieren. Gemeinsamer Rahmen für Boundary Events und Variablen.</td><td>„Lieferung abwickeln“ mit einem Timer am Rand, der für alle inneren Schritte gilt</td></tr>
          <tr><td>Call Activity</td><td>Einen eigenständig deployten Prozess aufrufen. Wiederverwendbar, separat versioniert.</td><td>„Bonitätsprüfung“ wird von Bestell- und Leasingprozess genutzt</td></tr>
          <tr><td>Event-Subprozess</td><td>Reagiert jederzeit, solange der umgebende Prozess läuft.</td><td>Eine Stornierung kann zu jedem Zeitpunkt eintreffen</td></tr>
        </tbody>
      </table></div>
      <h3>Multi-Instance</h3>
      <p>Eine Aktivität wird für jedes Element einer Liste ausgeführt. Drei senkrechte Striche bedeuten parallel, drei waagerechte sequenziell. In Camunda 8 konfigurierst du:</p>
      ${pre(`
inputCollection:   = positionen       die Liste
inputElement:      position           Variable für das aktuelle Element
outputCollection:  ergebnisse         gesammelte Ergebnisse
outputElement:     = pruefErgebnis    was jede Instanz beisteuert
`)}
      <p>Faustregel für komplexe Modelle: Ein Diagramm sollte auf einen Bildschirm passen. Wird es größer, lagere zusammenhängende Teile in Subprozesse oder Call Activities aus. Das ist auch eine Architekturentscheidung, denn eine Call Activity kann einem anderen Team gehören.</p>`,
    questions: [
      { q: `Die Bonitätsprüfung wird in drei Prozessen gebraucht und von einem eigenen Team gepflegt. Was modellierst du?`, options: ["Einen eingebetteten Subprozess, in jeden Prozess kopiert", "Eine Call Activity auf einen eigenen Prozess", "Einen einzelnen Service Task"], correct: 1,
        explain: `Eine Call Activity trennt Verantwortung und Versionierung. Das Team kann die Prüfung ändern, ohne die aufrufenden Prozesse anzufassen.` },
      { q: `Ein Kunde kann jederzeit stornieren, egal wo der Prozess gerade steht. Was eignet sich?`, options: ["Ein Event-Subprozess mit Nachrichten-Startereignis", "Ein exklusives Gateway nach jedem Schritt", "Ein Timer-Startereignis"], correct: 0,
        explain: `Der Event-Subprozess lauscht während der gesamten Laufzeit. Als unterbrechende Variante beendet er den Hauptablauf.` },
      { q: `Für jede von 12 Positionen soll gleichzeitig die Verfügbarkeit geprüft werden. Was nutzt du?`, options: ["Eine parallele Multi-Instance-Aktivität über positionen", "12 Service Tasks nebeneinander", "Eine Schleife mit Gateway zurück"], correct: 0,
        explain: `Multi-Instance passt sich der Listenlänge an. 12 feste Tasks würden bei 13 Positionen brechen.` },
      { q: `Ein unterbrechender Timer am Rand eines eingebetteten Subprozesses feuert. Was passiert?`, options: ["Nur der gerade laufende Task wird abgebrochen", "Der gesamte Subprozess wird abgebrochen und der Ausnahmepfad genommen", "Nichts, Timer wirken nur an Tasks"], correct: 1,
        explain: `Genau das macht Subprozesse nützlich: eine Frist für eine ganze Gruppe von Schritten.` },
    ],
  },
  {
    id: "prozessanalyse", type: "sort", title: "Prozessanalyse: vom Gespräch zum Modell",
    theory: `
      <p>Bevor du modellierst, verstehst du den Prozess. Im Gespräch mit dem Fachbereich hörst du auf bestimmte Signale:</p>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Du hörst …</th><th>Das deutet auf …</th></tr></thead>
        <tbody>
          <tr><td>„Frau X prüft / gibt frei / entscheidet“</td><td>User Task, die Rolle wird zur Lane</td></tr>
          <tr><td>„Das System bucht / schickt / berechnet“</td><td>Service Task</td></tr>
          <tr><td>„Wenn …, sonst …“, „je nachdem …“</td><td>Exklusives Gateway</td></tr>
          <tr><td>„gleichzeitig“, „unabhängig voneinander“</td><td>Paralleles Gateway</td></tr>
          <tr><td>„Wir warten auf …“, „kommt per Mail/EDI“</td><td>Nachrichten-Ereignis</td></tr>
          <tr><td>„nach 3 Tagen“, „jeden Montag“</td><td>Timer-Ereignis</td></tr>
          <tr><td>„Falls das System meldet, dass …“</td><td>Error Boundary Event</td></tr>
        </tbody>
      </table></div>
      <h3>Fragen, die komplexe Prozesse aufdecken</h3>
      <ul>
        <li>Was löst den Prozess aus, und woran erkennt ihr, dass er fertig ist?</li>
        <li>Wer ist beteiligt, und wer entscheidet?</li>
        <li>Was passiert, wenn etwas nicht kommt, abgelehnt wird oder zu spät ist?</li>
        <li>Wie oft tritt dieser Sonderfall auf? Nicht jede Ausnahme gehört ins Modell.</li>
        <li>Welche Systeme sind beteiligt, und wo werden Daten doppelt gepflegt?</li>
      </ul>
      <h3>Modellierungskonventionen</h3>
      <ul>
        <li>Tasks: Objekt und Verb, z. B. „Rechnung prüfen“</li>
        <li>Ereignisse: Objekt und Zustand, z. B. „Rechnung eingegangen“</li>
        <li>Gateways als Frage, z. B. „Betrag über 5.000 €?“, die Pfade mit den Antworten beschriften</li>
        <li>Happy Path in einer Linie von links nach rechts, Ausnahmen darunter</li>
      </ul>`,
    task: `<p>Diese Aussagen stammen aus einem Workshop mit dem Einkauf. Ordne jeder das BPMN-Element zu, das du dafür modellieren würdest.</p>`,
    categories: [
      { id: "user", label: "User Task" },
      { id: "service", label: "Service Task" },
      { id: "xor", label: "Exklusives Gateway" },
      { id: "and", label: "Paralleles Gateway" },
      { id: "timer", label: "Timer-Ereignis" },
      { id: "msg", label: "Nachrichten-Ereignis" },
      { id: "err", label: "Error Boundary Event" },
    ],
    items: [
      { text: "„Frau Weber aus dem Einkauf prüft jede Bestellung über 5.000 € persönlich.“", cat: "user", why: "Ein Mensch prüft und entscheidet: User Task in der Lane „Einkauf“." },
      { text: "„Danach wird die Bestellung automatisch im ERP angelegt.“", cat: "service", why: "Automatischer Systemschritt, den ein Worker oder Connector ausführt." },
      { text: "„Standardartikel gehen direkt raus, Sonderanfertigungen brauchen erst eine technische Klärung.“", cat: "xor", why: "Eine Entscheidung mit genau einem Weg: Gateway „Sonderanfertigung?“." },
      { text: "„Rechnungsprüfung und Wareneingangsbuchung laufen unabhängig voneinander, bezahlt wird erst, wenn beides fertig ist.“", cat: "and", why: "Parallel aufteilen und am Ende mit einem parallelen Gateway zusammenführen." },
      { text: "„Die Auftragsbestätigung des Lieferanten kommt per EDI rein.“", cat: "msg", why: "Der Prozess wartet auf eine Nachricht von außen, korreliert über die Bestellnummer." },
      { text: "„Wenn der Lieferant nicht innerhalb von 3 Tagen bestätigt, haken wir nach.“", cat: "timer", why: "Eine Frist: Timer-Boundary-Event am Warteschritt, hier nicht unterbrechend." },
      { text: "„Meldet das ERP beim Anlegen ‚Artikel gesperrt‘, brechen wir ab und informieren den Anforderer.“", cat: "err", why: "Ein fachlicher Fehler aus dem Service Task, abgefangen per Error Boundary Event mit eigenem Pfad." },
    ],
  },
  {
    id: "feel", type: "quiz", title: "FEEL-Ausdrücke",
    theory: `
      <p><strong>FEEL</strong> (Friendly Enough Expression Language) ist die Ausdruckssprache in Camunda 8. Du nutzt sie für Bedingungen an Gateways, für Input-/Output-Mappings und in DMN-Tabellen. In Modeler-Feldern beginnt ein FEEL-Ausdruck mit <code>=</code>. Ohne Gleichheitszeichen wird der Inhalt als fester Text behandelt.</p>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Zweck</th><th>JavaScript</th><th>FEEL</th></tr></thead>
        <tbody>
          <tr><td>Gleich / ungleich</td><td><code>a === b</code> / <code>a !== b</code></td><td><code>a = b</code> / <code>a != b</code></td></tr>
          <tr><td>Und / oder</td><td><code>&amp;&amp;</code> / <code>||</code></td><td><code>and</code> / <code>or</code></td></tr>
          <tr><td>Nicht</td><td><code>!x</code></td><td><code>not(x)</code></td></tr>
          <tr><td>Bedingung</td><td><code>x ? a : b</code></td><td><code>if x then a else b</code></td></tr>
          <tr><td>Text verbinden</td><td><code>"Hallo " + name</code></td><td><code>"Hallo " + name</code></td></tr>
          <tr><td>Liste filtern</td><td><code>liste.filter(p =&gt; p.preis &gt; 10)</code></td><td><code>liste[preis &gt; 10]</code></td></tr>
          <tr><td>Anzahl</td><td><code>liste.length</code></td><td><code>count(liste)</code></td></tr>
          <tr><td>Fehlender Wert</td><td>TypeError oder <code>undefined</code></td><td><code>null</code></td></tr>
        </tbody>
      </table></div>
      ${pre(`
= betrag > 1000 and kunde.vip = false                    // und-Verknüpfung zweier Vergleiche
= if score >= 600 then "genehmigt" else "abgelehnt"       // ersetzt den Ternary-Operator ?: aus JS
= sum(positionen.preis)                                    // summiert eine Liste, wie reduce() in JS
= count(positionen[menge > 5])                              // [...] filtert, count() zählt die Treffer
= { name: kunde.vorname + " " + kunde.nachname, stadt: kunde.adresse.stadt }  // baut ein neues Objekt
`)}`,
    questions: [
      { q: `Wie schreibst du <code>betrag &gt;= 1000 &amp;&amp; !kunde.vip</code> in FEEL?`, options: ["<code>betrag &gt;= 1000 &amp;&amp; !kunde.vip</code>", "<code>betrag &gt;= 1000 and not(kunde.vip)</code>", "<code>betrag =&gt; 1000 und nicht kunde.vip</code>"], correct: 1,
        explain: `FEEL nutzt ausgeschriebene Wörter: <code>and</code>, <code>or</code> und die Funktion <code>not()</code>.` },
      { q: `Was ergibt <code>if score &gt;= 600 then "genehmigt" else "abgelehnt"</code> bei <code>score = 580</code>?`, options: [`<code>"genehmigt"</code>`, `<code>"abgelehnt"</code>`, "<code>null</code>"], correct: 1,
        explain: `580 ist kleiner als 600, also der <code>else</code>-Zweig.` },
      { q: `<code>positionen = [{preis: 5}, {preis: 20}, {preis: 15}]</code>. Was liefert <code>positionen[preis &gt; 10]</code>?`, options: ["<code>[{preis: 20}, {preis: 15}]</code>", "<code>[false, true, true]</code>", "<code>2</code>"], correct: 0,
        explain: `Eckige Klammern mit einer Bedingung filtern die Liste. Die Anzahl <code>2</code> bekämst du mit <code>count(positionen[preis &gt; 10])</code>.` },
      { q: `<code>kunde = {name: "Max"}</code>. Was ergibt <code>kunde.adresse.stadt</code> in FEEL?`, options: ["Einen Fehler, der die Instanz stoppt", "<code>null</code>", `<code>""</code> (leerer Text)`], correct: 1,
        explain: `FEEL ist nachsichtig und liefert <code>null</code>. In JavaScript brauchst du dafür <code>?.</code>.` },
      { q: `Mit welchem Ausdruck prüfst du in FEEL, ob der Status „offen“ ist?`, options: [`<code>status = "offen"</code>`, `<code>status === "offen"</code>`, `<code>status == "offen"</code>`], correct: 0,
        explain: `In FEEL vergleicht ein einfaches <code>=</code>. Zuweisungen gibt es in FEEL nicht.` },
    ],
  },
  {
    id: "dmn", type: "code", title: "DMN-Tabelle in Code", file: "rabatt.js",
    theory: `
      <p>Geschäftsregeln wie Rabatte oder Freigabegrenzen gehören oft nicht in den Code, sondern in eine <strong>DMN-Entscheidungstabelle</strong>. Die Fachabteilung kann sie selbst pflegen, ein <strong>Business Rule Task</strong> im Prozess wertet sie aus.</p>
      <p>Die Hit Policy <strong>F (First)</strong> heißt: Die Zeilen werden von oben nach unten geprüft, die erste passende gewinnt. <code>-</code> bedeutet „egal“. Die Eingabezellen sind FEEL-Tests wie <code>&gt;= 500</code>.</p>
      <div class="table-wrap"><table class="dmn">
        <thead>
          <tr><th class="hp">F</th><th><span class="io">Input</span>kundentyp</th><th><span class="io">Input</span>bestellwert</th><th><span class="io">Output</span>rabatt (%)</th></tr>
        </thead>
        <tbody>
          <tr><td class="rn">1</td><td>"gold"</td><td>&gt;= 500</td><td class="out">15</td></tr>
          <tr><td class="rn">2</td><td>"gold"</td><td>-</td><td class="out">10</td></tr>
          <tr><td class="rn">3</td><td>"silber"</td><td>&gt;= 500</td><td class="out">8</td></tr>
          <tr><td class="rn">4</td><td>"silber"</td><td>-</td><td class="out">5</td></tr>
          <tr><td class="rn">5</td><td>-</td><td>&gt;= 1000</td><td class="out">3</td></tr>
          <tr><td class="rn">6</td><td>-</td><td>-</td><td class="out">0</td></tr>
        </tbody>
      </table></div>
      <p>Im echten Projekt wertet die Engine diese Tabelle aus. Sie selbst in Code zu übersetzen, zeigt dir aber genau, wie sie denkt.</p>`,
    task: `<p>Schreibe <code>rabatt(kundentyp, bestellwert)</code>, die sich exakt wie die Tabelle verhält und den Rabatt als Zahl zurückgibt.</p>`,
    starter: `function rabatt(kundentyp, bestellwert) {
  // Zeile für Zeile von oben nach unten, die erste passende gewinnt
  return 0;
}

console.log(rabatt("gold", 600));   // 15
console.log(rabatt("neu", 1200));   // 3
`,
    hint: `Eine <code>if</code>-Abfrage pro Zeile, in der Reihenfolge der Tabelle. Zeile 1: <code>if (kundentyp === "gold" &amp;&amp; bestellwert &gt;= 500) return 15;</code>`,
    solution: `function rabatt(kundentyp, bestellwert) {
  if (kundentyp === "gold" && bestellwert >= 500) return 15;
  if (kundentyp === "gold") return 10;
  if (kundentyp === "silber" && bestellwert >= 500) return 8;
  if (kundentyp === "silber") return 5;
  if (bestellwert >= 1000) return 3;
  return 0;
}

console.log(rabatt("gold", 600));   // 15
console.log(rabatt("neu", 1200));   // 3
`,
    tests: [
      ['rabatt("gold", 600) → 15', ({ eq }) => eq(rabatt("gold", 600), 15)],
      ['rabatt("gold", 100) → 10', ({ eq }) => eq(rabatt("gold", 100), 10)],
      ['rabatt("silber", 500) → 8', ({ eq }) => eq(rabatt("silber", 500), 8)],
      ['rabatt("silber", 499) → 5', ({ eq }) => eq(rabatt("silber", 499), 5)],
      ['rabatt("gold", 1500) → 15 (Zeile 1 gewinnt vor Zeile 5)', ({ eq }) => eq(rabatt("gold", 1500), 15)],
      ['rabatt("neu", 1200) → 3', ({ eq }) => eq(rabatt("neu", 1200), 3)],
      ['rabatt("neu", 50) → 0', ({ eq }) => eq(rabatt("neu", 50), 0)],
    ],
  },
  {
    id: "dmn-vertieft", type: "quiz", title: "DMN vertieft: Hit Policies & DRD",
    theory: `
      <p>Die <strong>Hit Policy</strong> legt fest, was passiert, wenn mehrere Regeln zutreffen. Camunda 8 unterstützt diese:</p>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Kürzel</th><th>Name</th><th>Verhalten</th></tr></thead>
        <tbody>
          <tr><td><code>U</code></td><td>Unique</td><td>Höchstens eine Regel darf passen. Passen mehrere, ist das ein Fehler. Das ist der Standard.</td></tr>
          <tr><td><code>F</code></td><td>First</td><td>Die erste passende Regel in Tabellenreihenfolge gewinnt.</td></tr>
          <tr><td><code>A</code></td><td>Any</td><td>Mehrere dürfen passen, müssen aber dasselbe Ergebnis liefern.</td></tr>
          <tr><td><code>R</code></td><td>Rule order</td><td>Alle passenden Ergebnisse als Liste, in Tabellenreihenfolge.</td></tr>
          <tr><td><code>C</code></td><td>Collect</td><td>Alle passenden Ergebnisse, optional zusammengefasst: <code>C+</code> Summe, <code>C&lt;</code> Minimum, <code>C&gt;</code> Maximum, <code>C#</code> Anzahl.</td></tr>
        </tbody>
      </table></div>
      <h3>Eingabeeinträge</h3>
      ${pre(`
"gold"                  genau dieser Wert
"gold","silber"         einer von beiden
not("gesperrt")         alles außer
[100..500]              100 bis 500, beide Grenzen inklusive
]100..500]              über 100 bis einschließlich 500
< date("2026-01-01")    vor einem Datum
-                       beliebig
`)}
      <h3>Entscheidungen verketten</h3>
      <p>Ein <strong>DRD</strong> (Decision Requirements Diagram) verbindet Entscheidungen: „Risikoklasse“ nutzt die Ergebnisse von „Bonität“ und „Betragskategorie“. Der Business Rule Task ruft die oberste Entscheidung auf, die abhängigen wertet die Engine automatisch aus.</p>
      <p>Im Business Rule Task gibst du die <strong>Decision ID</strong> und eine <strong>Result Variable</strong> an, z. B. <code>rabatt</code>. Das Ergebnis steht danach als Prozessvariable bereit.</p>`,
    questions: [
      { q: `Hit Policy UNIQUE, und für eine Eingabe passen zwei Regeln. Was passiert?`, options: ["Die erste gewinnt", "Die Auswertung schlägt fehl, in Camunda entsteht ein Incident", "Beide Ergebnisse werden addiert"], correct: 1,
        explain: `UNIQUE ist eine Zusicherung: Die Regeln dürfen sich nicht überlappen. Eine Überlappung ist ein Fehler in der Tabelle.` },
      { q: `Risikopunkte aus mehreren Regeln sollen addiert werden (Neukunde +20, Auslandslieferung +15 …). Welche Hit Policy?`, options: ["FIRST", "COLLECT mit Summe (C+)", "UNIQUE"], correct: 1,
        explain: `COLLECT sammelt alle Treffer, das Aggregat SUM addiert sie zu einem Scoring.` },
      { q: `Was bedeutet der Eingabeeintrag <code>[100..500]</code>?`, options: ["100 bis 500, beide Grenzen eingeschlossen", "Nur 100 oder 500", "Eine Liste mit zwei Werten"], correct: 0,
        explain: `Eckige Klammern nach außen bedeuten inklusive. <code>]100..500]</code> schließt die 100 aus.` },
      { q: `Wo landet das Ergebnis eines Business Rule Tasks?`, options: ["In der angegebenen Result Variable der Prozessinstanz", "Nur in den Logs", "In einer Datei neben der DMN"], correct: 0,
        explain: `Danach kann z. B. ein Gateway mit <code>= rabatt &gt; 10</code> darauf zugreifen.` },
      { q: `Wann gehört eine Regel eher in eine DMN-Tabelle als in Java-Code?`, options: ["Wenn der Fachbereich sie verstehen und häufig anpassen soll", "Wenn sie Schleifen und komplexe Berechnungen braucht", "Nie"], correct: 0,
        explain: `DMN macht Geschäftsregeln sichtbar und änderbar, ohne neues Deployment des Codes. Komplexe Algorithmen bleiben im Code.` },
    ],
  },
  ],
},
{
  id: "m4", title: "Job Worker", sub: "Code, der Prozesse antreibt",
  lessons: [
  {
    id: "worker-konzept", type: "quiz", title: "So arbeitet ein Job Worker",
    theory: `
      <p class="story"><b>NordPaket GmbH —</b> Das Diagramm steht, aber noch bewegt sich nichts. Jetzt schreibst du den Code, der NordPakets Prozess wirklich antreibt.</p>
      <p>Ein <strong>Job Worker</strong> ist ein kleines Programm, das die Arbeit hinter den Service Tasks erledigt. Die Engine selbst führt keinen Code aus. Sie verteilt Jobs, und dein Worker holt sie ab.</p>
      <ol class="seq">
        <li>Der Token erreicht einen Service Task mit dem Task-Typ <code>rechnung-berechnen</code>. Die Engine legt einen Job an.</li>
        <li>Dein Worker hat sich für genau diesen Typ registriert und aktiviert den Job.</li>
        <li>Dein Handler bekommt <code>job.variables</code>, rechnet, ruft APIs auf.</li>
        <li>Er meldet das Ergebnis mit <code>complete</code>, <code>fail</code> oder <code>error</code> zurück.</li>
        <li>Die Engine schiebt den Token weiter oder behandelt den Fehler.</li>
      </ol>
      <h3>Echter Code mit dem Camunda 8 SDK für Node.js</h3>
      ${pre(`
import { Camunda8 } from "@camunda8/sdk";

const c8 = new Camunda8();
const zeebe = c8.getZeebeGrpcApiClient();

zeebe.createWorker({
  taskType: "rechnung-berechnen",
  taskHandler: async (job) => {
    const { positionen } = job.variables;
    const gesamt = positionen.reduce((s, p) => s + p.preis * p.menge, 0);
    return job.complete({ gesamt });
  },
});
`)}
      <h3>Drei mögliche Ausgänge</h3>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Aufruf</th><th>Wann</th><th>Was passiert</th></tr></thead>
        <tbody>
          <tr><td><code>job.complete(vars)</code></td><td>Alles hat geklappt</td><td>Die Variablen werden in die Prozessinstanz übernommen, der Token läuft weiter.</td></tr>
          <tr><td><code>job.fail(msg)</code></td><td>Technisches Problem: Timeout, 503, Netzwerk</td><td>Die Engine versucht es erneut. Sind die Retries aufgebraucht, entsteht ein Incident in Operate.</td></tr>
          <tr><td><code>job.error(code, msg)</code></td><td>Fachlicher Fehler: Bonität abgelehnt, Artikel nicht lieferbar</td><td>Ein BPMN-Fehler. Ein Error Boundary Event mit passendem Code im Modell fängt ihn ab und leitet auf einen anderen Pfad.</td></tr>
        </tbody>
      </table></div>
      <p class="note">In den nächsten Übungen ist <code>zeebe</code> schon vorhanden und simuliert die Engine. Im echten Projekt erzeugst du es wie oben gezeigt.</p>`,
    questions: [
      { q: `Die Kunden-API antwortet nicht (Timeout). Welche Job-Aktion passt?`, options: ["<code>job.complete()</code>", "<code>job.fail()</code> mit Retries", `<code>job.error("KUNDE_ABGELEHNT")</code>`], correct: 1,
        explain: `Ein Timeout ist ein technisches, meist vorübergehendes Problem. <code>fail</code> lässt die Engine es erneut versuchen.` },
      { q: `Die Bonitätsprüfung ergibt: nicht kreditwürdig. Das Modell soll dann einen anderen Pfad nehmen. Welche Aktion?`, options: ["<code>job.fail()</code>", "<code>job.error()</code> mit einem Fehlercode, den ein Error Boundary Event abfängt", "<code>console.log()</code> und sonst nichts"], correct: 1,
        explain: `Das ist ein erwartbares fachliches Ergebnis. Ein erneuter Versuch würde nichts ändern. Das Modell entscheidet, wie es weitergeht.` },
      { q: `Was passiert mit den Variablen in <code>job.complete({ gesamt: 42 })</code>?`, options: ["Sie werden verworfen", "Sie werden in die Prozessinstanz übernommen und stehen den folgenden Schritten zur Verfügung", "Sie werden nur in Operate angezeigt"], correct: 1,
        explain: `Danach kann z. B. ein Gateway mit <code>= gesamt &gt; 1000</code> darauf zugreifen.` },
      { q: `Woran erkennt ein Worker, welche Jobs für ihn bestimmt sind?`, options: ["Am Task-Typ, der im Modell am Service Task eingetragen ist", "Am angezeigten Namen des Service Tasks", "An der Reihenfolge, in der die Worker gestartet wurden"], correct: 0,
        explain: `Der Name ist nur Beschriftung. Entscheidend ist der Typ unter „Task definition“ im Modeler.` },
    ],
  },
  {
    id: "erster-worker", type: "code", title: "Dein erster Worker", file: "worker.js",
    theory: `
      <p>Jetzt schreibst du einen echten Handler. Die simulierte Engine startet beim Prüfen Jobs mit Testdaten und schaut, was dein Worker zurückmeldet. In der Konsole siehst du den Ablauf so, wie er auch in einem echten Log auftauchen würde.</p>
      <p>Der Job-Handler bekommt ein <code>job</code>-Objekt. Die wichtigsten Teile:</p>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Teil</th><th>Inhalt</th></tr></thead>
        <tbody>
          <tr><td><code>job.variables</code></td><td>Die Prozessvariablen, die der Task sieht</td></tr>
          <tr><td><code>job.key</code></td><td>Eindeutige Nummer des Jobs</td></tr>
          <tr><td><code>job.retries</code></td><td>Verbleibende Versuche</td></tr>
          <tr><td><code>job.complete(vars)</code></td><td>Job erfolgreich abschließen</td></tr>
        </tbody>
      </table></div>
      <p>Tipp: Die Logik aus „Arrays &amp; Schleifen“ kannst du hier wiederverwenden.</p>`,
    task: `
      <p>Registriere einen Worker für den Task-Typ <code>rechnung-berechnen</code>. Er bekommt die Variable <code>positionen</code> (wie in Modul 1) und schließt den Job ab mit:</p>
      ${pre(`{ gesamt: <Summe aus preis * menge>, anzahl: <Anzahl der Positionen> }`)}`,
    starter: `zeebe.createWorker({
  taskType: "rechnung-berechnen",
  taskHandler: async (job) => {
    const { positionen } = job.variables;

    // Berechne gesamt und anzahl

    return job.complete({});
  },
});
`,
    hint: `<code>const gesamt = positionen.reduce((s, p) =&gt; s + p.preis * p.menge, 0);</code> und <code>anzahl: positionen.length</code>`,
    solution: `zeebe.createWorker({
  taskType: "rechnung-berechnen",
  taskHandler: async (job) => {
    const { positionen } = job.variables;
    const gesamt = positionen.reduce((summe, p) => summe + p.preis * p.menge, 0);

    return job.complete({ gesamt, anzahl: positionen.length });
  },
});
`,
    tests: [
      ["Job mit zwei Positionen → { gesamt: 42, anzahl: 2 }", async ({ eq, runJob }) => {
        const r = await runJob("rechnung-berechnen", { bestellId: "B-2001", positionen: [{ preis: 10, menge: 2 }, { preis: 5.5, menge: 4 }] });
        eq(r.status, "complete", "Job-Ausgang");
        eq(r.variables, { gesamt: 42, anzahl: 2 }, "Variablen in complete()");
      }],
      ["Job ohne Positionen → { gesamt: 0, anzahl: 0 }", async ({ eq, runJob }) => {
        const r = await runJob("rechnung-berechnen", { bestellId: "B-2002", positionen: [] });
        eq(r.status, "complete", "Job-Ausgang");
        eq(r.variables, { gesamt: 0, anzahl: 0 }, "Variablen in complete()");
      }],
    ],
  },
  {
    id: "fehler", type: "code", title: "Fehler richtig melden", file: "bonitaet-worker.js",
    theory: `
      <p>Die Unterscheidung zwischen <code>fail</code> und <code>error</code> ist eine der wichtigsten Entscheidungen beim Worker-Schreiben:</p>
      ${pre(`
// Technisch: nochmal versuchen (Standard: Retries laufen runter)
return job.fail("Kunden-API nicht erreichbar");

// Technisch, aber ein Retry bringt nichts: sofort Incident
return job.fail({ errorMessage: "Pflichtfeld fehlt", retries: 0 });

// Fachlich: das Modell soll entscheiden (Error Boundary Event)
return job.error("BONITAET_ABGELEHNT", "Score 410 unter Grenzwert 600");
`)}
      <p>Mit <code>retries: 0</code> entsteht sofort ein Incident. Das ist richtig, wenn Daten fehlen: Ein zweiter Versuch mit denselben Daten würde genauso scheitern. Jemand muss in Operate nachsehen.</p>`,
    task: `
      <p>Worker für den Task-Typ <code>bonitaet-pruefen</code>. Variablen: <code>kundeId</code> und <code>score</code>.</p>
      <ul>
        <li>Fehlt <code>kundeId</code>: <code>job.fail</code> mit <code>retries: 0</code></li>
        <li>Ist <code>score</code> unter 600: <code>job.error</code> mit Code <code>"BONITAET_ABGELEHNT"</code></li>
        <li>Sonst: <code>job.complete({ genehmigt: true })</code></li>
      </ul>`,
    starter: `zeebe.createWorker({
  taskType: "bonitaet-pruefen",
  taskHandler: async (job) => {
    const { kundeId, score } = job.variables;

    // 1. kundeId fehlt → fail ohne Retries
    // 2. score < 600 → BPMN-Fehler
    // 3. sonst → complete

  },
});
`,
    hint: `<code>if (!kundeId) return job.fail({ errorMessage: "kundeId fehlt", retries: 0 });</code> Denk an <code>return</code>, sonst läuft der Handler weiter und meldet einen zweiten Ausgang.`,
    solution: `zeebe.createWorker({
  taskType: "bonitaet-pruefen",
  taskHandler: async (job) => {
    const { kundeId, score } = job.variables;

    if (!kundeId) {
      return job.fail({ errorMessage: "kundeId fehlt", retries: 0 });
    }
    if (score < 600) {
      return job.error("BONITAET_ABGELEHNT", \`Score \${score} unter Grenzwert 600\`);
    }
    return job.complete({ genehmigt: true });
  },
});
`,
    tests: [
      ["Score 720 → complete({ genehmigt: true })", async ({ eq, runJob }) => {
        const r = await runJob("bonitaet-pruefen", { kundeId: "K-42", score: 720 });
        eq(r.status, "complete", "Job-Ausgang");
        eq(r.variables, { genehmigt: true }, "Variablen in complete()");
      }],
      ["Score 600 (Grenzfall) → genehmigt", async ({ eq, runJob }) => {
        const r = await runJob("bonitaet-pruefen", { kundeId: "K-1", score: 600 });
        eq(r.status, "complete", "Job-Ausgang");
      }],
      ['Score 410 → error("BONITAET_ABGELEHNT")', async ({ eq, runJob }) => {
        const r = await runJob("bonitaet-pruefen", { kundeId: "K-7", score: 410 });
        eq(r.status, "error", "Job-Ausgang");
        eq(r.errorCode, "BONITAET_ABGELEHNT", "Fehlercode");
      }],
      ["Ohne kundeId → fail mit retries: 0", async ({ eq, runJob }) => {
        const r = await runJob("bonitaet-pruefen", { score: 700 });
        eq(r.status, "fail", "Job-Ausgang");
        eq(r.retries, 0, "retries");
      }],
    ],
  },
  {
    id: "rest-worker", type: "code", title: "Worker mit REST-Aufruf", file: "kunde-laden-worker.js",
    theory: `
      <p>Jetzt kommt alles zusammen: Der Worker holt Daten per REST, prüft den Statuscode, bringt die Antwort in Form und wählt den richtigen Ausgang. So sehen die meisten Worker in echten Projekten aus.</p>
      ${pre(`
const response = await fetch(url);

if (response.status === 404) { /* fachlich: gibt es nicht   → job.error */ }
if (!response.ok)            { /* technisch: 5xx, Wartung   → job.fail  */ }

const daten = await response.json();  // erst jetzt ist sicher, dass es klappt
`)}
      <p>Die Übungs-API aus Modul 2 steht wieder bereit: Kunde 42 existiert, Kunde 13 liefert 503, alles andere 404.</p>`,
    task: `
      <p>Worker für den Task-Typ <code>kunde-laden</code> mit der Variable <code>kundeId</code>:</p>
      <ul>
        <li>Lade <code>https://api.example.com/kunden/&lt;kundeId&gt;</code>.</li>
        <li>Status 404: <code>job.error("KUNDE_NICHT_GEFUNDEN", …)</code></li>
        <li>Anderer Fehlerstatus: <code>job.fail(…)</code></li>
        <li>Erfolg: <code>job.complete({ kunde: { name, email } })</code>, nur diese zwei Felder.</li>
      </ul>`,
    starter: `zeebe.createWorker({
  taskType: "kunde-laden",
  taskHandler: async (job) => {
    const { kundeId } = job.variables;
    const response = await fetch(\`https://api.example.com/kunden/\${kundeId}\`);

    // 404 → error, anderer Fehler → fail, sonst complete

  },
});
`,
    hint: `Prüfe erst <code>response.status === 404</code>, dann <code>!response.ok</code>. Für den Erfolgsfall: <code>const kunde = await response.json();</code> und dann <code>job.complete({ kunde: { name: kunde.name, email: kunde.email } })</code>.`,
    solution: `zeebe.createWorker({
  taskType: "kunde-laden",
  taskHandler: async (job) => {
    const { kundeId } = job.variables;
    const response = await fetch(\`https://api.example.com/kunden/\${kundeId}\`);

    if (response.status === 404) {
      return job.error("KUNDE_NICHT_GEFUNDEN", \`Kunde \${kundeId} existiert nicht\`);
    }
    if (!response.ok) {
      return job.fail(\`Kunden-API antwortet mit \${response.status}\`);
    }

    const kunde = await response.json();
    return job.complete({ kunde: { name: kunde.name, email: kunde.email } });
  },
});
`,
    tests: [
      ["Kunde 42 → complete mit name und email", async ({ eq, runJob }) => {
        const r = await runJob("kunde-laden", { kundeId: 42 });
        eq(r.status, "complete", "Job-Ausgang");
        eq(r.variables, { kunde: { name: "Erika Musterfrau", email: "erika@example.com" } }, "Variablen in complete()");
      }],
      ["Ruft die Übungs-API auf", async ({ assert, runJob, fetchLog }) => {
        await runJob("kunde-laden", { kundeId: 7 });
        assert(fetchLog().some((f) => f.url.endsWith("/kunden/7")), "Es gab keinen fetch-Aufruf auf /kunden/7");
      }],
      ['Kunde 999 (404) → error("KUNDE_NICHT_GEFUNDEN")', async ({ eq, runJob }) => {
        const r = await runJob("kunde-laden", { kundeId: 999 });
        eq(r.status, "error", "Job-Ausgang");
        eq(r.errorCode, "KUNDE_NICHT_GEFUNDEN", "Fehlercode");
      }],
      ["Kunde 13 (503) → fail", async ({ eq, runJob }) => {
        const r = await runJob("kunde-laden", { kundeId: 13 });
        eq(r.status, "fail", "Job-Ausgang");
      }],
    ],
  },
  ],
},
{
  id: "m5", title: "Java & Spring Boot", sub: "Die Enterprise-Seite der Automatisierung",
  lessons: [
  {
    id: "java-basics", type: "quiz", title: "Java für JavaScript-Kenner",
    theory: `
      <p class="story"><b>NordPaket GmbH —</b> Das Backend-Team betreibt die Prozesse nicht nur, es baut auch die Worker dafür – in Java mit Spring Boot. Zeit, dieselbe Logik dort wiederzuerkennen.</p>
      <p>Die meisten Camunda-Projekte in Unternehmen laufen auf Java mit Spring Boot. Die gute Nachricht: Alles, was du bisher gelernt hast, gilt weiter. Java ist nur strenger. Jede Variable hat einen festen <strong>Typ</strong>, und der Compiler prüft ihn, bevor das Programm überhaupt startet.</p>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Konzept</th><th>JavaScript</th><th>Java</th></tr></thead>
        <tbody>
          <tr><td>Variable</td><td><code>const menge = 5;</code></td><td><code>final int menge = 5;</code> oder <code>var menge = 5;</code></td></tr>
          <tr><td>Text</td><td><code>let name = "Erika";</code></td><td><code>String name = "Erika";</code></td></tr>
          <tr><td>Datenobjekt</td><td><code>{ preis: 10, menge: 2 }</code></td><td><code>record Position(double preis, int menge)</code></td></tr>
          <tr><td>Liste</td><td><code>[a, b]</code></td><td><code>List.of(a, b)</code> vom Typ <code>List&lt;Position&gt;</code></td></tr>
          <tr><td>Filtern / Umwandeln</td><td><code>.filter(p =&gt; …).map(p =&gt; …)</code></td><td><code>.stream().filter(p -&gt; …).map(…).toList()</code></td></tr>
          <tr><td>Texte vergleichen</td><td><code>a === b</code></td><td><code>a.equals(b)</code></td></tr>
          <tr><td>Vielleicht leer</td><td><code>undefined</code>, <code>?.</code></td><td><code>Optional&lt;Kunde&gt;</code></td></tr>
          <tr><td>Fehler</td><td><code>throw new Error(…)</code></td><td><code>throw new IllegalStateException(…)</code></td></tr>
        </tbody>
      </table></div>
      ${pre(`
// record erzeugt Konstruktor und Zugriffsmethoden (preis(), menge(), ...) automatisch
public record Position(String artikel, double preis, int menge) {
  public double summe() {
    return preis * menge;
  }
}

List<Position> positionen = List.of(                 // unveränderliche Liste, wie [a, b] in JS
    new Position("Kabel", 4.5, 10),
    new Position("Router", 89.0, 1));

double gesamt = positionen.stream()   // .stream() macht aus der Liste einen Datenstrom für filter/map/reduce
    .mapToDouble(Position::summe)     // Methodenreferenz, wie p -> p.summe()
    .sum();                           // Endergebnis: eine Zahl statt eines Streams
`)}
      <p>Ein <strong>record</strong> ist eine unveränderliche Datenklasse. Java erzeugt Konstruktor, <code>equals</code>, <code>toString</code> und Zugriffsmethoden automatisch. Die heißen wie das Feld: <code>p.preis()</code>, nicht <code>getPreis()</code>.</p>`,
    questions: [
      { q: `Wie vergleichst du in Java zwei Strings auf gleichen Inhalt?`, options: ["<code>a == b</code>", "<code>a.equals(b)</code>", "<code>a === b</code>"], correct: 1,
        explain: `<code>==</code> prüft bei Objekten, ob es dasselbe Objekt im Speicher ist, nicht ob der Inhalt gleich ist. Das ist ein klassischer Fehler.` },
      { q: `<code>record Position(String artikel, double preis, int menge)</code>: Wie liest du den Preis?`, options: ["<code>p.getPreis()</code>", "<code>p.preis()</code>", "<code>p.preis</code>"], correct: 1,
        explain: `Records erzeugen Zugriffsmethoden ohne „get“-Präfix. Bei klassischen Klassen (JavaBeans) wäre es <code>getPreis()</code>.` },
      { q: `Was bedeutet <code>List&lt;Kunde&gt;</code>?`, options: ["Eine Liste, die nur Kunde-Objekte enthalten darf", "Eine Liste mit höchstens einem Kunden", "Ein Kunde, der eine Liste enthält"], correct: 0,
        explain: `Das sind Generics: Der Typ in spitzen Klammern legt fest, was in der Liste stehen darf. Der Compiler prüft das.` },
      { q: `Was passiert bei <code>int menge = "zehn";</code>?`, options: ["Ein Laufzeitfehler, sobald die Zeile ausgeführt wird", "Der Compiler meldet einen Fehler, das Programm startet gar nicht", "menge wird 0"], correct: 1,
        explain: `Statische Typisierung fängt solche Fehler vor dem Start ab. In JavaScript würdest du sie erst zur Laufzeit bemerken.` },
      { q: `Wofür steht <code>Optional&lt;Kunde&gt;</code> als Rückgabetyp?`, options: ["Der Parameter ist optional", "Es gibt einen Kunden oder keinen, und der Aufrufer muss beide Fälle behandeln", "Die Methode läuft asynchron"], correct: 1,
        explain: `Optional macht „vielleicht leer“ im Typ sichtbar, statt <code>null</code> zurückzugeben.` },
    ],
  },
  {
    id: "java-luecken", type: "fill", title: "Java lesen und ergänzen", file: "KundenService.java",
    theory: `
      <p>In Projekten liest du Java-Code öfter, als du ihn neu schreibst. Die wichtigsten Bausteine für Prozessdaten sind Records, Methoden und Streams.</p>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Baustein</th><th>Bedeutung</th></tr></thead>
        <tbody>
          <tr><td><code>public boolean istX() { return …; }</code></td><td>Methode mit Rückgabetyp <code>boolean</code></td></tr>
          <tr><td><code>liste.stream()</code></td><td>macht aus der Liste einen Datenstrom für filter/map</td></tr>
          <tr><td><code>.filter(k -&gt; bedingung)</code></td><td>behält passende Elemente, <code>-&gt;</code> ist Javas Pfeil</td></tr>
          <tr><td><code>.map(Kunde::name)</code></td><td>Methodenreferenz, kurz für <code>k -&gt; k.name()</code></td></tr>
          <tr><td><code>.toList()</code></td><td>sammelt das Ergebnis in eine neue Liste</td></tr>
        </tbody>
      </table></div>`,
    task: `<p>Ergänze die Lücken, damit <code>kreditwuerdigeNamen</code> die Namen aller Kunden mit Score ab 600 liefert und <code>istGold</code> den Kundentyp korrekt vergleicht. Groß- und Kleinschreibung zählt.</p>`,
    code: `
public record Kunde(String id, String name, int score) {

  public boolean istKreditwuerdig() {
    [[b1]] score >= 600;
  }
}

public class KundenService {

  public List<String> kreditwuerdigeNamen(List<Kunde> kunden) {
    return kunden.[[b2]]()
        .filter(k -> k.[[b3]]())
        .map([[b4]]::name)
        .toList();
  }

  public boolean istGold(String typ) {
    return "gold".[[b5]](typ);
  }
}`,
    blanks: { b1: ["return"], b2: ["stream"], b3: ["istKreditwuerdig"], b4: ["Kunde"], b5: ["equals"] },
    hint: `Eine Methode liefert ihr Ergebnis mit dem gleichen Wort wie in JavaScript. Für Lücke 3 ruf die Methode auf, die der Record oben definiert. Texte vergleicht Java nicht mit <code>==</code>.`,
  },
  {
    id: "spring-di", type: "quiz", title: "Spring Boot: Beans & Schichten",
    theory: `
      <p><strong>Spring Boot</strong> ist das Standard-Framework für Java-Services. Sein Kern ist der <strong>Container</strong>: Er erzeugt deine Objekte (Beans) und reicht sie dorthin weiter, wo sie gebraucht werden. Das heißt <strong>Dependency Injection</strong>.</p>
      ${pre(`
@Service
public class BonitaetService {

  private final KundenClient kundenClient;

  // Constructor Injection: Spring übergibt den KundenClient automatisch
  public BonitaetService(KundenClient kundenClient) {
    this.kundenClient = kundenClient;
  }

  public boolean pruefe(String kundeId) {
    return kundenClient.ladeKunde(kundeId).score() >= 600;
  }
}
`)}
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Annotation</th><th>Rolle</th></tr></thead>
        <tbody>
          <tr><td><code>@SpringBootApplication</code></td><td>Startklasse, schaltet Autokonfiguration und Komponentensuche ein</td></tr>
          <tr><td><code>@RestController</code></td><td>Web-Schicht: nimmt HTTP-Anfragen an</td></tr>
          <tr><td><code>@Service</code></td><td>Anwendungs- und Geschäftslogik</td></tr>
          <tr><td><code>@Repository</code></td><td>Datenzugriff</td></tr>
          <tr><td><code>@Component</code></td><td>allgemeine Bean, z. B. ein Job Worker</td></tr>
          <tr><td><code>@Configuration</code> + <code>@Bean</code></td><td>Beans von Hand erzeugen, z. B. einen konfigurierten HTTP-Client</td></tr>
        </tbody>
      </table></div>
      <h3>Konfiguration statt fester Werte</h3>
      ${pre(`
# application.yaml
kunden-api:
  base-url: https://crm.example.com/api
  timeout: 5s
`)}
      ${pre(`
@ConfigurationProperties(prefix = "kunden-api")
public record KundenApiProperties(String baseUrl, Duration timeout) {}
`)}
      <p>Für Test und Produktion legst du Profile an, etwa <code>application-test.yaml</code>. Geheimnisse wie Passwörter kommen aus Umgebungsvariablen oder einem Secret Store, nie ins Repository.</p>`,
    questions: [
      { q: `Warum Constructor Injection statt <code>@Autowired</code> auf einem Feld?`, options: ["Abhängigkeiten sind Pflicht und final, und die Klasse lässt sich im Unit-Test ohne Spring erzeugen", "Sie macht den Start schneller", "Feldinjektion funktioniert in Spring Boot nicht mehr"], correct: 0,
        explain: `Im Test schreibst du einfach <code>new BonitaetService(fakeClient)</code>. Feldinjektion funktioniert zwar, versteckt aber Abhängigkeiten.` },
      { q: `Was ist eine Spring Bean?`, options: ["Ein Objekt, das der Spring-Container erzeugt und verwaltet", "Eine Klasse mit main-Methode", "Ein Maven-Plugin"], correct: 0,
        explain: `Standardmäßig gibt es jede Bean genau einmal (Singleton), und Spring reicht diese Instanz überall hin.` },
      { q: `Die URL des CRM unterscheidet sich zwischen Test und Produktion. Wohin damit?`, options: ["Als Konstante in den Service", "In die application.yaml bzw. profilspezifische Dateien oder Umgebungsvariablen", "In die BPMN-Datei"], correct: 1,
        explain: `So läuft dasselbe Build-Artefakt in jeder Umgebung. Das ist ein Grundprinzip der Twelve-Factor-Apps.` },
      { q: `In welche Schicht gehört die Geschäftslogik?`, options: ["Controller", "Service bzw. Domänenklassen", "Repository"], correct: 1,
        explain: `Controller und Worker übersetzen nur. Die Logik liegt darunter, damit sie aus REST, Camunda oder Tests gleich aufrufbar ist.` },
    ],
  },
  {
    id: "spring-rest", type: "fill", title: "REST-Controller mit Spring", file: "BestellungController.java",
    theory: `
      <p>Mit wenigen Annotationen wird aus einer Klasse ein REST-API. Spring wandelt JSON automatisch in Java-Objekte um und zurück.</p>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Annotation</th><th>Zweck</th></tr></thead>
        <tbody>
          <tr><td><code>@RestController</code></td><td>Klasse beantwortet HTTP-Anfragen, Rückgaben werden zu JSON</td></tr>
          <tr><td><code>@RequestMapping("/api/…")</code></td><td>gemeinsamer Pfad-Präfix</td></tr>
          <tr><td><code>@GetMapping</code>, <code>@PostMapping</code>, …</td><td>Methode für eine HTTP-Methode</td></tr>
          <tr><td><code>@PathVariable</code></td><td>Wert aus dem Pfad, z. B. <code>{id}</code></td></tr>
          <tr><td><code>@RequestParam</code></td><td>Wert aus der Query, z. B. <code>?status=offen</code></td></tr>
          <tr><td><code>@RequestBody</code></td><td>JSON-Body als Objekt</td></tr>
          <tr><td><code>ResponseEntity</code></td><td>Antwort mit Statuscode und Headern</td></tr>
        </tbody>
      </table></div>
      <h3>Die Gegenrichtung: selbst ein API aufrufen</h3>
      ${pre(`
Kunde kunde = restClient.get()
    .uri("/kunden/{id}", kundeId)
    .retrieve()
    .body(Kunde.class);
`)}
      <p><code>RestClient</code> ist der moderne synchrone HTTP-Client in Spring. Bei 4xx- und 5xx-Antworten wirft <code>retrieve()</code> standardmäßig eine Exception, die du gezielt behandeln kannst.</p>`,
    task: `<p>Ergänze den Controller: <code>GET /api/bestellungen/{id}</code> liefert die Bestellung oder 404, <code>POST /api/bestellungen</code> legt eine an und antwortet mit 201.</p>`,
    code: `
[[a1]]
@RequestMapping("/api/bestellungen")
public class BestellungController {

  private final BestellungService service;

  public BestellungController(BestellungService service) {
    this.service = service;
  }

  [[a2]]("/{id}")
  public ResponseEntity<Bestellung> lade([[a3]] String id) {
    return service.finde(id)              // Optional<Bestellung>
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.[[a4]]().build());
  }

  @PostMapping
  public ResponseEntity<Bestellung> anlegen([[a5]] NeueBestellung eingabe) {
    Bestellung b = service.anlegen(eingabe);
    return ResponseEntity.created(URI.create("/api/bestellungen/" + b.id())).body(b);
  }
}`,
    blanks: { a1: ["@RestController"], a2: ["@GetMapping"], a3: ["@PathVariable"], a4: ["notFound"], a5: ["@RequestBody"] },
    hint: `Alle Annotationen stehen in der Tabelle links. Für Lücke 4 suchst du die Methode von <code>ResponseEntity</code>, die Status 404 erzeugt.`,
  },
  {
    id: "spring-worker", type: "fill", title: "Job Worker mit Spring Boot", file: "BonitaetWorker.java",
    theory: `
      <p>Mit dem Spring-Boot-Starter von Camunda wird ein Worker zu einer einfachen Methode. Der Artefaktname des Starters hat sich zwischen Versionen geändert, die aktuelle Angabe findest du in der Camunda-Doku.</p>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Node.js (Modul 4)</th><th>Spring Boot</th></tr></thead>
        <tbody>
          <tr><td><code>zeebe.createWorker({ taskType: "x", … })</code></td><td><code>@JobWorker(type = "x")</code> an einer Methode</td></tr>
          <tr><td><code>job.variables.kundeId</code></td><td>Parameter <code>@Variable String kundeId</code></td></tr>
          <tr><td><code>return job.complete({ … })</code></td><td>Rückgabe einer Map oder eines Objekts, der Job wird automatisch abgeschlossen</td></tr>
          <tr><td><code>job.fail(…)</code></td><td>eine beliebige Exception werfen, dann greifen die Retries</td></tr>
          <tr><td><code>job.error("CODE", …)</code></td><td>eine BPMN-Error-Exception werfen, z. B. <code>ZeebeBpmnError</code></td></tr>
        </tbody>
      </table></div>
      <p class="note">In neueren Versionen des Camunda Spring SDK gibt es für BPMN-Fehler zusätzlich die Fabrikmethode <code>CamundaError.bpmnError(…)</code>. Das Prinzip bleibt gleich: Die Exception trägt den Fehlercode, den das Error Boundary Event im Modell abfängt.</p>
      <p>Halte Worker dünn. Sie übersetzen zwischen Camunda und deiner Fachlogik, die in einem Service liegt. Warum das wichtig ist, zeigt dir „Clean Architecture“ in Modul 7.</p>`,
    task: `<p>Ergänze den Worker für den Task-Typ <code>bonitaet-pruefen</code> aus Modul 4, diesmal in Java. Bei einem Score unter 600 soll er einen BPMN-Fehler mit dem Code <code>BONITAET_ABGELEHNT</code> werfen.</p>`,
    code: `
@Component
public class BonitaetWorker {

  private final KundenClient kundenClient;

  public BonitaetWorker(KundenClient kundenClient) {
    this.kundenClient = kundenClient;
  }

  [[w1]](type = "[[w2]]")
  public Map<String, Object> pruefe([[w3]] String kundeId) {
    Kunde kunde = kundenClient.ladeKunde(kundeId);

    if (kunde.score() < 600) {
      throw new [[w4]]("BONITAET_ABGELEHNT", "Score " + kunde.score() + " unter 600");
    }
    return Map.of("genehmigt", true);
  }
}`,
    blanks: { w1: ["@JobWorker"], w2: ["bonitaet-pruefen"], w3: ["@Variable"], w4: ["ZeebeBpmnError"] },
    hint: `Die Vergleichstabelle links zeigt alle vier Stellen. Der Task-Typ steht so im Modell, wie du ihn in Modul 4 verwendet hast.`,
  },
  ],
},
{
  id: "m6", title: "Integration & Messaging", sub: "REST, Events und Event-Driven Architecture",
  lessons: [
  {
    id: "orchestrierung", type: "quiz", title: "Orchestrierung oder Choreografie",
    theory: `
      <p class="story"><b>NordPaket GmbH —</b> Der Prozess wächst: Zahlungseingang, Lagerbestand und Versanddienstleister müssen jetzt zusammenspielen, nicht mehr nur ein Worker allein.</p>
      <p>Wenn mehrere Services einen Geschäftsprozess gemeinsam erledigen, gibt es zwei Grundmuster:</p>
      <div class="table-wrap"><table class="t">
        <thead><tr><th></th><th>Orchestrierung</th><th>Choreografie</th></tr></thead>
        <tbody>
          <tr><td>Steuerung</td><td>Ein Orchestrator, z. B. ein Camunda-Prozess, ruft die Beteiligten auf</td><td>Niemand zentral, jeder reagiert auf Events der anderen</td></tr>
          <tr><td>Sichtbarkeit</td><td>Ablauf als BPMN sichtbar, Status jeder Instanz in Operate</td><td>Ablauf steckt verteilt im Code aller Services</td></tr>
          <tr><td>Kopplung</td><td>Der Orchestrator kennt die Beteiligten</td><td>Lose, Services kennen nur Events</td></tr>
          <tr><td>Stärken</td><td>Fristen, Kompensation, Monitoring, Änderungen an einer Stelle</td><td>Hohe Autonomie, gut für einfache Reaktionen</td></tr>
          <tr><td>Risiko</td><td>Der Orchestrator übernimmt Fachlogik anderer und wird zum „Gott-Service“</td><td>Unsichtbare Abläufe, schwer zu ändern und zu überwachen</td></tr>
        </tbody>
      </table></div>
      <p>In der Praxis kombiniert man beides: Innerhalb eines fachlichen Bereichs orchestriert ein Prozess die Schritte, zwischen den Bereichen fließen Events. Camunda-Prozesse können Events empfangen (Nachrichten-Ereignisse) und selbst welche auslösen.</p>
      <h3>Synchron oder asynchron?</h3>
      <p>REST-Aufrufe sind einfach, koppeln aber zeitlich: Ist der andere Service nicht erreichbar, scheitert der Aufruf. Messaging entkoppelt zeitlich, bringt dafür verzögerte Konsistenz (eventual consistency) und mögliche Duplikate mit.</p>`,
    questions: [
      { q: `Ein Kreditantrag durchläuft 8 Schritte mit Fristen, manuellen Prüfungen und Stornierungen. Der Fachbereich will jederzeit sehen, wo jeder Antrag steht. Was passt besser?`, options: ["Orchestrierung mit einem BPMN-Prozess", "Choreografie über Events", "Ein nächtlicher Batch-Job"], correct: 0,
        explain: `Fristen, Kompensation und Transparenz pro Instanz sind die Stärken eines Orchestrators.` },
      { q: `Nach „Kunde angelegt“ sollen Newsletter-, CRM- und Analytics-Service unabhängig voneinander reagieren. Was passt?`, options: ["Ein Prozess, der alle drei nacheinander aufruft", "Ein Event, das alle drei abonnieren (Choreografie)", "Drei Datenbank-Trigger"], correct: 1,
        explain: `Die Reaktionen hängen nicht voneinander ab, und neue Abonnenten kommen ohne Änderung am Sender hinzu.` },
      { q: `Was ist ein typisches Anti-Pattern bei Orchestrierung?`, options: ["Der Prozess enthält die Fachlogik der beteiligten Services, statt sie aufzurufen", "Der Prozess hat Timer", "Der Prozess nutzt Service Tasks"], correct: 0,
        explain: `Der Prozess sagt, <em>was</em> wann passiert. <em>Wie</em> eine Bonität berechnet wird, gehört in den zuständigen Service.` },
      { q: `Welcher Nachteil entsteht bei synchronen REST-Ketten A → B → C?`, options: ["Fällt C aus, scheitert die ganze Kette, und die Verfügbarkeiten multiplizieren sich", "Es gibt keinen Nachteil", "REST ist grundsätzlich langsamer als Messaging"], correct: 0,
        explain: `Drei Services mit je 99 % Verfügbarkeit ergeben zusammen nur etwa 97 %.` },
    ],
  },
  {
    id: "integrationsmuster", type: "sort", title: "Enterprise Integration Patterns",
    theory: `
      <p>Die <strong>Enterprise Integration Patterns</strong> von Hohpe und Woolf sind ein gemeinsames Vokabular für Integrationsprobleme. Du findest sie in Messaging-Systemen, Integrationsplattformen und BPMN-Modellen wieder.</p>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Muster</th><th>Was es tut</th><th>In Camunda</th></tr></thead>
        <tbody>
          <tr><td>Content-Based Router</td><td>leitet eine Nachricht anhand ihres Inhalts an ein Ziel</td><td>exklusives Gateway</td></tr>
          <tr><td>Message Translator</td><td>wandelt ein Datenformat in ein anderes um</td><td>Input-/Output-Mapping, Mapping im Worker</td></tr>
          <tr><td>Splitter</td><td>zerlegt eine Nachricht in mehrere</td><td>Multi-Instance über eine Liste</td></tr>
          <tr><td>Aggregator</td><td>sammelt zusammengehörige Nachrichten zu einer</td><td>Multi-Instance mit outputCollection, paralleles Join</td></tr>
          <tr><td>Dead Letter Channel</td><td>parkt Nachrichten, die sich nicht verarbeiten lassen</td><td>Incident in Operate, DLQ im Broker</td></tr>
        </tbody>
      </table></div>`,
    task: `<p>Ordne jedem Integrationsproblem das passende Muster zu.</p>`,
    categories: [
      { id: "router", label: "Content-Based Router" },
      { id: "translator", label: "Message Translator" },
      { id: "splitter", label: "Splitter" },
      { id: "aggregator", label: "Aggregator" },
      { id: "dlc", label: "Dead Letter Channel" },
    ],
    items: [
      { text: "Bestellungen aus Österreich gehen an das Lager in Linz, alle anderen an das Lager in Kassel.", cat: "router", why: "Das Ziel hängt vom Inhalt (Land) ab." },
      { text: "Das Altsystem liefert XML mit dem Feld <code>KDNR</code>, der Prozess erwartet JSON mit <code>kundeId</code>.", cat: "translator", why: "Formatwandlung, ohne den Inhalt zu ändern. Das ist klassischerweise ein Anticorruption Layer." },
      { text: "Eine Sammelbestellung mit 40 Positionen wird in 40 Einzelaufträge an die Lieferanten zerlegt.", cat: "splitter", why: "Aus einer Nachricht werden viele." },
      { text: "Erst wenn die Angebote aller drei Spediteure vorliegen, wird das günstigste gewählt.", cat: "aggregator", why: "Mehrere zusammengehörige Nachrichten werden gesammelt und gemeinsam ausgewertet." },
      { text: "Eine Nachricht scheitert auch nach 5 Versuchen und wird zur manuellen Prüfung beiseitegelegt.", cat: "dlc", why: "Unverarbeitbare Nachrichten blockieren so nicht den Rest." },
      { text: "Je nach Dokumenttyp landen Rechnungen und Mahnungen in unterschiedlichen Queues.", cat: "router", why: "Auch hier entscheidet der Inhalt über das Ziel." },
    ],
  },
  {
    id: "messaging", type: "quiz", title: "Messaging & Event-Driven Architecture",
    theory: `
      <p>In einer <strong>Event-Driven Architecture</strong> melden Services, dass etwas passiert ist, und andere reagieren darauf. Das Transportmittel ist ein Message Broker wie Kafka oder RabbitMQ.</p>
      <div class="table-wrap"><table class="t">
        <thead><tr><th></th><th>Queue (Point-to-Point)</th><th>Topic (Publish/Subscribe)</th></tr></thead>
        <tbody>
          <tr><td>Empfänger</td><td>genau einer verarbeitet jede Nachricht</td><td>jeder Abonnent bekommt eine Kopie</td></tr>
          <tr><td>Typisch für</td><td>Aufträge verteilen („bitte tu das“)</td><td>Events verbreiten („das ist passiert“)</td></tr>
        </tbody>
      </table></div>
      <h3>Kafka in Kürze</h3>
      <ul>
        <li>Ein <strong>Topic</strong> ist in <strong>Partitionen</strong> aufgeteilt. Innerhalb einer Partition bleibt die Reihenfolge erhalten.</li>
        <li>Der <strong>Key</strong> einer Nachricht bestimmt die Partition. Gleicher Key, gleiche Partition, gleiche Reihenfolge.</li>
        <li>Eine <strong>Consumer Group</strong> teilt sich die Partitionen: Jede Partition gehört genau einem Consumer der Gruppe.</li>
        <li>Nachrichten bleiben nach dem Lesen erhalten (Retention). Jeder Consumer merkt sich seinen <strong>Offset</strong>.</li>
      </ul>
      ${pre(`
// Senden: Key = Bestellnummer, damit alle Events einer Bestellung geordnet bleiben
kafkaTemplate.send("bestellungen", bestellung.id(), event);

// Empfangen
@KafkaListener(topics = "zahlungen", groupId = "bestellservice")
public void onZahlung(ZahlungEvent event) {
  bestellService.zahlungVerbuchen(event.bestellId(), event.betrag());
}
`)}
      <h3>Zustellgarantien</h3>
      <p>In der Praxis bekommst du fast immer <strong>at-least-once</strong>: Eine Nachricht geht nicht verloren, kann aber doppelt ankommen, etwa wenn ein Consumer nach der Verarbeitung, aber vor dem Bestätigen abstürzt. Deshalb müssen Consumer <strong>idempotent</strong> sein. Das übst du im nächsten Schritt.</p>
      <h3>Arten von Events</h3>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Stil</th><th>Inhalt</th></tr></thead>
        <tbody>
          <tr><td>Event Notification</td><td>schlank: „Bestellung B-2001 aufgegeben“, Details holt man sich per API</td></tr>
          <tr><td>Event-Carried State Transfer</td><td>das Event trägt alle relevanten Daten, Empfänger brauchen keine Rückfrage</td></tr>
          <tr><td>Event Sourcing</td><td>der Zustand wird komplett aus der Folge aller Events rekonstruiert</td></tr>
        </tbody>
      </table></div>`,
    questions: [
      { q: `Drei Services sollen jeweils auf „BestellungAufgegeben“ reagieren. Was nutzt du?`, options: ["Eine Queue, aus der alle drei lesen", "Ein Topic, das alle drei abonnieren", "Drei REST-Aufrufe vom Bestellservice"], correct: 1,
        explain: `Bei einer Queue bekäme jede Nachricht nur einer der drei. Beim Topic bekommt jeder eine Kopie.` },
      { q: `Alle Events derselben Bestellung sollen in der richtigen Reihenfolge verarbeitet werden. Was tust du in Kafka?`, options: ["Die Bestellnummer als Key verwenden", "Nur eine Partition für das ganze Topic", "Die Events mit Zeitstempel versehen und hoffen"], correct: 0,
        explain: `Gleicher Key heißt gleiche Partition und damit feste Reihenfolge. Eine einzige Partition würde auch funktionieren, verhindert aber jede Parallelität.` },
      { q: `Was bedeutet at-least-once für deinen Consumer?`, options: ["Nachrichten können verloren gehen", "Nachrichten können doppelt ankommen, er muss Duplikate erkennen", "Jede Nachricht kommt genau einmal"], correct: 1,
        explain: `Genau deshalb sind idempotente Consumer Pflicht.` },
      { q: `Ein Topic hat 2 Partitionen, die Consumer Group 3 Consumer. Was passiert?`, options: ["Alle drei teilen sich die Last gleichmäßig", "Ein Consumer bleibt untätig", "Kafka legt automatisch eine dritte Partition an"], correct: 1,
        explain: `Jede Partition gehört genau einem Consumer der Gruppe. Mehr Consumer als Partitionen bringt keine zusätzliche Parallelität.` },
    ],
  },
  {
    id: "idempotenz", type: "code", title: "Idempotenter Consumer", file: "zahlungs-consumer.js",
    theory: `
      <p>Kommt dasselbe Event zweimal an, darf das Ergebnis nicht doppelt zählen. Manche Operationen sind von Natur aus idempotent: <code>status = "bezahlt"</code> zweimal zu setzen schadet nicht. <code>summe += 100</code> zweimal auszuführen schon. Dann merkt sich der Consumer, welche Event-IDs er schon verarbeitet hat.</p>
      <p>Dafür brauchst du zwei neue Bausteine. Eine <strong>Klasse</strong> bündelt Daten und Methoden, ein <strong>Set</strong> ist eine Menge ohne Duplikate:</p>
      ${pre(`
class Zaehler {
  constructor() {
    this.wert = 0;                 // Zustand des Objekts
  }

  erhoehe(um) {
    this.wert += um;
    return this.wert;
  }
}

const z = new Zaehler();
z.erhoehe(5);                      // 5

const gesehen = new Set();
gesehen.add("evt-1");
gesehen.has("evt-1");              // true
gesehen.has("evt-2");              // false
`)}
      <p class="note">Im echten System ist das Set eine Datenbanktabelle mit eindeutigem Schlüssel auf der Event-ID. Die Prüfung und die Verarbeitung laufen dann in derselben Transaktion.</p>`,
    task: `
      <p>Vervollständige die Klasse <code>ZahlungsConsumer</code>. Die Methode <code>verarbeite(event)</code> bekommt Events wie <code>{ eventId: "evt-1", bestellId: "B-1", betrag: 100 }</code>:</p>
      <ul>
        <li>Neue <code>eventId</code>: <code>betrag</code> zu <code>this.summe</code> addieren und <code>true</code> zurückgeben.</li>
        <li>Schon verarbeitete <code>eventId</code>: nichts ändern und <code>false</code> zurückgeben.</li>
      </ul>`,
    starter: `class ZahlungsConsumer {
  constructor() {
    this.summe = 0;
    this.verarbeiteteIds = new Set();
  }

  verarbeite(event) {
    // Duplikat erkennen, sonst verbuchen und merken
  }
}

const consumer = new ZahlungsConsumer();
consumer.verarbeite({ eventId: "evt-1", bestellId: "B-1", betrag: 100 });
consumer.verarbeite({ eventId: "evt-1", bestellId: "B-1", betrag: 100 }); // Duplikat!
console.log(consumer.summe); // erwartet: 100
`,
    hint: `<code>if (this.verarbeiteteIds.has(event.eventId)) return false;</code> Danach Betrag addieren, die ID mit <code>add</code> merken und <code>true</code> zurückgeben.`,
    solution: `class ZahlungsConsumer {
  constructor() {
    this.summe = 0;
    this.verarbeiteteIds = new Set();
  }

  verarbeite(event) {
    if (this.verarbeiteteIds.has(event.eventId)) {
      return false;
    }
    this.summe += event.betrag;
    this.verarbeiteteIds.add(event.eventId);
    return true;
  }
}

const consumer = new ZahlungsConsumer();
consumer.verarbeite({ eventId: "evt-1", bestellId: "B-1", betrag: 100 });
consumer.verarbeite({ eventId: "evt-1", bestellId: "B-1", betrag: 100 }); // Duplikat!
console.log(consumer.summe); // 100
`,
    tests: [
      ["Neues Event wird verbucht und liefert true", ({ eq }) => {
        const c = new ZahlungsConsumer();
        eq(c.verarbeite({ eventId: "e1", bestellId: "B-1", betrag: 100 }), true, "Rückgabe");
        eq(c.summe, 100, "summe");
      }],
      ["Duplikat liefert false und ändert die Summe nicht", ({ eq }) => {
        const c = new ZahlungsConsumer();
        const e = { eventId: "e1", bestellId: "B-1", betrag: 100 };
        c.verarbeite(e);
        eq(c.verarbeite(e), false, "Rückgabe beim Duplikat");
        eq(c.summe, 100, "summe nach Duplikat");
      }],
      ["Gemischte Folge e1, e2, e1 ergibt 150", ({ eq }) => {
        const c = new ZahlungsConsumer();
        c.verarbeite({ eventId: "e1", betrag: 100 });
        c.verarbeite({ eventId: "e2", betrag: 50 });
        c.verarbeite({ eventId: "e1", betrag: 100 });
        eq(c.summe, 150, "summe");
      }],
    ],
  },
  {
    id: "korrelation", type: "code", title: "Events mit Prozessen verbinden", file: "zahlungs-bridge.js",
    theory: `
      <p>Ein Prozess wartet an einem Nachrichten-Ereignis „Zahlung eingegangen“. Die Zahlung selbst kommt als Kafka-Event vom Zahlungsdienst. Dazwischen sitzt eine kleine Brücke: Sie liest das Event und <strong>veröffentlicht eine Nachricht</strong> an Camunda.</p>
      ${pre(`
await zeebe.publishMessage({
  name: "ZahlungEingegangen",       // wie im Modell am Nachrichten-Ereignis
  correlationKey: "B-2001",         // findet die Instanz mit bestellId = "B-2001"
  messageId: "evt-77",              // Camunda verwirft Duplikate mit gleicher ID
  variables: { betrag: 249.9 },     // landen in der Prozessinstanz
});
`)}
      <ul>
        <li><strong>name</strong> muss exakt dem Nachrichtennamen im Modell entsprechen.</li>
        <li><strong>correlationKey</strong> ist der Wert, den die wartende Instanz über ihren FEEL-Ausdruck (z. B. <code>= bestellId</code>) erwartet.</li>
        <li><strong>messageId</strong> macht die Veröffentlichung idempotent. Nimm dafür die ID des eingehenden Events.</li>
        <li>Wartet noch keine Instanz, kann Camunda die Nachricht für eine Zeit puffern (Time to live).</li>
      </ul>`,
    task: `
      <p>Schreibe <code>async function onZahlungsEvent(event)</code>. Das Kafka-Event sieht so aus:</p>
      ${pre(`{ eventId: "evt-77", type: "PaymentReceived", payload: { orderId: "B-2001", amount: 249.9 } }`)}
      <ul>
        <li>Nur bei <code>type === "PaymentReceived"</code> veröffentlichst du die Nachricht <code>"ZahlungEingegangen"</code> mit <code>correlationKey</code> = <code>orderId</code>, <code>messageId</code> = <code>eventId</code> und <code>variables: { betrag }</code>. Dann gibst du <code>true</code> zurück.</li>
        <li>Andere Event-Typen ignorierst du und gibst <code>false</code> zurück.</li>
      </ul>`,
    starter: `async function onZahlungsEvent(event) {
  // 1. Nur PaymentReceived weiterleiten
  // 2. Englische Felder in die Sprache des Prozesses übersetzen
  // 3. zeebe.publishMessage({ ... })
}

onZahlungsEvent({ eventId: "evt-77", type: "PaymentReceived", payload: { orderId: "B-2001", amount: 249.9 } });
`,
    hint: `<code>if (event.type !== "PaymentReceived") return false;</code> Danach <code>await zeebe.publishMessage({ name: "ZahlungEingegangen", correlationKey: event.payload.orderId, … })</code>`,
    solution: `async function onZahlungsEvent(event) {
  if (event.type !== "PaymentReceived") {
    return false;
  }
  const { orderId, amount } = event.payload;

  await zeebe.publishMessage({
    name: "ZahlungEingegangen",
    correlationKey: orderId,
    messageId: event.eventId,
    variables: { betrag: amount },
  });
  return true;
}

onZahlungsEvent({ eventId: "evt-77", type: "PaymentReceived", payload: { orderId: "B-2001", amount: 249.9 } });
`,
    tests: [
      ["PaymentReceived wird als ZahlungEingegangen veröffentlicht", async ({ eq, messages }) => {
        const r = await onZahlungsEvent({ eventId: "t-1", type: "PaymentReceived", payload: { orderId: "B-3001", amount: 99.5 } });
        eq(r, true, "Rückgabe");
        const m = messages().find((x) => x.messageId === "t-1");
        eq(m && m.name, "ZahlungEingegangen", "name der Nachricht mit messageId t-1");
        eq(m.correlationKey, "B-3001", "correlationKey");
        eq(m.variables, { betrag: 99.5 }, "variables");
      }],
      ["Andere Event-Typen werden ignoriert", async ({ eq, messages }) => {
        const vorher = messages().length;
        const r = await onZahlungsEvent({ eventId: "t-2", type: "PaymentFailed", payload: { orderId: "B-3002", amount: 10 } });
        eq(r, false, "Rückgabe");
        eq(messages().length, vorher, "Anzahl veröffentlichter Nachrichten");
      }],
      ["messageId ist die eventId (Duplikatschutz)", async ({ assert, messages }) => {
        await onZahlungsEvent({ eventId: "t-3", type: "PaymentReceived", payload: { orderId: "B-3003", amount: 1 } });
        assert(messages().some((x) => x.messageId === "t-3"), "Keine Nachricht mit messageId \"t-3\" gefunden");
      }],
    ],
  },
  {
    id: "saga-outbox", type: "quiz", title: "Konsistenz: Saga & Outbox",
    theory: `
      <p>Über Servicegrenzen hinweg gibt es keine gemeinsame Datenbanktransaktion. Zwei Muster helfen, trotzdem verlässlich zu bleiben.</p>
      <h3>Das Dual-Write-Problem und die Transactional Outbox</h3>
      <p>Ein Service speichert eine Bestellung und soll das Event „BestellungAufgegeben“ senden. Stürzt er zwischen den beiden Schritten ab, ist die Bestellung gespeichert, aber niemand erfährt davon. Die Lösung: Das Event wird in derselben Datenbanktransaktion in eine <strong>Outbox-Tabelle</strong> geschrieben. Ein separater Prozess (Polling oder Change Data Capture) liest die Outbox und veröffentlicht zuverlässig, mindestens einmal.</p>
      <h3>Saga</h3>
      <p>Eine Saga ist eine Folge lokaler Transaktionen. Scheitert ein Schritt, machen <strong>Kompensationen</strong> die vorherigen fachlich rückgängig. BPMN hat dafür eigene Elemente (Kompensations-Boundary-Events und -Tasks), und ein Camunda-Prozess eignet sich gut als Saga-Orchestrator, weil er weiß, welche Schritte schon gelaufen sind.</p>
      ${pre(`
Reise buchen
  1. Flug reservieren     Kompensation: Flug stornieren
  2. Hotel reservieren    Kompensation: Hotel stornieren
  3. Zahlung belasten     scheitert
  → Hotel stornieren, dann Flug stornieren (umgekehrte Reihenfolge)
`)}`,
    questions: [
      { q: `Welches Problem löst die Transactional Outbox?`, options: ["Das Event geht verloren, wenn zwischen Speichern und Senden etwas schiefgeht", "Langsame Datenbankabfragen", "Doppelte Nachrichten beim Consumer"], correct: 0,
        explain: `Die Outbox garantiert, dass gespeicherte Änderung und Event zusammengehören. Duplikate kann es weiterhin geben, deshalb bleiben Consumer idempotent.` },
      { q: `Was ist eine Kompensation?`, options: ["Ein Datenbank-Rollback über alle Services", "Eine fachliche Gegenaktion, die einen bereits abgeschlossenen Schritt ausgleicht", "Ein Retry"], correct: 1,
        explain: `Eine versendete E-Mail lässt sich nicht zurückrollen, aber mit einer Korrektur-Mail ausgleichen. Kompensation ist Fachlogik.` },
      { q: `Warum eignet sich ein BPMN-Prozess als Saga-Orchestrator?`, options: ["Er kennt den Zustand jeder Instanz, also welche Schritte gelaufen sind und kompensiert werden müssen", "Er ersetzt die Datenbanken der Services", "Er macht verteilte Transaktionen ACID-konform"], correct: 0,
        explain: `Dazu kommen Fristen, Retries und Sichtbarkeit in Operate, die du bei einer selbstgebauten Saga alle nachbauen müsstest.` },
      { q: `Die Kompensation „Zahlung erstatten“ scheitert selbst. Was ist sinnvoll?`, options: ["Ignorieren", "Retries und bei dauerhaftem Fehler ein Incident oder eine manuelle Aufgabe", "Den ganzen Prozess neu starten"], correct: 1,
        explain: `Kompensationen müssen am Ende gelingen. Wenn die Technik nicht mehr weiterkommt, übernimmt ein Mensch.` },
    ],
  },
  ],
},
{
  id: "m7", title: "Architektur", sub: "Microservices, DDD, Event Storming, Clean Architecture",
  lessons: [
  {
    id: "microservices", type: "quiz", title: "Microservices & verteilte Systeme",
    theory: `
      <p class="story"><b>NordPaket GmbH —</b> Mit jedem neuen Team stellt sich dieselbe Frage: ein großer Prozess mit allem drin, oder viele kleine, unabhängige Services?</p>
      <p>Ein <strong>Microservice</strong> ist ein unabhängig deploybarer Service, der eine fachliche Fähigkeit abdeckt, seine eigenen Daten besitzt und von einem Team verantwortet wird. Das bringt Autonomie, aber auch alle Probleme verteilter Systeme.</p>
      <h3>Irrtümer über verteilte Systeme</h3>
      <p>Peter Deutsch und Kollegen haben Annahmen gesammelt, die in verteilten Systemen falsch sind. Die wichtigsten:</p>
      <ul>
        <li>Das Netzwerk ist zuverlässig.</li>
        <li>Die Latenz ist null.</li>
        <li>Die Bandbreite ist unbegrenzt.</li>
        <li>Die Topologie ändert sich nicht.</li>
      </ul>
      <h3>Resilienzmuster</h3>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Muster</th><th>Idee</th></tr></thead>
        <tbody>
          <tr><td>Timeout</td><td>Nie unbegrenzt warten. Jeder Aufruf hat eine Obergrenze.</td></tr>
          <tr><td>Retry mit Backoff und Jitter</td><td>Erneut versuchen, mit wachsenden und leicht zufälligen Abständen</td></tr>
          <tr><td>Circuit Breaker</td><td>Nach vielen Fehlern Aufrufe vorübergehend sofort abweisen, damit sich der Dienst erholt</td></tr>
          <tr><td>Bulkhead</td><td>Ressourcen trennen, damit ein langsamer Dienst nicht alle Threads blockiert</td></tr>
          <tr><td>Fallback</td><td>Ersatzantwort, z. B. zwischengespeicherte Daten</td></tr>
        </tbody>
      </table></div>
      <h3>Beobachtbarkeit</h3>
      <p>Wenn eine Bestellung durch fünf Services läuft, brauchst du eine durchgängige <strong>Korrelations-ID</strong> bzw. Distributed Tracing, z. B. mit OpenTelemetry. Schreib auch den Process Instance Key in deine Logs, dann findest du den Fall in Operate.</p>
      <p class="note">Ein gut geschnittener <strong>modularer Monolith</strong> ist oft der bessere Start. Microservices lohnen sich, wenn Teams unabhängig liefern müssen und die fachlichen Grenzen klar sind.</p>`,
    questions: [
      { q: `Zwei Microservices teilen sich eine Datenbanktabelle. Was ist das Problem?`, options: ["Keins", "Sie sind über das Schema gekoppelt und nicht mehr unabhängig änderbar und deploybar", "Es ist langsamer"], correct: 1,
        explain: `Ändert ein Team eine Spalte, bricht der andere Service. Daten teilt man über APIs oder Events.` },
      { q: `Was macht ein Circuit Breaker?`, options: ["Er weist nach vielen Fehlern Aufrufe an einen Dienst vorübergehend sofort ab", "Er verschlüsselt die Verbindung", "Er verteilt Last auf mehrere Instanzen"], correct: 0,
        explain: `Aufrufer scheitern schnell statt in Timeouts zu hängen, und der Dienst bekommt Luft. Nach einer Pause lässt er testweise wieder Aufrufe durch.` },
      { q: `Warum Jitter beim Retry?`, options: ["Damit nicht alle Clients gleichzeitig erneut anfragen und den Dienst wieder überlasten", "Um Fehler zu verbergen", "Weil HTTP das verlangt"], correct: 0,
        explain: `Ohne Zufallsanteil kommen nach einem Ausfall alle Retries im selben Takt, eine „Thundering Herd“.` },
      { q: `Ein Kunde meldet ein Problem mit Bestellung B-2001, die durch 5 Services lief. Was hilft bei der Analyse am meisten?`, options: ["Eine durchgängige Korrelations-ID bzw. Tracing, dazu die Prozessinstanz in Operate", "Mehr Logs in jedem Service ohne gemeinsame ID", "Alle Services neu starten"], correct: 0,
        explain: `Erst die gemeinsame ID macht aus fünf Logs eine zusammenhängende Geschichte.` },
      { q: `Wann ist ein modularer Monolith oft die bessere Wahl?`, options: ["Bei einem kleinen Team und noch unklaren fachlichen Grenzen", "Wenn 50 Teams unabhängig liefern müssen", "Nie"], correct: 0,
        explain: `Falsch geschnittene Microservices sind teurer als ein Monolith. Klare Module lassen sich später herauslösen.` },
    ],
  },
  {
    id: "resilienz", type: "code", title: "Resilienz im Code", file: "retry.js",
    theory: `
      <p>Bei vorübergehenden Fehlern hilft ein erneuter Versuch. Damit ein angeschlagener Dienst nicht zusätzlich belastet wird, wächst die Wartezeit mit jedem Versuch: <strong>exponentieller Backoff</strong>.</p>
      ${pre(`
Versuch 1 schlägt fehl → 100 ms warten
Versuch 2 schlägt fehl → 200 ms warten
Versuch 3 schlägt fehl → 400 ms warten
…                       → höchstens 2000 ms
`)}
      ${pre(`
const schlafe = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await schlafe(wartezeit(versuch));
`)}
      <p class="note">In einem Camunda-Worker brauchst du das oft nicht selbst: <code>job.fail</code> mit Retries und einem <code>retryBackOff</code> überlässt das Warten der Engine, und der Worker-Thread bleibt frei. Selbst gebaute Retries sind sinnvoll für kurze Aussetzer innerhalb eines Aufrufs.</p>`,
    task: `
      <p>Schreibe zwei Funktionen:</p>
      <ul>
        <li><code>wartezeit(versuch)</code> liefert <code>100 * 2^(versuch - 1)</code> Millisekunden, höchstens aber <code>2000</code>.</li>
        <li><code>async mitRetry(aufruf, maxVersuche)</code> ruft <code>await aufruf()</code> auf, bis es klappt, und gibt das Ergebnis zurück. Scheitern alle <code>maxVersuche</code>, wirft sie den <em>letzten</em> Fehler. Warten musst du in dieser Übung nicht, damit die Tests schnell bleiben.</li>
      </ul>`,
    starter: `function wartezeit(versuch) {
  // 100, 200, 400, 800, 1600, 2000, 2000, ...
}

async function mitRetry(aufruf, maxVersuche) {
  let letzterFehler;
  for (let versuch = 1; versuch <= maxVersuche; versuch++) {
    // try { ... } catch (fehler) { ... }
  }
  throw letzterFehler;
}

console.log(wartezeit(1), wartezeit(3), wartezeit(10)); // 100 400 2000
`,
    hint: `<code>Math.min(100 * 2 ** (versuch - 1), 2000)</code>. In der Schleife: <code>try { return await aufruf(); } catch (fehler) { letzterFehler = fehler; }</code>`,
    solution: `function wartezeit(versuch) {
  return Math.min(100 * 2 ** (versuch - 1), 2000);
}

async function mitRetry(aufruf, maxVersuche) {
  let letzterFehler;
  for (let versuch = 1; versuch <= maxVersuche; versuch++) {
    try {
      return await aufruf();
    } catch (fehler) {
      letzterFehler = fehler;
      console.log(\`Versuch \${versuch} fehlgeschlagen, nächster in \${wartezeit(versuch)} ms\`);
    }
  }
  throw letzterFehler;
}

console.log(wartezeit(1), wartezeit(3), wartezeit(10)); // 100 400 2000
`,
    tests: [
      ["wartezeit: 100, 200, 800", ({ eq }) => { eq(wartezeit(1), 100, "wartezeit(1)"); eq(wartezeit(2), 200, "wartezeit(2)"); eq(wartezeit(4), 800, "wartezeit(4)"); }],
      ["wartezeit ist auf 2000 begrenzt", ({ eq }) => { eq(wartezeit(6), 2000, "wartezeit(6)"); eq(wartezeit(10), 2000, "wartezeit(10)"); }],
      ["Klappt beim 3. Versuch → Ergebnis nach 3 Aufrufen", async ({ eq }) => {
        let aufrufe = 0;
        const r = await mitRetry(async () => { aufrufe++; if (aufrufe < 3) throw new Error("503"); return "ok"; }, 5);
        eq(r, "ok", "Ergebnis");
        eq(aufrufe, 3, "Anzahl Aufrufe");
      }],
      ["Klappt sofort → genau 1 Aufruf", async ({ eq }) => {
        let aufrufe = 0;
        await mitRetry(async () => { aufrufe++; return 1; }, 3);
        eq(aufrufe, 1, "Anzahl Aufrufe");
      }],
      ["Scheitert immer → letzter Fehler nach maxVersuche", async ({ eq, assert }) => {
        let aufrufe = 0, fehler = null;
        try { await mitRetry(async () => { aufrufe++; throw new Error("Versuch " + aufrufe); }, 3); } catch (e) { fehler = e; }
        assert(fehler, "mitRetry sollte nach 3 gescheiterten Versuchen einen Fehler werfen");
        eq(aufrufe, 3, "Anzahl Aufrufe");
        eq(fehler.message, "Versuch 3", "Fehlermeldung (der letzte Fehler)");
      }],
    ],
  },
  {
    id: "ddd", type: "quiz", title: "Domain-Driven Design",
    theory: `
      <p><strong>Domain-Driven Design</strong> (Eric Evans) stellt die Fachlichkeit ins Zentrum der Softwareentwicklung. Es hat eine strategische Seite (wie schneide ich das System?) und eine taktische (wie baue ich das Modell im Code?).</p>
      <h3>Strategisch</h3>
      <ul>
        <li><strong>Ubiquitous Language:</strong> Fachbereich und Entwicklung nutzen dieselben Begriffe, in Gesprächen, im BPMN-Modell, in Variablennamen und im Code.</li>
        <li><strong>Bounded Context:</strong> ein Bereich, in dem ein Modell eindeutig gilt. „Kunde“ im Vertrieb ist ein Lead mit Potenzial, in der Buchhaltung ein Debitor mit Zahlungsbedingungen. Zwei Kontexte, zwei Modelle.</li>
        <li><strong>Context Map:</strong> beschreibt, wie Kontexte zusammenhängen, z. B. Customer/Supplier, Conformist, Shared Kernel, Published Language oder <strong>Anticorruption Layer</strong> (eine Übersetzungsschicht, die das eigene Modell vor einem fremden schützt).</li>
      </ul>
      <h3>Taktisch</h3>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Baustein</th><th>Merkmal</th><th>Beispiel</th></tr></thead>
        <tbody>
          <tr><td>Entity</td><td>hat eine Identität, die über die Zeit gleich bleibt</td><td>Bestellung B-2001</td></tr>
          <tr><td>Value Object</td><td>unveränderlich, wird über seine Werte verglichen</td><td>Geldbetrag(100, EUR), Adresse</td></tr>
          <tr><td>Aggregate</td><td>Konsistenzgrenze, Änderungen nur über die Aggregate Root</td><td>Bestellung mit ihren Positionen</td></tr>
          <tr><td>Domain Event</td><td>fachlich relevante Tatsache in der Vergangenheit</td><td>BestellungAufgegeben</td></tr>
          <tr><td>Repository</td><td>lädt und speichert Aggregates</td><td>BestellungRepository</td></tr>
        </tbody>
      </table></div>
      <h3>DDD und Prozessautomatisierung</h3>
      <p>Ein ausführbarer Prozess gehört idealerweise einem Bounded Context. Über Kontextgrenzen hinweg kommunizieren Prozesse per Nachrichten und Events. Das Mapping im Worker aus Modul 2 ist oft ein kleiner Anticorruption Layer.</p>`,
    questions: [
      { q: `Vertrieb und Buchhaltung verstehen unter „Kunde“ Verschiedenes. Was empfiehlt DDD?`, options: ["Ein gemeinsames Kundenmodell für alle erzwingen", "Getrennte Bounded Contexts mit eigenem Modell und eine klare Übersetzung dazwischen", "Das Wort „Kunde“ vermeiden"], correct: 1,
        explain: `Ein Einheitsmodell für alle wird aufgebläht und von niemandem verstanden. Getrennte Modelle bleiben scharf.` },
      { q: `Was ist ein Value Object?`, options: ["Ein Objekt mit eigener ID", "Ein unveränderliches Objekt, das über seine Werte verglichen wird, z. B. Geldbetrag(100, EUR)", "Ein Datenbankeintrag"], correct: 1,
        explain: `Zwei 100-Euro-Beträge sind gleich, egal welches Objekt. In Java sind Records ideal dafür.` },
      { q: `Wozu dient ein Anticorruption Layer?`, options: ["Er schützt das eigene Modell vor dem Modell eines Altsystems, indem er übersetzt", "Virenschutz", "Rechteprüfung"], correct: 0,
        explain: `Kryptische Felder wie <code>KDNR</code> bleiben draußen, im eigenen Kontext heißt es <code>kundeId</code>.` },
      { q: `Wie benennt man Domain Events?`, options: ["Im Imperativ: „Bestellung aufgeben“", "In der Vergangenheit: „Bestellung aufgegeben“", "Technisch: „OrderTableInsert“"], correct: 1,
        explain: `Ein Event ist eine Tatsache, die schon passiert ist. Der Imperativ ist ein Command.` },
      { q: `Was ist die Aufgabe eines Aggregates?`, options: ["Es ist eine Konsistenzgrenze: Invarianten gelten innerhalb, Änderungen laufen nur über die Root", "Es führt Daten aus mehreren Services zusammen", "Es erzeugt Reports"], correct: 0,
        explain: `Beispiel: Eine Bestellung erlaubt keine neuen Positionen, sobald sie aufgegeben ist. Das kann nur die Bestellung selbst garantieren.` },
    ],
  },
  {
    id: "aggregate", type: "code", title: "Ein Aggregate bauen", file: "bestellung.js",
    theory: `
      <p>Ein Aggregate schützt seine <strong>Invarianten</strong>, also Regeln, die immer gelten müssen. Statt Setter wie <code>setStatus()</code> bietet es Methoden in der Sprache des Fachbereichs: <code>fuegeHinzu</code>, <code>aufgeben</code>. Verletzt ein Aufruf eine Regel, wirft die Methode einen Fehler, und nichts ändert sich.</p>
      ${pre(`
class Konto {
  constructor(id) {
    this.id = id;
    this.saldo = 0;
    this.ereignisse = [];
  }

  abheben(betrag) {
    if (betrag > this.saldo) {
      throw new Error("Deckung nicht ausreichend");   // Invariante schützen
    }
    this.saldo -= betrag;
    this.ereignisse.push({ typ: "GeldAbgehoben", kontoId: this.id, betrag });
  }
}
`)}
      <p>Die gesammelten <strong>Domain Events</strong> veröffentlicht die Anwendung nach dem Speichern, zum Beispiel über die Outbox aus Modul 6.</p>`,
    task: `
      <p>Vervollständige die Klasse <code>Bestellung</code>:</p>
      <ul>
        <li><code>fuegeHinzu(artikel, preis, menge)</code>: Ist der Status nicht <code>"offen"</code>, wirf <code>"Bestellung ist bereits aufgegeben"</code>. Ist die Menge nicht größer als 0, wirf <code>"Menge muss größer als 0 sein"</code>. Sonst die Position anhängen.</li>
        <li><code>gesamt()</code>: Summe aus <code>preis * menge</code>.</li>
        <li><code>aufgeben()</code>: Ohne Positionen wirf <code>"Leere Bestellung kann nicht aufgegeben werden"</code>. Sonst Status auf <code>"aufgegeben"</code> setzen und das Event <code>{ typ: "BestellungAufgegeben", bestellId, gesamt }</code> an <code>ereignisse</code> anhängen.</li>
      </ul>`,
    starter: `class Bestellung {
  constructor(id) {
    this.id = id;
    this.status = "offen";
    this.positionen = [];
    this.ereignisse = [];
  }

  fuegeHinzu(artikel, preis, menge) {
    // Invarianten prüfen, dann Position anhängen
  }

  gesamt() {
    return 0;
  }

  aufgeben() {
    // Invariante prüfen, Status ändern, Event festhalten
  }
}

const b = new Bestellung("B-2001");
b.fuegeHinzu("Router", 89, 2);
b.aufgeben();
console.log(b.status, b.ereignisse);
`,
    hint: `<code>if (this.status !== "offen") throw new Error("Bestellung ist bereits aufgegeben");</code> Für <code>gesamt()</code> passt <code>reduce</code> aus Modul 1.`,
    solution: `class Bestellung {
  constructor(id) {
    this.id = id;
    this.status = "offen";
    this.positionen = [];
    this.ereignisse = [];
  }

  fuegeHinzu(artikel, preis, menge) {
    if (this.status !== "offen") {
      throw new Error("Bestellung ist bereits aufgegeben");
    }
    if (menge <= 0) {
      throw new Error("Menge muss größer als 0 sein");
    }
    this.positionen.push({ artikel, preis, menge });
  }

  gesamt() {
    return this.positionen.reduce((summe, p) => summe + p.preis * p.menge, 0);
  }

  aufgeben() {
    if (this.positionen.length === 0) {
      throw new Error("Leere Bestellung kann nicht aufgegeben werden");
    }
    this.status = "aufgegeben";
    this.ereignisse.push({ typ: "BestellungAufgegeben", bestellId: this.id, gesamt: this.gesamt() });
  }
}

const b = new Bestellung("B-2001");
b.fuegeHinzu("Router", 89, 2);
b.aufgeben();
console.log(b.status, b.ereignisse);
`,
    tests: [
      ["gesamt() über zwei Positionen ergibt 134", ({ eq }) => {
        const b = new Bestellung("B-1");
        b.fuegeHinzu("Kabel", 4.5, 10);
        b.fuegeHinzu("Router", 89, 1);
        eq(b.gesamt(), 134, "gesamt()");
      }],
      ["Menge 0 wird abgelehnt", ({ eq, assert }) => {
        const b = new Bestellung("B-2");
        let f = null;
        try { b.fuegeHinzu("Kabel", 4.5, 0); } catch (e) { f = e; }
        assert(f, "fuegeHinzu mit Menge 0 sollte einen Fehler werfen");
        eq(f.message, "Menge muss größer als 0 sein", "Fehlermeldung");
        eq(b.positionen.length, 0, "Anzahl Positionen");
      }],
      ["Leere Bestellung kann nicht aufgegeben werden", ({ eq, assert }) => {
        const b = new Bestellung("B-3");
        let f = null;
        try { b.aufgeben(); } catch (e) { f = e; }
        assert(f, "aufgeben() ohne Positionen sollte einen Fehler werfen");
        eq(f.message, "Leere Bestellung kann nicht aufgegeben werden", "Fehlermeldung");
        eq(b.status, "offen", "status");
      }],
      ["aufgeben() setzt Status und erzeugt das Domain Event", ({ eq }) => {
        const b = new Bestellung("B-4");
        b.fuegeHinzu("Router", 89, 2);
        b.aufgeben();
        eq(b.status, "aufgegeben", "status");
        eq(b.ereignisse, [{ typ: "BestellungAufgegeben", bestellId: "B-4", gesamt: 178 }], "ereignisse");
      }],
      ["Nach dem Aufgeben sind keine Änderungen mehr möglich", ({ eq, assert }) => {
        const b = new Bestellung("B-5");
        b.fuegeHinzu("Router", 89, 1);
        b.aufgeben();
        let f = null;
        try { b.fuegeHinzu("Kabel", 4.5, 1); } catch (e) { f = e; }
        assert(f, "fuegeHinzu nach aufgeben() sollte einen Fehler werfen");
        eq(f.message, "Bestellung ist bereits aufgegeben", "Fehlermeldung");
      }],
    ],
  },
  {
    id: "event-storming", type: "sort", title: "Event Storming",
    theory: `
      <p><strong>Event Storming</strong> ist ein Workshop-Format von Alberto Brandolini. Fachleute und Entwickler kleben gemeinsam farbige Zettel an eine lange Wand und erzählen so den Prozess als Folge von Ereignissen. Es ist eine der schnellsten Methoden, einen komplexen Prozess und seine Grenzen zu verstehen.</p>
      <ol class="seq">
        <li><strong>Big Picture:</strong> Alle schreiben Domain Events in der Vergangenheitsform und ordnen sie auf einer Zeitachse.</li>
        <li><strong>Hot Spots</strong> markieren Unklarheiten und Konflikte, die später geklärt werden.</li>
        <li><strong>Process Level:</strong> Commands, Akteure, Policies, externe Systeme und Read Models kommen dazu.</li>
        <li><strong>Design Level:</strong> Aggregates und Bounded Contexts werden herausgearbeitet.</li>
      </ol>
      <h3>Vom Event Storming zum BPMN-Modell</h3>
      <ul>
        <li>Domain Events werden zu Ereignissen oder Meilensteinen im Prozess.</li>
        <li>Ein Command mit Akteur wird oft zum User Task, ein Command ohne Menschen zum Service Task.</li>
        <li>Policies („Immer wenn …, dann …“) werden zu Automatisierungen oder Gateways.</li>
        <li>Externe Systeme werden zu eigenen Pools mit Nachrichtenflüssen.</li>
        <li>Grenzen zwischen Gruppen von Events deuten auf Bounded Contexts hin.</li>
      </ul>`,
    task: `<p>Ein Workshop zum Bestellprozess hat diese Zettel produziert. Welche Farbe, also welche Art von Zettel, gehört zu welchem?</p>`,
    categories: [
      { id: "event", label: "Domain Event (orange)", color: "#F4A259" },
      { id: "command", label: "Command (blau)", color: "#7DB2E8" },
      { id: "actor", label: "Akteur (gelb, klein)", color: "#F6E27A" },
      { id: "policy", label: "Policy (lila)", color: "#C3A6E3" },
      { id: "external", label: "Externes System (pink)", color: "#F29CC0" },
      { id: "readmodel", label: "Read Model (grün)", color: "#9ED89A" },
      { id: "aggregate", label: "Aggregate (gelb, groß)", color: "#EBC43F" },
    ],
    items: [
      { text: "Bestellung aufgegeben", cat: "event", why: "Eine fachliche Tatsache in der Vergangenheitsform." },
      { text: "Zahlung eingegangen", cat: "event", why: "Ebenfalls ein Ereignis. Oft löst es eine Policy aus." },
      { text: "Bestellung aufgeben", cat: "command", why: "Imperativ: eine Absicht, die zu einem Event führen kann." },
      { text: "Kunde", cat: "actor", why: "Die Person, die das Command auslöst." },
      { text: "Immer wenn eine Zahlung eingegangen ist, wird der Versand beauftragt.", cat: "policy", why: "Eine Reaktionsregel. Im Prozess wird daraus eine Automatisierung." },
      { text: "Zahlungsanbieter", cat: "external", why: "Ein System außerhalb eurer Verantwortung." },
      { text: "Liste offener Zahlungen für die Buchhaltung", cat: "readmodel", why: "Informationen, die jemand braucht, um eine Entscheidung zu treffen." },
      { text: "Bestellung, die prüft, dass nach dem Aufgeben keine Positionen mehr hinzukommen", cat: "aggregate", why: "Das Objekt, das Commands annimmt und seine Regeln schützt." },
      { text: "Versand beauftragen", cat: "command", why: "Imperativ. Hier wird es von der Policy ausgelöst, nicht von einem Menschen." },
    ],
  },
  {
    id: "clean-architecture", type: "sort", title: "Clean Architecture",
    theory: `
      <p><strong>Clean Architecture</strong> (Robert C. Martin), <strong>Hexagonal Architecture</strong> (Ports &amp; Adapters) und <strong>Onion Architecture</strong> teilen eine Idee: Die Fachlogik steht im Zentrum und hängt von nichts Technischem ab. Abhängigkeiten zeigen immer nach innen.</p>
      <div class="rings" role="img" aria-label="Vier verschachtelte Schichten, von außen nach innen: Frameworks und Treiber, Adapter, Use Cases, Domäne">
        <div class="ring r4"><span>Frameworks &amp; Treiber: Spring, Kafka, Datenbank, Camunda-Client</span>
          <div class="ring r3"><span>Adapter: REST-Controller, Job Worker, Repository-Implementierungen</span>
            <div class="ring r2"><span>Use Cases: Anwendungsfälle und die Ports (Interfaces), die sie brauchen</span>
              <div class="ring r1"><span>Domäne: Entities, Value Objects, Geschäftsregeln</span></div>
            </div>
          </div>
        </div>
      </div>
      <p>Für Camunda heißt das: Ein Job Worker ist ein <strong>Adapter</strong>. Er übersetzt Job-Variablen in den Aufruf eines Use Cases und das Ergebnis zurück in <code>complete</code> oder einen BPMN-Fehler. Die Fachlogik gehört nicht in den Worker, sonst ist sie an Camunda gebunden und schwer zu testen.</p>
      ${pre(`
// Adapter: kennt Camunda
@JobWorker(type = "bonitaet-pruefen")
public Map<String, Object> pruefe(@Variable String kundeId) {
  Entscheidung e = bonitaetPruefen.ausfuehren(new KundeId(kundeId));
  return Map.of("genehmigt", e.genehmigt());
}

// Use Case: kennt weder Camunda noch HTTP
public class BonitaetPruefen {
  private final KundenPort kunden;   // Port: ein Interface, außen implementiert
  // ...
}
`)}`,
    task: `<p>In welche Schicht gehört jeder Baustein?</p>`,
    categories: [
      { id: "domain", label: "Domäne" },
      { id: "usecase", label: "Use Cases" },
      { id: "adapter", label: "Adapter" },
      { id: "framework", label: "Frameworks & Treiber" },
    ],
    items: [
      { text: "Klasse <code>Bestellung</code> mit der Regel „nach dem Aufgeben keine Änderungen mehr“", cat: "domain", why: "Reine Geschäftsregel ohne Technik." },
      { text: "Value Object <code>Geldbetrag</code>, das keine negativen Beträge zulässt", cat: "domain", why: "Fachliches Konzept mit eigener Regel." },
      { text: "Anwendungsfall „Bestellung aufgeben“: lädt die Bestellung, ruft <code>aufgeben()</code>, speichert, gibt die Events weiter", cat: "usecase", why: "Koordiniert Domänenobjekte für einen konkreten Anwendungsfall." },
      { text: "Job Worker, der Job-Variablen in einen Use-Case-Aufruf übersetzt", cat: "adapter", why: "Übersetzt zwischen Camunda und der Anwendung." },
      { text: "REST-Controller, der JSON in einen Befehl übersetzt", cat: "adapter", why: "Übersetzt zwischen HTTP und der Anwendung." },
      { text: "Kafka-Broker, PostgreSQL und das Spring Framework selbst", cat: "framework", why: "Technische Details ganz außen, austauschbar." },
    ],
  },
  {
    id: "enterprise-architektur", type: "quiz", title: "Enterprise- & Integrationsarchitektur",
    theory: `
      <p>Als Architekt in der Prozessautomatisierung blickst du über einzelne Services hinaus auf die ganze Landschaft: Welche Systeme gibt es? Welches ist führend für welche Daten? Wie sind sie verbunden? Wo läuft die Prozesslogik?</p>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Werkzeug</th><th>Zweck</th></tr></thead>
        <tbody>
          <tr><td>C4-Modell</td><td>Architektur in vier Zoomstufen: System Context, Container, Component, Code</td></tr>
          <tr><td>arc42</td><td>Gliederungsvorlage für Architekturdokumentation</td></tr>
          <tr><td>ADR</td><td>Architecture Decision Record: eine Entscheidung mit Kontext und Konsequenzen</td></tr>
          <tr><td>Qualitätsszenarien</td><td>messbare Anforderungen an Verfügbarkeit, Performance, Sicherheit usw. (ISO 25010)</td></tr>
        </tbody>
      </table></div>
      <h3>Integrationsarchitektur</h3>
      <p>Punkt-zu-Punkt-Verbindungen wachsen quadratisch: Bei <em>n</em> Systemen sind es bis zu <em>n(n−1)/2</em>. Gegenmittel sind API-Management bzw. ein API-Gateway für synchrone Aufrufe, ein Event-Backbone wie Kafka für asynchrone und eine Orchestrierungsschicht für Abläufe.</p>
      ${pre(`
Portale und Fachanwendungen
        │ REST
Camunda: Orchestrierung (BPMN, DMN, Tasklist, Operate)
        │ Jobs, Connectors                  ▲ Nachrichten
Domain-Services (Spring Boot)  ── Events ──  Kafka
        │
Kernsysteme: ERP, CRM, DMS
`)}
      <h3>Ein ADR in Kurzform</h3>
      ${pre(`
# ADR-007: Orchestrierung des Bestellprozesses mit Camunda 8
Status:       angenommen
Kontext:      Bestellungen durchlaufen 6 Systeme, mit Fristen und manuellen Freigaben.
Entscheidung: Ein BPMN-Prozess orchestriert, die Services bleiben fachlich autonom.
Konsequenzen: + Transparenz pro Bestellung in Operate
              − Camunda wird zur kritischen Komponente (Hochverfügbarkeit nötig)
`)}`,
    questions: [
      { q: `Wozu dient ein Architecture Decision Record?`, options: ["Eine Entscheidung mit Kontext, Alternativen und Konsequenzen nachvollziehbar festhalten", "Code dokumentieren", "Server inventarisieren"], correct: 0,
        explain: `In zwei Jahren fragt jemand „Warum habt ihr das so gemacht?“. Das ADR beantwortet es.` },
      { q: `Du willst zeigen, dass das System aus Camunda, drei Spring-Boot-Services, Kafka und einer Datenbank besteht. Welche C4-Ebene?`, options: ["System Context", "Container", "Code"], correct: 1,
        explain: `Container sind separat laufende Einheiten: Anwendungen, Datenbanken, Broker. Der System Context zeigt nur das System als Ganzes mit Nutzern und Nachbarsystemen.` },
      { q: `8 Systeme sind paarweise Punkt-zu-Punkt verbunden. Wie viele Verbindungen sind es im schlimmsten Fall?`, options: ["8", "28", "64"], correct: 1,
        explain: `8 · 7 / 2 = 28. Jede davon will gepflegt, überwacht und versioniert werden.` },
      { q: `Welche Aussage zur Rolle von Camunda trifft zu?`, options: ["Camunda ersetzt die Fachsysteme", "Camunda orchestriert den Ablauf, Fachlogik und Daten bleiben in Services und Kernsystemen", "Camunda ist ein Message Broker wie Kafka"], correct: 1,
        explain: `Die Engine weiß, was als Nächstes passiert und wer zuständig ist. Die Stammdaten gehören weiterhin ERP und CRM.` },
      { q: `Welche Qualitätsanforderung ist prüfbar?`, options: ["„Das System soll schnell sein.“", "„Unter Normallast erscheinen 95 % der User Tasks innerhalb von 2 Sekunden in der Tasklist.“", "„So schnell wie möglich.“"], correct: 1,
        explain: `Messbar heißt: Last, Wert und Perzentil sind angegeben. Erst dann kann man es testen.` },
    ],
  },
  ],
},
{
  id: "m8", title: "Anforderungen & Zusammenarbeit", sub: "Requirements Engineering mit Fachbereichen",
  lessons: [
  {
    id: "anforderungsarten", type: "sort", title: "Anforderungen einordnen",
    theory: `
      <p class="story"><b>NordPaket GmbH —</b> Bevor du weiterbaust, setzt du dich mit dem Fachbereich zusammen und übersetzt, was sie wirklich brauchen, in das, was du als Nächstes modellierst.</p>
      <p><strong>Requirements Engineering</strong> heißt: Anforderungen ermitteln, dokumentieren, prüfen und über die Zeit verwalten. Der Lehrplan des IREB (CPRE) unterscheidet drei Arten:</p>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Art</th><th>Frage</th><th>Beispiel</th></tr></thead>
        <tbody>
          <tr><td>Funktionale Anforderung</td><td>Was soll das System tun?</td><td>Es berechnet den Rabatt.</td></tr>
          <tr><td>Qualitätsanforderung</td><td>Wie gut soll es das tun?</td><td>Antwort in unter 2 Sekunden.</td></tr>
          <tr><td>Randbedingung</td><td>Was ist vorgegeben und nicht verhandelbar?</td><td>Betrieb im EU-Rechenzentrum.</td></tr>
        </tbody>
      </table></div>
      <h3>Gute Anforderungen sind …</h3>
      <ul>
        <li><strong>eindeutig:</strong> nur eine Lesart möglich</li>
        <li><strong>prüfbar:</strong> ein Test kann zeigen, ob sie erfüllt ist</li>
        <li><strong>notwendig:</strong> jemand braucht sie wirklich, und die Quelle ist bekannt</li>
        <li><strong>realisierbar:</strong> technisch und wirtschaftlich machbar</li>
      </ul>
      <p>Qualitätsanforderungen werden in Automatisierungsprojekten oft vergessen: Wie viele Instanzen pro Tag? Wie lange müssen Daten aufbewahrt werden? Was passiert, wenn ein Kernsystem ausfällt?</p>`,
    task: `<p>Ordne jede Anforderung aus einem Lastenheft ihrer Art zu.</p>`,
    categories: [
      { id: "func", label: "Funktionale Anforderung" },
      { id: "quality", label: "Qualitätsanforderung" },
      { id: "constraint", label: "Randbedingung" },
    ],
    items: [
      { text: "Bestellungen über 1.000 € müssen von einer Führungskraft freigegeben werden.", cat: "func", why: "Beschreibt ein Verhalten des Prozesses." },
      { text: "Sachbearbeiter können einen abgelehnten Antrag mit Begründung erneut einreichen.", cat: "func", why: "Eine Funktion, die das System anbieten muss." },
      { text: "Das System erreicht während der Geschäftszeiten 99,5 % Verfügbarkeit.", cat: "quality", why: "Beschreibt, wie zuverlässig das System arbeiten muss." },
      { text: "Eine neue Freigabeaufgabe erscheint spätestens 2 Sekunden nach Einreichen in der Tasklist.", cat: "quality", why: "Eine messbare Performance-Anforderung." },
      { text: "Die Lösung läuft auf Camunda 8 SaaS in der EU-Region.", cat: "constraint", why: "Eine Vorgabe zur Technologie und zum Betriebsort." },
      { text: "Schnittstellen zu SAP laufen ausschließlich über die bestehende API-Plattform des Konzerns.", cat: "constraint", why: "Eine Architekturvorgabe, die den Lösungsraum einschränkt." },
    ],
  },
  {
    id: "user-stories", type: "quiz", title: "User Stories & Akzeptanzkriterien",
    theory: `
      <p>In agilen Teams werden Anforderungen oft als <strong>User Stories</strong> formuliert. Sie beschreiben ein Ziel aus Sicht einer Rolle, nicht die Lösung:</p>
      ${pre(`
Als Einkaufsleitung möchte ich Bestellungen über 5.000 € freigeben,
damit keine ungeprüften Großaufträge an Lieferanten gehen.
`)}
      <p>Gute Stories erfüllen <strong>INVEST</strong>: Independent, Negotiable, Valuable, Estimable, Small, Testable. Prüfbar werden sie durch <strong>Akzeptanzkriterien</strong>, am besten als Szenarien im Given-When-Then-Format:</p>
      ${pre(`
Szenario: Freigabe erforderlich
  Angenommen eine Bestellung über 7.500 €
  Wenn die Bestellung eingereicht wird
  Dann erscheint eine Freigabeaufgabe für die Rolle "Einkaufsleitung"

Szenario: Keine Freigabe nötig
  Angenommen eine Bestellung über 800 €
  Wenn die Bestellung eingereicht wird
  Dann wird sie ohne Freigabe an den Lieferanten übermittelt
`)}
      <p>Jeder Pfad durch das BPMN-Modell ist ein Szenario und damit ein automatisierter Prozesstest. Große Stories schneidest du deshalb gut entlang von Prozesspfaden.</p>`,
    questions: [
      { q: `Welches Akzeptanzkriterium ist am besten prüfbar?`, options: ["„Die Freigabe soll benutzerfreundlich sein.“", "„Angenommen eine Bestellung über 7.500 €, wenn sie eingereicht wird, dann erscheint eine Freigabeaufgabe für die Einkaufsleitung.“", "„Das System soll Freigaben korrekt behandeln.“"], correct: 1,
        explain: `Ausgangslage, Auslöser und erwartetes Ergebnis sind konkret. Daraus lässt sich direkt ein Test schreiben.` },
      { q: `Die Story „Bestellprozess automatisieren“ ist zu groß. Wie schneidest du sinnvoll?`, options: ["Nach technischen Schichten: erst Datenbank, dann Backend, dann UI", "Entlang von Prozesspfaden: erst der Weg ohne Freigabe, dann mit Freigabe, dann die Ablehnung", "Gar nicht"], correct: 1,
        explain: `Jeder Schnitt liefert dann etwas Nutzbares, und der Fachbereich kann früh Feedback geben.` },
      { q: `Wofür steht das I in INVEST?`, options: ["Independent (unabhängig)", "Integriert", "Iterativ"], correct: 0,
        explain: `Stories sollen möglichst ohne Abhängigkeiten zueinander umsetzbar und planbar sein.` },
      { q: `Der Fachbereich sagt: „Bei Ablehnung soll irgendwie der Kunde informiert werden.“ Was tust du?`, options: ["So umsetzen, wie es dir sinnvoll erscheint", "Konkretisieren: Wer informiert, über welchen Kanal, mit welchem Inhalt, in welcher Frist?", "Ignorieren, bis es jemand einfordert"], correct: 1,
        explain: `„Irgendwie“ ist ein Signal für eine unvollständige Anforderung. Eine Antwort auf diese vier Fragen ergibt ein prüfbares Kriterium.` },
    ],
  },
  {
    id: "fachbereich", type: "quiz", title: "Mit Fachbereich & Stakeholdern arbeiten",
    theory: `
      <p>Automatisierung scheitert selten an der Technik und oft am gemeinsamen Verständnis. Deine Aufgabe ist es, zwischen Fachbereich und IT zu übersetzen.</p>
      <h3>Stakeholder finden und einordnen</h3>
      <p>Denk über den Fachbereich hinaus: Process Owner, Sachbearbeitung, IT-Betrieb, Informationssicherheit, Datenschutz, Betriebsrat, Revision, externe Partner. Eine <strong>Stakeholder-Matrix</strong> nach Einfluss und Interesse zeigt, wen du eng einbindest und wen du informierst.</p>
      <h3>Ermittlungstechniken</h3>
      <div class="table-wrap"><table class="t">
        <thead><tr><th>Technik</th><th>Stark bei</th></tr></thead>
        <tbody>
          <tr><td>Interview</td><td>Detailwissen einzelner Personen, heikle Themen</td></tr>
          <tr><td>Workshop</td><td>gemeinsames Bild, Konflikte früh sichtbar machen</td></tr>
          <tr><td>Beobachtung</td><td>implizites Wissen: was Menschen tun, nicht was sie sagen</td></tr>
          <tr><td>Dokumenten- und Datenanalyse</td><td>Häufigkeiten, Ausnahmen, Durchlaufzeiten (Process Mining)</td></tr>
          <tr><td>Prototyp, Modell-Walkthrough</td><td>Missverständnisse aufdecken, bevor gebaut wird</td></tr>
        </tbody>
      </table></div>
      <h3>Die richtige Flughöhe</h3>
      <p>Dasselbe Thema braucht verschiedene Modelle: eine <strong>strategische</strong> Übersicht mit wenigen Schritten fürs Management, ein <strong>operatives</strong> Modell für den Fachbereich und ein <strong>technisch ausführbares</strong> für die Engine. Ein sauber modelliertes Camunda-Diagramm kann oft beides sein, operativ lesbar und ausführbar.</p>
      <h3>Gesprächstechniken</h3>
      <ul>
        <li>Sprich die Sprache des Fachbereichs, nicht „Job“, „Payload“ und „Retry“.</li>
        <li>Spiegle zurück: „Habe ich richtig verstanden, dass …?“</li>
        <li>Frag nach konkreten Fällen statt nach Regeln: „Erzählen Sie mir vom letzten Mal, als …“</li>
        <li>Mach Konflikte transparent, entscheiden muss der Process Owner.</li>
      </ul>`,
    questions: [
      { q: `Eine Sachbearbeiterin sagt: „Das machen wir immer so.“ In den Systemdaten siehst du aber viele Ausnahmen. Was ist sinnvoll?`, options: ["Das Interview gilt, die Ausnahmen ignorieren", "Mit Daten und Beobachtung ergänzen und die Ausnahmen gezielt nachfragen", "Nur die Systemdaten modellieren"], correct: 1,
        explain: `Menschen beschreiben den Normalfall. Die Daten zeigen, wie oft es anders läuft. Beides zusammen ergibt das echte Bild.` },
      { q: `Zwei Abteilungsleitungen haben widersprüchliche Anforderungen an den Freigabeprozess. Wer entscheidet?`, options: ["Du als Entwickler", "Der Process Owner bzw. wer die Entscheidungsbefugnis hat. Du machst die Konsequenzen transparent.", "Die Abteilung, die zuerst gefragt hat"], correct: 1,
        explain: `Deine Rolle ist, Optionen und Folgen klar zu machen, zum Beispiel als zwei Modellvarianten.` },
      { q: `Welches Modell zeigst du dem Vorstand?`, options: ["Das ausführbare Modell mit allen technischen Details", "Eine strategische Übersicht mit wenigen Schritten und den wichtigsten Ergebnissen", "Den Java-Code"], correct: 1,
        explain: `Die Flughöhe folgt dem Publikum. Details verdecken die Botschaft.` },
      { q: `Wie prüfst du am Ende eines Workshops, ob du den Prozess richtig verstanden hast?`, options: ["Modell gemeinsam durchgehen, konkrete Fälle durchspielen und zurückspiegeln", "Protokoll per Mail schicken und auf Einwände warten", "Gar nicht, das zeigt sich im Test"], correct: 0,
        explain: `Einen konkreten Fall mit dem Finger durchs Modell zu verfolgen, deckt Lücken sofort auf. Das ist Token-Simulation auf Papier.` },
      { q: `Ein Prozess verarbeitet personenbezogene Daten und macht Bearbeitungszeiten einzelner Mitarbeitender sichtbar. Wen bindest du früh ein?`, options: ["Nur die IT", "Datenschutz und den Betriebsrat", "Niemanden zusätzlich"], correct: 1,
        explain: `Leistungs- und Verhaltenskontrolle ist in Deutschland mitbestimmungspflichtig. Spät eingebunden, stoppt das Thema oft ein fertiges Projekt.` },
    ],
  },
  {
    id: "abschluss-check", type: "quiz", title: "Abschluss-Check: Anforderungsprofil",
    theory: `<p>Sechs Fragen, wie sie in einem Fachgespräch kommen könnten. Jede verbindet mehrere Themen aus deinem Lernpfad.</p>`,
    questions: [
      { q: `Ein Worker ruft ein Altsystem auf, das bei gesperrten Kunden HTTP 422 mit dem Code <code>KUNDE_GESPERRT</code> liefert. Wie gehst du vor?`, options: ["<code>job.fail</code> mit Retries", "Einen BPMN-Fehler <code>KUNDE_GESPERRT</code> werfen und im Modell ein Error Boundary Event mit Ausnahmepfad vorsehen", "Den Fehler loggen und <code>complete</code> aufrufen"], correct: 1,
        explain: `Fachlicher Fehler, fachliche Behandlung im Modell. Ein Retry würde am gesperrten Kunden nichts ändern.` },
      { q: `Der Vertrieb ändert die Rabattlogik jeden Monat. Wo gehört sie hin?`, options: ["In den Java-Service", "In eine DMN-Tabelle, aufgerufen über einen Business Rule Task", "Als Bedingungen an zwölf Gateways"], correct: 1,
        explain: `Die Regel bleibt für den Fachbereich lesbar und lässt sich ohne Code-Release anpassen.` },
      { q: `Zahlungen kommen über Kafka und sollen die richtige Bestellinstanz fortsetzen. Welche Lösung passt?`, options: ["Ein Consumer ruft <code>publishMessage</code> mit correlationKey = Bestellnummer und messageId = Event-ID auf, im Modell wartet ein Nachrichten-Ereignis", "Der Prozess fragt alle 5 Sekunden Kafka ab", "Der Consumer startet für jede Zahlung eine neue Instanz"], correct: 0,
        explain: `Korrelation über den fachlichen Schlüssel und Idempotenz über die Event-ID.` },
      { q: `Wie hältst du Job Worker testbar und unabhängig von Camunda?`, options: ["Die Fachlogik liegt in Use Cases und Domänenklassen, der Worker ist ein dünner Adapter", "Alle Logik in den Worker-Handler", "Die Logik in Script Tasks im Modell"], correct: 0,
        explain: `Dann testest du die Logik mit einfachen Unit-Tests und den Worker nur auf korrekte Übersetzung.` },
      { q: `Jemand fragt: „Warum nicht einfach Choreografie mit Events für den ganzen Bestellprozess?“`, options: ["Choreografie ist immer schlechter", "Bei vielen Schritten mit Fristen, Kompensation und Monitoring bringt Orchestrierung Transparenz und eine Stelle für Änderungen. Zwischen den Kontexten bleiben Events sinnvoll.", "Weil Camunda keine Events verarbeiten kann"], correct: 1,
        explain: `Eine gute Antwort wägt ab und kombiniert beide Muster, statt sich dogmatisch festzulegen.` },
      { q: `Im Event-Storming-Workshop taucht eine Frage auf, die niemand im Raum beantworten kann. Was tust du?`, options: ["So lange diskutieren, bis jemand eine Antwort hat", "Als Hot Spot markieren und mit einer verantwortlichen Person nachverfolgen", "Ignorieren"], correct: 1,
        explain: `Hot Spots halten den Fluss des Workshops am Laufen, ohne das Problem zu verlieren.` },
    ],
  },
  {
    id: "naechste-schritte", type: "info", title: "Raus in die echte Welt",
    theory: `
      <p class="story"><b>NordPaket GmbH —</b> Der Bestellprozess, den du hier Schritt für Schritt gebaut hast, ist bereit für eine echte Engine. Zeit, ihn dort laufen zu lassen.</p>
      <p>Du kennst jetzt die Bausteine von BPMN, DMN und FEEL, schreibst Worker in JavaScript und liest sie in Java, verstehst Messaging und Event-Driven Architecture und kannst Architekturentscheidungen begründen. Der nächste Schritt ist ein echtes System gegen eine echte Engine.</p>
      <ol class="seq">
        <li><strong>Node.js installieren.</strong> Die aktuelle LTS-Version von <a href="https://nodejs.org" target="_blank" rel="noopener">nodejs.org</a>.</li>
        <li><strong>Camunda 8 starten.</strong> Lokal mit <em>Camunda 8 Run</em> oder als kostenlose SaaS-Trial. Beides beschreibt die <a href="https://docs.camunda.io" target="_blank" rel="noopener">Camunda-Doku</a> unter „Get started“.</li>
        <li><strong>Prozess modellieren.</strong> Im Camunda Modeler (Desktop) oder Web Modeler einen Service Task anlegen, unter „Task definition“ den Typ <code>rechnung-berechnen</code> eintragen und deployen.</li>
        <li><strong>Projekt anlegen.</strong>
          ${pre(`
mkdir mein-worker && cd mein-worker
npm init -y
npm install @camunda8/sdk
`)}</li>
        <li><strong>Verbindung konfigurieren.</strong> Das SDK liest Adresse und Zugangsdaten aus Umgebungsvariablen. Welche du brauchst, zeigt dir Camunda beim Anlegen eines API-Clients in der Console, für Camunda 8 Run steht es in dessen Doku.</li>
        <li><strong>Worker starten.</strong> Den Code aus „Dein erster Worker“ mit dem SDK-Setup aus „So arbeitet ein Job Worker“ in <code>worker.js</code> speichern, <code>node worker.js</code> ausführen, eine Prozessinstanz starten und in Operate zusehen, wie der Token durchläuft.</li>
      </ol>
      <h3>Dasselbe mit Spring Boot</h3>
      <p>Für den Java-Weg erzeugst du ein Projekt auf <a href="https://start.spring.io" target="_blank" rel="noopener">start.spring.io</a> und fügst den Spring-Boot-Starter von Camunda hinzu (Artefaktname und Version stehen in der Camunda-Doku). Den Worker aus „Job Worker mit Spring Boot“ kannst du fast unverändert übernehmen.</p>
      <h3>Übungsideen für danach</h3>
      <ul>
        <li>Baue den Bestellprozess aus dem Gateway-Simulator nach, mit User Task für die Manager-Freigabe.</li>
        <li>Hänge ein Error Boundary Event mit Code <code>BONITAET_ABGELEHNT</code> an den Bonitäts-Task und modelliere eine Absage-Mail.</li>
        <li>Lagere die Rabattregeln in eine echte DMN-Tabelle aus und rufe sie über einen Business Rule Task auf.</li>
        <li><strong>Portfolio-Projekt für die Bewerbung:</strong> ein Bestellprozess mit Spring-Boot-Workern in Clean Architecture, Zahlungseingang über Kafka mit Nachrichtenkorrelation, einer DMN-Tabelle, einer Saga mit Kompensation und zwei, drei ADRs. Damit deckst du fast jede Zeile deines Anforderungsprofils ab.</li>
      </ul>
      <h3>Weiterlernen</h3>
      <ul>
        <li><a href="https://docs.camunda.io" target="_blank" rel="noopener">docs.camunda.io</a>: offizielle Dokumentation</li>
        <li><a href="https://academy.camunda.com" target="_blank" rel="noopener">Camunda Academy</a>: kostenlose Kurse</li>
        <li><a href="https://github.com/camunda/camunda-8-js-sdk" target="_blank" rel="noopener">camunda-8-js-sdk</a>: Quellcode und Beispiele des Node.js-SDK</li>
      </ul>`,
  },
  ],
},
];

const LESSONS = [];
MODULES.forEach((m, mi) => m.lessons.forEach((l) => { l.module = m; l.moduleNr = mi + 1; l.index = LESSONS.length; LESSONS.push(l); }));
const byId = (id) => LESSONS.find((l) => l.id === id);
const TYPE_LABEL = { code: "Code-Übung", fill: "Lückentext", quiz: "Quiz", sort: "Zuordnen", info: "Wissen" };
const TYPE_SHAPE = { code: "task", fill: "task", quiz: "gw", sort: "gw", info: "ev2" };

/* Anforderungsprofil: jede Anforderung mit den Schritten, die sie abdecken */
const PROFILE = [
  { text: "Sehr gute Kenntnisse in BPMN 2.0 sowie idealerweise DMN und FEEL",
    lessons: ["bpmn", "gateways", "ereignisse", "subprozesse", "feel", "dmn", "dmn-vertieft"] },
  { text: "Erfahrung in der Analyse und Modellierung komplexer Geschäftsprozesse",
    lessons: ["prozessanalyse", "ereignisse", "subprozesse", "event-storming", "fachbereich"] },
  { text: "Erfahrung in der Konzeption von Enterprise- und Integrationsarchitekturen",
    lessons: ["orchestrierung", "integrationsmuster", "saga-outbox", "enterprise-architektur"] },
  { text: "Gute Kenntnisse moderner Java-basierter Anwendungsarchitekturen sowie Erfahrung mit Spring Boot",
    lessons: ["java-basics", "java-luecken", "spring-di", "spring-rest", "spring-worker", "clean-architecture"] },
  { text: "Erfahrung mit REST-APIs, Messaging-Systemen und Event-Driven Architectures",
    lessons: ["async", "rest-design", "rest-worker", "messaging", "idempotenz", "korrelation"] },
  { text: "Verständnis von Microservice-Architekturen und verteilten Systemlandschaften sowie DDD, Event Storming oder Clean Architecture",
    lessons: ["microservices", "resilienz", "ddd", "aggregate", "event-storming", "clean-architecture"] },
  { text: "Erfahrung im Requirements Engineering sowie in der Zusammenarbeit mit Fachbereichen und Stakeholdern",
    lessons: ["anforderungsarten", "user-stories", "fachbereich", "prozessanalyse"] },
  { text: "Fundament: Programmieren und Job Worker (Voraussetzung für alles andere)",
    lessons: ["variablen", "bedingungen", "schleifen", "array-methoden", "json", "mapping", "worker-konzept", "erster-worker", "fehler"] },
];

/* JS-Spickzettel: Nachschlagen statt neu erklären, Beispiele wie in den Lektionen.
   Jeder Eintrag nennt zusätzlich die Stolperfalle, auf die Einsteiger typischerweise
   laufen, und verlinkt die Lektion, die das Konstrukt zuerst einführt. */
const SPICKZETTEL = [
  { title: "Werte & Variablen", items: [
    { term: "const / let", lesson: "variablen",
      note: `<code>const</code> verhindert nur, dass die <strong>Variable neu zugewiesen</strong> wird. Bei Objekten und Arrays darf der <strong>Inhalt</strong> trotzdem verändert werden – <code>const</code> macht den Wert nicht unveränderlich, nur den Namen fest.`,
      code: `const kunde = { name: "Erika" };
kunde.name = "Max";     // erlaubt: der Inhalt ändert sich
kunde = {};              // Fehler: die Variable selbst nicht

let versuche = 0;        // darf sich ändern
versuche = versuche + 1;`,
      pitfall: `Häufiger Fehler: <code>const positionen = [];</code> und danach <code>positionen.push(...)</code> wirkt wie eine Änderung der Konstante, ist aber nur eine Änderung des Array-<em>Inhalts</em>. Das Array selbst bleibt dasselbe. Erst <code>positionen = [...]</code> (komplette Neuzuweisung) wäre ein Fehler.` },
    { term: "=== / !== / && / || / !", lesson: "bedingungen",
      note: `<code>===</code> vergleicht Wert <strong>und</strong> Typ, <code>==</code> rechnet die Typen vorher ineinander um und liefert dadurch überraschende Ergebnisse. <code>&&</code>/<code>||</code> werten nur so viel aus wie nötig (Kurzschlussauswertung) und geben nicht unbedingt <code>true</code>/<code>false</code> zurück, sondern einen der beiden Operanden.`,
      code: `"5" === 5             // false, Text ist keine Zahl
"5" == 5              // true, == wandelt den Typ um – deshalb === bevorzugen
betrag > 1000 && !kunde.vip
kunde.name || "Unbekannt"   // liefert "Unbekannt" nur, wenn kunde.name leer/undefined/null ist
!istGesperrt`,
      pitfall: `<code>betrag &gt; 1000 && !kunde.vip</code> ist dieselbe Bedingung, die du als FEEL-Ausdruck <code>betrag &gt; 1000 and not(kunde.vip)</code> im Prozessmodell schreibst (Modul 3). <code>||</code> als "Standardwert"-Trick schlägt fehl, wenn der echte Wert <code>0</code> oder <code>""</code> ist – dafür gibt es <code>??</code> (siehe unten).` },
    { term: "Ternärer Operator ?:", lesson: "bedingungen",
      note: `Kurzform für <code>if/else</code>, die direkt einen Wert liefert – nützlich für eine Zuweisung, aber keine Zeile für ganze Programmlogik.`,
      code: `const status = alter >= 18 ? "volljährig" : "minderjährig";`,
      pitfall: `Verschachtelte Ternarys (<code>a ? b : c ? d : e</code>) sind schwer zu lesen. Ab zwei Bedingungen ist ein normales <code>if/else</code> fast immer die bessere Wahl.` },
    { term: "typeof", lesson: "variablen",
      note: `Liefert den Datentyp als Text, z. B. zur Validierung von Werten, die aus <code>job.variables</code> oder einer API-Antwort kommen und nicht garantiert den erwarteten Typ haben.`,
      code: `typeof "Erika"      // "string"
typeof 42            // "number"
typeof true          // "boolean"
typeof undefined     // "undefined"
typeof { a: 1 }      // "object"
typeof [1, 2, 3]      // "object" – Arrays sind für typeof auch nur Objekte` },
  ] },
  { title: "Funktionen", items: [
    { term: "function / Pfeilfunktion", lesson: "bedingungen",
      note: `Zwei Schreibweisen für dasselbe. Pfeilfunktionen sind kurz, bei einer Ausdruck-Zeile ohne <code>return</code>/<code>{}</code> möglich – und binden <strong>kein eigenes <code>this</code></strong>, sie übernehmen es aus der Umgebung, in der sie stehen.`,
      code: `function verdoppeln(x) { return x * 2; }
const verdoppeln2 = (x) => x * 2;

// mehrzeilig braucht es { } und ein explizites return:
const verarbeite = (x) => {
  const y = x * 2;
  return y + 1;
};`,
      pitfall: `In einer Klassenmethode als Callback verwendet (z. B. an <code>array.map(...)</code> übergeben), behält eine Pfeilfunktion das <code>this</code> der Instanz. Eine normale <code>function</code> würde dort ein eigenes, meist <code>undefined</code>es <code>this</code> bekommen – ein klassischer Fehler bei Klassenmethoden (siehe unten).` },
  ] },
  { title: "Daten umformen", items: [
    { term: "Destructuring", lesson: "mapping",
      note: `Werte gezielt aus einem Objekt oder Array herausziehen, statt sie einzeln über den Namen anzusprechen. Funktioniert verschachtelt, mit Umbenennen und mit Standardwerten.`,
      code: `const { id, firstName, lastName, rating } = antwort.data.customer;
const [erster, zweiter] = liste;
const { name: kundenname } = kunde;        // umbenennen
const { rabatt = 0 } = optionen;           // Standardwert, falls rabatt fehlt`,
      pitfall: `<code>const { name } = kunde;</code> wirft einen Fehler, wenn <code>kunde</code> selbst <code>undefined</code> ist – nicht nur, wenn <code>name</code> fehlt. Bei Daten, die aus einer API kommen, lohnt sich <code>?.</code> davor oder eine Prüfung, dass das Objekt überhaupt existiert.` },
    { term: "Template-Literal `...`", lesson: "mapping",
      note: `Text mit eingesetzten Werten, über Backticks (<code>\`</code>) und <code>\${...}</code> statt <code>+</code>-Verkettung. In <code>\${...}</code> darf ein beliebiger Ausdruck stehen, nicht nur eine Variable – und der String darf über mehrere Zeilen gehen.`,
      code: `const text = \`Hallo \${name}, du hast \${anzahl} Artikel\`;
const fehler = \`Kunde \${id} nicht gefunden\`;        // häufig in throw new Error(...)
const summe = \`Gesamt: \${(preis * menge).toFixed(2)} €\`;  // Ausdruck statt nur Variable`,
      pitfall: `Backticks lassen sich nicht ineinander verschachteln, ohne die äußeren zu schließen. Für den Normalfall (Text + Wert) reicht trotzdem fast immer ein einfacher <code>\${wert}</code>-Einschub.` },
    { term: "Optional Chaining ?. / Nullish Coalescing ??", lesson: "json",
      note: `<code>?.</code> bricht die Kette ab und liefert <code>undefined</code>, statt bei fehlendem Zwischenwert abzustürzen. <code>??</code> liefert nur dann einen Ersatzwert, wenn links wirklich <code>null</code> oder <code>undefined</code> steht – anders als <code>||</code>, das auch bei <code>0</code>, <code>""</code> oder <code>false</code> ersetzt.`,
      code: `kunde.adresse?.stadt                    // undefined statt Absturz, wenn adresse fehlt
kunde.adresse?.stadt ?? "unbekannt"     // Ersatzwert nur bei null/undefined
kunde.rabatt ?? 0                        // liefert 0 nur, wenn rabatt fehlt – nicht wenn rabatt = 0 ist
berechneSumme?.(positionen)              // optionaler Funktionsaufruf, falls berechneSumme existiert`,
      pitfall: `<code>kunde.rabatt || 0</code> sieht nach demselben Ergebnis aus wie <code>?? 0</code> – bis <code>rabatt</code> wirklich <code>0</code> ist. Dann liefert <code>||</code> fälschlich wieder <code>0</code> durch Ersatz statt den echten (richtigen) Wert <code>0</code> unverändert durchzulassen. Bei Zahlen, die auch <code>0</code> sein dürfen, immer <code>??</code> statt <code>||</code>.` },
    { term: "JSON.parse / JSON.stringify", lesson: "json",
      note: `Wandelt JSON-Text in ein JavaScript-Objekt um und zurück. Prozess-Engines wie Camunda speichern Prozessvariablen als JSON – <code>undefined</code>, Funktionen und Datumsobjekte überleben die Umwandlung nicht unverändert.`,
      code: `const daten = JSON.parse(text);           // Text → Objekt, wirft bei kaputtem JSON einen Fehler
const text2 = JSON.stringify(daten);      // Objekt → Text
const lesbar = JSON.stringify(daten, null, 2);  // mit Einrückung, gut zum Debuggen`,
      pitfall: `<code>JSON.parse</code> wirft bei ungültigem Text eine <code>SyntaxError</code>-Ausnahme – wer Daten aus einer externen Quelle parst, sollte das in <code>try/catch</code> einpacken, statt den Worker abstürzen zu lassen.` },
  ] },
  { title: "Listen durchgehen", items: [
    { term: "for...of", lesson: "schleifen",
      note: `Geht jedes Element eines Arrays der Reihe nach durch. Im Unterschied zu <code>for...in</code> (das über die <strong>Indizes</strong> läuft) liefert <code>for...of</code> direkt die <strong>Werte</strong> – und <code>break</code>/<code>continue</code> funktionieren darin, anders als in <code>forEach</code> oder den Array-Methoden unten.`,
      code: `for (const position of positionen) {
  summe = summe + position.preis;
}

for (const position of positionen) {
  if (position.preis > 1000) break;   // in forEach/map nicht möglich
}`,
      pitfall: `Soll die Schleife vorzeitig abbrechen können (<code>break</code>) oder einen Schritt überspringen (<code>continue</code>), brauchst du <code>for...of</code> – die Array-Methoden unten laufen immer bis zum Ende.` },
    { term: "filter / map / find / some / every / reduce", lesson: "array-methoden",
      note: `Array-Methoden statt Schleifen von Hand. Sie verändern das ursprüngliche Array nicht, sondern liefern ein neues Ergebnis – dadurch bleibt nachvollziehbar, welcher Schritt welche Daten erzeugt hat.`,
      code: `liste.filter((x) => x.offen)              // nur passende Elemente, neues Array
liste.map((x) => x.id)                    // jedes Element umwandeln, gleiche Länge
liste.find((x) => x.id === "A-1")         // erstes passendes Element (oder undefined)
liste.some((x) => x.offen)                // gibt es mindestens eins, das passt?
liste.every((x) => x.offen)               // passen wirklich alle?
liste.reduce((summe, x) => summe + x.preis, 0)
// summe ist der Zwischenstand (startet beim letzten Argument, hier 0), x das aktuelle Element`,
      pitfall: `Bei <code>reduce</code> ist der <strong>Startwert</strong> (das letzte Argument) entscheidend: Fehlt er bei einem leeren Array, wirft <code>reduce</code> einen Fehler. Er bestimmt außerdem den Typ des Ergebnisses – <code>reduce((n, x) => n + 1, 0)</code> zählt, <code>reduce((arr, x) => [...arr, x.id], [])</code> sammelt in einem neuen Array.` },
  ] },
  { title: "Asynchron & Fehler", items: [
    { term: "async / await", lesson: "async",
      note: `<code>await</code> pausiert nur die <strong>eigene</strong> <code>async</code>-Funktion, bis das Promise (z. B. eine <code>fetch</code>-Antwort) fertig ist – das restliche Programm läuft währenddessen weiter. Außerhalb einer <code>async</code>-Funktion gibt es kein <code>await</code> auf oberster Ebene.`,
      code: `async function laden() {
  const antwort = await fetch(url);
  if (!antwort.ok) throw new Error(\`Fehler \${antwort.status}\`);
  return await antwort.json();
}

// Hier, außerhalb einer async-Funktion, kein await auf oberster Ebene –
// deshalb .then(), beide warten auf dasselbe Promise:
laden().then((daten) => console.log(daten));`,
      pitfall: `Jede <code>await fetch(...)</code> ohne <code>if (!antwort.ok)</code>-Prüfung davor ist eine Falle: <code>fetch</code> wirft bei HTTP-Fehlercodes (404, 500, ...) <strong>keinen</strong> Fehler, <code>antwort.ok</code> ist dann einfach <code>false</code>. Ohne eigene Prüfung landet ein Fehlerstatus unbemerkt im weiteren Code.` },
    { term: "try / catch / throw new Error", lesson: "async",
      note: `<code>try/catch</code> fängt einen Fehler ab, statt das Programm abstürzen zu lassen. <code>throw new Error("...")</code> erzeugt ihn selbst, z. B. um eine ungültige Eingabe sofort zu melden statt sie weiterzureichen. <code>catch</code> fängt auch Fehler aus jedem <code>await</code> innerhalb des <code>try</code>-Blocks.`,
      code: `function pruefeMenge(menge) {
  if (menge <= 0) throw new Error("Menge muss größer als 0 sein");
}

try {
  pruefeMenge(-1);
} catch (fehler) {
  console.log(fehler.message);   // "Menge muss größer als 0 sein"
}`,
      pitfall: `Ein <code>throw new Error(...)</code> in reinem JavaScript ist etwas anderes als <code>job.error(...)</code> im Job Worker: <code>throw</code> ohne umgebendes <code>try/catch</code> bricht die Funktion ab, <code>job.error(...)</code> dagegen meldet der Prozess-Engine einen fachlichen BPMN-Fehler, den ein Error Boundary Event abfängt. Mehr dazu in Modul 4.` },
  ] },
  { title: "Klassen & Sammlungen", items: [
    { term: "class", lesson: "idempotenz",
      note: `Bündelt Daten (angelegt im <code>constructor</code> über <code>this</code>) und Methoden in einem Objekt-Bauplan. <code>this</code> verweist innerhalb einer Methode auf die eigene Instanz – damit lassen sich Regeln (Invarianten) direkt an der Stelle prüfen, an der die Daten verändert werden, statt überall im Code verteilt.`,
      code: `class Zaehler {
  constructor() { this.wert = 0; }
  erhoehe() { this.wert += 1; }
}

class Konto {
  constructor(startguthaben) { this.guthaben = startguthaben; }
  abheben(betrag) {
    if (betrag > this.guthaben) throw new Error("Deckung nicht ausreichend");
    this.guthaben -= betrag;
  }
}`,
      pitfall: `Wird eine Methode wie <code>konto.abheben</code> von ihrer Instanz getrennt übergeben (z. B. <code>const fn = konto.abheben; fn(50);</code>), geht das <code>this</code> verloren und die Methode läuft ins Leere oder wirft einen Fehler. Als Callback deshalb <code>(betrag) => konto.abheben(betrag)</code> oder <code>konto.abheben.bind(konto)</code> verwenden.` },
    { term: "Set", lesson: "idempotenz",
      note: `Eine Menge ohne Duplikate, praktisch um sich zu merken, welche IDs schon verarbeitet wurden (idempotente Verarbeitung von Events). <code>has</code> prüft die Zugehörigkeit, <code>add</code> fügt hinzu – beides deutlich lesbarer als ein Array mit <code>includes</code>.`,
      code: `const gesehen = new Set();
gesehen.add("evt-1");
gesehen.has("evt-1");   // true
gesehen.has("evt-2");   // false`,
      pitfall: `Ein <code>Set</code> erkennt Duplikate nur bei <strong>Primitivwerten</strong> (Texte, Zahlen) zuverlässig. Zwei Objekte mit identischem Inhalt, aber unterschiedlicher Referenz (<code>{ id: "A-1" }</code> zweimal neu erzeugt), gelten als verschieden. Für Event-Deduplizierung deshalb die ID (einen String) im <code>Set</code> speichern, nicht das ganze Event-Objekt.` },
  ] },
];
