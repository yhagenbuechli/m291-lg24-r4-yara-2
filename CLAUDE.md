# CLAUDE.md – Projektregeln

Lies vor jeder Arbeit zuerst:

1. `AGENTS.md`
2. `PROJECT.md`

`PROJECT.md` enthält die fachliche Spezifikation.

`AGENTS.md` enthält die technischen und organisatorischen Regeln.

## Technik

- Vue 3
- Composition API
- `<script setup>`
- JavaScript
- Vite
- Tailwind CSS 4
- Vue Router
- Pinia
- PHP
- MariaDB
- OpenLigaDB

Keine zusätzlichen npm-Pakete ohne Rückfrage.

## Arbeitsweise

- zuerst bestehenden Code lesen
- `PROJECT.md` beachten
- kleine Schritte
- User Story für User Story
- keine ungefragten Zusatzfeatures
- nach Frontend-Änderungen `npm run build`

## Oberfläche

- Deutsch
- Schweizer Rechtschreibung
- Anthrazit-&-Lime-Design gemäss `PROJECT.md`
- zentrale Design-Tokens
- responsive ab 360 px
- sichtbare Labels
- sichtbare Fokuszustände
- Status nie nur über Farbe
- `prefers-reduced-motion` beachten

## Sicherheit

- keine `.env`-Geheimnisse ausgeben
- `.env.deploy` nicht verändern
- `api/.env` nicht verändern
- keine Passwörter oder Zugangsdaten committen
- Deployment nur auf ausdrückliche Anweisung

## Befehle

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run deploy:check`
- `npm run deploy` nur auf ausdrückliche Anweisung