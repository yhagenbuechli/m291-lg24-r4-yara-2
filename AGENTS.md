# AGENTS.md – Matchday Content Planner

Lies vor jeder Änderung zuerst `PROJECT.md`.

`PROJECT.md` ist die fachliche Spezifikation des Projekts.

## Stack

- Vue 3
- Composition API
- `<script setup>`
- JavaScript
- Vite
- Vue Router
- Pinia
- Tailwind CSS 4
- PHP
- MariaDB
- OpenLigaDB

Keine zusätzlichen npm-Pakete ohne Rückfrage.

## Struktur

- Views: `src/views/`
- Komponenten: `src/components/`
- Stores: `src/stores/`
- Router: `src/router/index.js`
- Design-Tokens: `src/style.css`
- Backend: `api/`

## Arbeitsweise

1. Bestehenden Code lesen.
2. `PROJECT.md` prüfen.
3. Einen kleinen Schritt planen.
4. Nur diesen Schritt umsetzen.
5. Funktion testen.
6. `npm run build` ausführen.
7. Änderung kurz zusammenfassen.

User Story für User Story arbeiten.

Keine ungefragten Zusatzfeatures.

## Frontend

- Oberfläche auf Deutsch
- Schweizer Rechtschreibung
- keine Hex-Farben direkt in Vue-Komponenten
- zentrale Design-Tokens verwenden
- sichtbare Labels bei Formularfeldern
- Fehlermeldungen direkt beim Feld
- Lade-, Fehler-, Leer- und Erfolgszustände behandeln
- Status nie nur durch Farbe darstellen
- sichtbare Fokuszustände
- responsive ab 360 px
- `prefers-reduced-motion` beachten

## Pinia

Pinia nur für Zustände verwenden, die mehrere Views oder Komponenten brauchen.

Lokale Formularzustände bleiben in der jeweiligen Komponente.

## API

- Frontend validiert Eingaben
- PHP validiert Eingaben erneut
- API antwortet als JSON
- verständliche Fehlermeldungen
- vorbereitete SQL-Statements verwenden
- Datenmodell gemäss `PROJECT.md`

## Sicherheit

Niemals:

- `.env.deploy` verändern oder ausgeben
- `api/.env` verändern oder ausgeben
- Passwörter committen
- FTP-Zugangsdaten committen
- DB-Zugangsdaten committen
- Secrets in `VITE_` speichern
- `node_modules` committen

Deployment nur auf ausdrückliche Anweisung.

## Befehle

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run deploy:check`
- `npm run deploy` nur auf ausdrückliche Anweisung
- später `npm test`