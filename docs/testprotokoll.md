# Testprotokoll R4

Datum: __________________  
Tester: __________________  
Deployment-URL: __________________

> Diese fünf kurzen Checks im Browser vor der Abgabe einmal selbst durchführen und Status ankreuzen. Der automatisierte Test läuft mit `npm test`.

| Heuristik | Stelle | Test | Erwartung | Status |
|---|---|---|---|---|
| 1 Sichtbarkeit des Systemstatus | Match erstellen → OpenLigaDB | «Spieldaten laden» klicken | Button zeigt Ladezustand, danach Ergebnis oder verständliche Fehlermeldung | ☐ erfüllt |
| 3 Kontrolle und Freiheit | Match erstellen | Formular öffnen und «Abbrechen» wählen | Rückkehr zur Matchübersicht ohne Speichern | ☐ erfüllt |
| 4 Konsistenz und Standards | Navigation / Status | mehrere Seiten öffnen | Navigation, Buttons und Statusdarstellung bleiben konsistent | ☐ erfüllt |
| 5 Fehler vermeiden | Match erstellen | Pflichtfelder leer absenden | Speichern wird verhindert, Meldung direkt beim Feld | ☐ erfüllt |
| 9 Fehler erkennen und beheben | Aufgabe erstellen | Titel leer lassen | verständliche Feldmeldung erscheint, Formular bleibt bearbeitbar | ☐ erfüllt |

## Responsive-Test

| Gerät | Breite | Prüfpunkte | Status |
|---|---:|---|---|
| Smartphone | 360 px | keine horizontale Scrollbar, Mobile Navigation sichtbar, Formulare bedienbar | ☐ |
| Desktop | 1440 px | Sidebar sichtbar, Inhalte nutzen verfügbare Breite, Tabellen/Karten lesbar | ☐ |

## Automatisierter Test

Befehl:

```bash
npm test
```

Erwartung: alle Tests in `tests/validation.test.js` grün.

Status: ☐ bestanden

## Deployment-Test

- ☐ `/` erreichbar
- ☐ Unterseite nach Reload erreichbar
- ☐ `/api/health` antwortet mit JSON
- ☐ Match wird in MariaDB gespeichert
- ☐ Aufgabe wird in MariaDB gespeichert
- ☐ Statusänderung bleibt nach Reload erhalten
