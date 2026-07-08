# Finanzplaner

Ein Desktop-Finanzplaner in professioneller Qualität – gebaut mit **Electron**,
**React** und **SQLite** (lokal, ohne Cloud-Anbindung). Alle Daten bleiben auf
dem eigenen Rechner.

## Features

1. **Budget & Ausgaben** – Einnahmen/Ausgaben erfassen, Kategorien verwalten,
   CSV-Import von Kontoauszügen mit Spalten-Mapping und Vorschau
2. **Monatsübersicht** – Einnahmen, Ausgaben, Saldo pro Monat, Navigation
   zwischen Monaten, Jahresvergleich als Chart
3. **Sparziele** – Ziele mit Betrag und Datum, Fortschrittsbalken und
   Prognose der Zielerreichung anhand des Spartempos
4. **Investments** – Depot-Positionen manuell pflegen, Wertentwicklung als
   Chart, Gesamtdepotwert
5. **Wiederkehrende Buchungen** – Miete, Gehalt, Abos werden automatisch
   monatlich gebucht (idempotent, mit Enddatum-Unterstützung)
6. **Backup** – Datenbank sichern/wiederherstellen, Export aller Buchungen
   als CSV
7. **Berichte** – Monats- und Jahresbericht als PDF (Bilanz, Kategorien,
   Sparquote, Fixkostenquote)
8. **Änderungshistorie** – jede Buchung protokolliert Erstell-/Änderungsdatum
   sowie ein vollständiges Audit-Log aller Feldänderungen

## Qualitätsmerkmale

- Beträge werden ausschließlich als **Integer in Cent** gespeichert und
  verarbeitet (keine Floats) – vermeidet Rundungsfehler
- Deutsches Zahlenformat (`1.234,56 €`) in der gesamten Oberfläche
- Strikte, serverseitige (Main-Prozess) Eingabevalidierung mit klaren
  deutschen Fehlermeldungen, zusätzlich Client-seitige Validierung im Formular
- SQLite-Trigger protokollieren jede Änderung an einer Buchung automatisch
  (Audit-Log), unabhängig vom Code-Pfad
- 62 automatisierte Tests (Vitest) für alle Berechnungen (Salden, Sparquote,
  Fixkostenquote, Sparziel-Prognose, Investment-Performance,
  Betragsformatierung/-validierung) sowie Integrationstests der Datenbankschicht

## Tech-Stack

- **Electron 33** + **electron-vite** (Build-Tooling für Main/Preload/Renderer)
- **React 18** + **TypeScript** (strict mode)
- **better-sqlite3** (synchrone, lokale SQLite-Datenbank)
- **Recharts** für Charts, **Zustand** für State-Management
- **pdfkit** für PDF-Berichte, **papaparse** für CSV-Import/-Export

## Projektstruktur

```
src/
  main/           # Electron Main-Prozess: DB-Schema, Repositories, IPC, PDF-Reports
    db/
      schema.ts           # SQLite-Schema inkl. Audit-Trigger
      repositories/        # CRUD + Validierung je Entität
    ipc/handlers.ts        # IPC-Endpunkte (ipcMain.handle)
    recurring/generateDue.ts  # Automatische Buchung wiederkehrender Posten
    reports/pdf.ts          # PDF-Berichtsgenerator (pdfkit)
  preload/        # contextBridge: typsichere window.api-Oberfläche
  renderer/       # React-App (Dashboard, Seiten, Komponenten, State)
  shared/         # Von Main/Renderer gemeinsam genutzt: Typen, Berechnungen,
                  # Formatierung, IPC-Vertrag
tests/            # Vitest: Berechnungen, Formatierung, DB-Integration
```

## Entwicklung

Voraussetzungen: Node.js ≥ 20.

```bash
npm install          # installiert Abhängigkeiten (electron-builder rebuildet
                      # native Module wie better-sqlite3 automatisch gegen die
                      # Electron-ABI; benötigt Internetzugang)
npm run dev           # Electron-App im Entwicklungsmodus starten
npm run build          # Produktions-Build (Main/Preload/Renderer)
npm run typecheck      # TypeScript strict-mode Prüfung
npm test               # Vitest-Testsuite einmalig ausführen
npm run test:watch     # Vitest im Watch-Modus
```

Die SQLite-Datenbank wird beim ersten Start automatisch unter dem
Electron-`userData`-Verzeichnis angelegt (z. B.
`~/.config/finanzplaner/finanzplaner.sqlite3` unter Linux) und mit
Standardkategorien vorbefüllt.

### Paketierung (Installer)

```bash
npm run build:unpack   # ungepackter Ordner (schnell, zum Testen)
npm run build:linux    # AppImage
```

Windows-/macOS-Ziele sind in `electron-builder.yml` vorbereitet, benötigen
aber einen Build auf dem jeweiligen Zielsystem bzw. Cross-Build-Tooling.

## Hinweis zur Verifikation dieser Implementierung

Diese App wurde in einer isolierten, headless Cloud-Umgebung ohne Display
und ohne Zugriff auf `github.com`/`electronjs.org` (Download der
Electron-Binärdatei) entwickelt. Verifiziert wurde daher über:

- `npm run typecheck` (TypeScript strict mode, alle drei Teilprojekte)
- `npm test` (62 Tests, alle grün)
- `npm run build` (electron-vite Produktions-Build von Main-, Preload- und
  Renderer-Bundle – erfolgreich)

Ein manueller Klicktest der Electron-GUI war in dieser Umgebung **nicht**
möglich. Vor dem produktiven Einsatz empfiehlt sich `npm run dev` auf einem
Rechner mit Internetzugang, um den kompletten Bedienfluss (insbesondere
Datei-Dialoge für Backup/Restore/PDF-Export und den CSV-Import) einmal
manuell durchzuspielen.

---

Das Repository enthielt ursprünglich ein kleines Python-Übungsskript
(`greet.py` / `test_greet.py`) zum Ausprobieren des Pull-Request-Workflows;
es bleibt unverändert im Repo-Root erhalten.
