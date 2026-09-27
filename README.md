# Tokenlauf

Ein interaktiver Lernpfad für alle, die Prozessautomatisierung mit Camunda lernen wollen: vom ersten JavaScript-Code über BPMN, DMN und FEEL bis zu Job Workern, Java/Spring Boot, Messaging, Architektur und Requirements Engineering.

Die App läuft komplett im Browser. Sie braucht keinen Server, keine Anmeldung und keinen Build-Schritt.

## Inhalt

45 Schritte in 8 Modulen:

| Modul | Themen |
|---|---|
| 1 Grundlagen | Variablen, Bedingungen, Schleifen, `filter`/`map`/`find` |
| 2 Daten & Schnittstellen | JSON, Mapping, `async`/`await`, REST-API-Design |
| 3 Prozesse modellieren | BPMN-Elemente, Gateways (mit Simulator), Ereignisse, Subprozesse, Prozessanalyse, FEEL, DMN |
| 4 Job Worker | `complete` / `fail` / `error`, Worker mit REST-Aufruf |
| 5 Java & Spring Boot | Java für JS-Kenner, Spring-Beans, REST-Controller, `@JobWorker` |
| 6 Integration & Messaging | Orchestrierung vs. Choreografie, Integration Patterns, Kafka, idempotente Consumer, Nachrichtenkorrelation, Saga & Outbox |
| 7 Architektur | Microservices, Resilienz, DDD, Aggregates, Event Storming, Clean Architecture, Enterprise-Architektur |
| 8 Anforderungen & Zusammenarbeit | Anforderungsarten, User Stories, Arbeit mit Fachbereichen, Abschluss-Check |

Die Übersicht **„Dein Stellenprofil“** ordnet jede Anforderung einer Stellenausschreibung den passenden Schritten zu und zeigt den Fortschritt.

### Übungstypen

- **Code-Übungen:** Du schreibst JavaScript im Editor. Automatische Tests prüfen den Code in einem Web Worker. `fetch` spricht mit einer simulierten Übungs-API, `zeebe` simuliert die Camunda-Engine (Jobs, Nachrichten).
- **Lückentexte:** für Java- und Spring-Code, der nicht im Browser läuft.
- **Quizze und Zuordnungsübungen** mit Erklärungen.

Der Fortschritt wird im `localStorage` des Browsers gespeichert, also nur auf dem jeweiligen Gerät.

## Lokal starten

Die App nutzt Web Worker, die aus Sicherheitsgründen nicht in jedem Browser direkt von der Festplatte (`file://`) starten. Am zuverlässigsten ist ein kleiner lokaler Server:

```bash
cd tokenlauf
python3 -m http.server 8000
```

Dann <http://localhost:8000> im Browser öffnen.

## Auf GitHub Pages veröffentlichen

1. Repository auf GitHub anlegen und den Code pushen (siehe unten).
2. Auf GitHub unter **Settings → Pages** bei „Source“ **Deploy from a branch** wählen, Branch `main`, Ordner `/ (root)`.
3. Nach ein bis zwei Minuten ist die App unter `https://<dein-name>.github.io/tokenlauf/` erreichbar.

## Projektstruktur

```
tokenlauf/
├── index.html                  Seitengerüst
├── css/styles.css              Gestaltung (helles und dunkles Farbschema)
├── js/inhalte.js               Alle Lektionen, Quizze, Tests und das Stellenprofil
├── js/app.js                   Darstellung, Editor, Testlauf im Web Worker, simulierte Engine
├── tests/pruefe-loesungen.js   Prüft, dass jede Musterlösung ihre Tests besteht
└── .github/workflows/tests.yml Führt diese Prüfung bei jedem Push aus
```

## Inhalte erweitern

Alle Lektionen stehen in `js/inhalte.js` im Array `MODULES`. Jede Lektion ist ein Objekt mit einem `type`:

| `type` | Pflichtfelder |
|---|---|
| `code` | `theory`, `task`, `starter`, `solution`, `hint`, `file`, `tests` |
| `fill` | `theory`, `task`, `code` mit Lücken `[[id]]`, `blanks` (erlaubte Antworten je Lücke), `hint`, `file` |
| `quiz` | `theory`, `questions` (`q`, `options`, `correct`, `explain`) |
| `sort` | `theory`, `task`, `categories`, `items` (`text`, `cat`, `why`) |
| `info` | `theory` |

Tests sind Funktionen, die im Worker neben dem Code laufen und diese Helfer bekommen:

```js
tests: [
  ["Beschreibung des Tests", async ({ eq, assert, runJob, fetchLog, messages }) => {
    const r = await runJob("mein-task-typ", { kundeId: 42 });
    eq(r.status, "complete", "Job-Ausgang");
  }],
],
```

Nach Änderungen prüfen (Node.js ab Version 18):

```bash
npm test
```

Neue Lektions-IDs kannst du in `PROFILE` (ebenfalls in `js/inhalte.js`) einer Anforderung zuordnen.

## Hinweise

- Die Camunda-Beispiele nutzen das Node.js-SDK `@camunda8/sdk` und den Spring-Boot-Starter von Camunda. Klassen- und Artefaktnamen des Spring SDK haben sich zwischen Versionen geändert. Maßgeblich ist die [Camunda-Doku](https://docs.camunda.io) zur eingesetzten Version.
- Schriften werden von Google Fonts geladen. Ohne Internetverbindung greift die App auf Systemschriften zurück.
