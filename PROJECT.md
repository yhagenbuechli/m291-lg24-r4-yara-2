# PROJECT.md – Matchday Content Planner

## Projekt

Der Matchday Content Planner ist eine Web-App für Content-Teams von Fussballvereinen. Die Anwendung bündelt Matchdaten, Content-Aufgaben, Status und Fortschritt an einem Ort.

Primäre Nutzung: Desktop/Laptop bei der Planung vor dem Matchday.

Sekundäre Nutzung: Smartphone am Matchday für schnelle Statusänderungen und offene Aufgaben.

## Zielpublikum

- Content Producerinnen und Content Producer
- Social-Media- und Kommunikationsverantwortliche
- Foto- und Videoproduktion im Stadion

## Technischer Rahmen

- Vue 3 mit Composition API und `<script setup>`
- JavaScript
- Vite
- Vue Router
- Pinia
- Tailwind CSS 4
- PHP für die eigene API
- MariaDB
- externe JSON-API: OpenLigaDB

Keine zusätzlichen npm-Pakete ohne Rückfrage.

## Kernrouten

- `/` Dashboard
- `/matches` Matchübersicht
- `/matches/:id` Matchdetail
- `/matches/new` Match erstellen
- `/tasks` Aufgaben
- `/templates` Vorlagen
- `/statistics` Statistiken
- `/media` Mediathek
- `/settings` Einstellungen
- `/about` Über & Datenschutz

## Muss-Anforderungen

1. Responsive SPA mit mehr als drei Seiten.
2. Vue Router verwenden.
3. Pinia sinnvoll für gemeinsame Zustände einsetzen.
4. Dashboard mit nächstem Matchday, Fortschritt und offenen Aufgaben.
5. Matches anzeigen und erstellen.
6. Matchdetailseite anzeigen.
7. Content-Aufgaben erstellen.
8. Aufgabenstatus ändern.
9. Fortschritt aus erledigten Aufgaben berechnen.
10. Externe API per `fetch` laden.
11. Lade-, Fehler-, Leer- und Ergebniszustände anzeigen.
12. Formulare pro Feld validieren.
13. Formulardaten an eine eigene PHP-API senden.
14. Daten in MariaDB speichern.
15. Erfolg und Fehler sichtbar zurückmelden.
16. Responsive ab 360 px.
17. Mindestens eine Animation mit UX-Zweck.
18. Datenschutzhinweis in der App.
19. Mindestens ein automatisierter Test.

## User Story US-01 – Dashboard

Als Content Producerin möchte ich den nächsten Matchday, den Fortschritt und offene Aufgaben sehen.

Akzeptanzkriterien:

- Heimteam und Auswärtsteam sichtbar
- Datum, Anspielzeit und Stadion sichtbar
- Fortschritt als Prozentwert
- mindestens drei offene Aufgaben
- Titel und Status pro Aufgabe
- verständlicher Leerzustand

## User Story US-02 – Matchday erfassen

Als Social Media Manager möchte ich einen Matchday erfassen.

Akzeptanzkriterien:

- Heimteam, Auswärtsteam, Datum und Anspielzeit Pflichtfelder
- Wettbewerb und Stadion optional
- Fehlermeldungen direkt beim Feld
- ungültiges Formular nicht absendbar
- gültige Daten an `POST /api/matches`
- sichtbare Erfolgsbestätigung

## User Story US-03 – Externe Matchdaten

Als Social Media Manager möchte ich Spieldaten aus OpenLigaDB übernehmen.

Akzeptanzkriterien:

- Abruf per `fetch`
- sichtbarer Ladezustand
- verständliche Fehlermeldung
- erneuter Versuch möglich
- Teams und Datum sichtbar
- ausgewähltes Spiel kann übernommen werden

## User Story US-04 – Content-Aufgabe erstellen

Als Content Producerin möchte ich einem Match eine Content-Aufgabe hinzufügen.

Akzeptanzkriterien:

- Titel Pflichtfeld
- Kategorie und Status auswählbar
- Veröffentlichungszeit möglich
- Notizen möglich
- Fehler direkt beim Feld
- gültige Daten an `POST /api/tasks`
- Erfolg und Fehler sichtbar

## User Story US-05 – Aufgabenstatus ändern

Verfügbare Status:

- Offen
- In Arbeit
- Geplant
- Erledigt
- Überfällig

Akzeptanzkriterien:

- neuer Status sofort sichtbar
- Änderung über eigene API gespeichert
- Match-Fortschritt neu berechnet
- Status immer mit Text und Farbe

## User Story US-06 – Aufgaben filtern

Aufgaben können nach Kategorie und Status gefiltert werden.

Akzeptanzkriterien:

- Kategorie-Filter
- Status-Filter
- aktiver Filter sichtbar
- Liste aktualisiert sich direkt
- verständlicher Leerzustand

## API

Geplante Endpunkte:

- `GET /api/matches`
- `POST /api/matches`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `GET /api/templates`
- `POST /api/templates`

## Datenbank

### matches

- id
- home_team
- away_team
- competition
- match_date
- kickoff_time
- stadium
- created_at

### tasks

- id
- match_id
- title
- category
- status
- publish_time
- notes
- created_at

### templates

- id
- name
- description
- created_at

## Design

Designrichtung: Anthrazit & Lime.

Farben:

- Primary: `#18181B`
- Secondary: `#3F3F46`
- Accent: `#A3E635`
- Background: `#FAFAFA`
- Surface: `#FFFFFF`
- Success: `#22C55E`
- Warning: `#F59E0B`
- Error: `#EF4444`
- Info: `#3B82F6`
- Planned: `#8B5CF6`

Schrift: Inter.

Desktop:
- feste dunkle Sidebar
- helle Inhaltsfläche
- Lime für aktive Navigation und primäre Aktionen
- Cards, Tabellen und Fortschrittsanzeigen

Mobile:
- reduzierte Informationsdichte
- Inhalte untereinander
- kompakte Navigation

Statusinformationen nie nur über Farbe darstellen.

Animationen ungefähr 150–300 ms.

`prefers-reduced-motion` beachten.

## Qualität

- sichtbare Lade- und Speicherzustände
- Fehlermeldungen direkt beim Feld
- sichtbare Fokuszustände
- Tastaturbedienbarkeit
- kein horizontaler Scrollbalken ab 360 px
- vorbereitete SQL-Statements
- keine Zugangsdaten im Repository