<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <section>
      <p class="eyebrow">Projekt</p>
      <h2 class="page-title">Über & Datenschutz</h2>
      <p class="mt-1 text-muted">Informationen zum Matchday Content Planner und zur Verarbeitung von Daten.</p>
    </section>

    <section class="card p-6">
      <h3 class="text-xl font-bold text-primary">Matchday Content Planner</h3>
      <p class="mt-3 leading-7 text-zinc-600">
        Die Anwendung unterstützt Content-Teams von Fussballvereinen bei der Planung von Matchdays.
        Matches, Content-Aufgaben, Status und Fortschritt werden an einem Ort verwaltet.
      </p>
    </section>

    <section class="card p-6">
      <h3 class="text-xl font-bold text-primary">Datenschutzhinweis</h3>

      <div class="mt-4 space-y-5 text-sm leading-6 text-zinc-600">
        <div>
          <h4 class="font-bold text-primary">Gespeicherte Daten</h4>
          <p class="mt-1">
            Matchdaten, Content-Aufgaben und Vorlagen werden ausschliesslich im Local Storage dieses Browsers
            gespeichert. Es gibt keinen eigenen Server und keine Datenbank; die Daten verlassen dein Gerät nicht.
            Die Formulare erfassen keine Passwörter und keine besonders schützenswerten Personendaten.
          </p>
        </div>

        <div>
          <h4 class="font-bold text-primary">Lokale Einstellungen</h4>
          <p class="mt-1">
            Einstellungen wie Vereinsname oder Darstellungspräferenzen werden im Local Storage des Browsers gespeichert.
          </p>
        </div>

        <div>
          <h4 class="font-bold text-primary">Externer Dienst</h4>
          <p class="mt-1">
            Für den Import von Spieldaten ruft der Browser die öffentliche Schnittstelle von OpenLigaDB direkt ab.
            Übermittelt werden nur die gewählte Liga und Saison sowie technische Verbindungsdaten wie die IP-Adresse.
            Es wird kein API-Schlüssel verwendet.
          </p>
        </div>

        <div>
          <h4 class="font-bold text-primary">Speicherdauer und Zugriff</h4>
          <p class="mt-1">
            Die Daten bleiben gespeichert, bis du sie löschst – zum Beispiel über die Browser-Einstellungen
            («Websitedaten löschen»). Sie sind nur in diesem Browser auf diesem Gerät sichtbar.
          </p>
        </div>
      </div>
    </section>

    <section class="card p-6">
      <h3 class="text-xl font-bold text-primary">Technik</h3>
      <p class="mt-3 text-sm leading-6 text-zinc-600">
        Vue 3, Vue Router, Pinia, Tailwind CSS 4, Vite, Local Storage und OpenLigaDB.
      </p>
    </section>
  </div>
</template>
