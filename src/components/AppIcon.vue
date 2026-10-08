<script setup>
// Schlanke Strich-Icons (24×24) ohne zusätzliches npm-Paket.
// Icons sind dekorativ (aria-hidden); Bedeutung steht immer im Text daneben.
defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
})

const paths = {
  home: ['M3 10.5 12 3l9 7.5', 'M5 9.5V20h5v-6h4v6h5V9.5'],
  calendar: ['M4 6h16v14H4z', 'M4 10h16', 'M8 3v4', 'M16 3v4'],
  tasks: ['M9 6h11', 'M9 12h11', 'M9 18h11', 'm3.5 6 1.5 1.5L7.5 5', 'm3.5 12 1.5 1.5 2.5-2.5', 'M4 18h2'],
  layers: ['m12 3 9 5-9 5-9-5 9-5Z', 'm3 13 9 5 9-5'],
  chart: ['M4 20V10', 'M10 20V4', 'M16 20v-7', 'M22 20H2'],
  image: ['M4 5h16v14H4z', 'm4 16 5-5 4 4 3-3 4 4', 'M15.5 9.5h.01'],
  settings: [
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    'M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z',
  ],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 11v5', 'M12 8h.01'],
  plus: ['M12 5v14', 'M5 12h14'],
  search: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'm20 20-4-4'],
  edit: ['M4 20h4L19 9l-4-4L4 16v4Z', 'm13.5 6.5 4 4'],
  trash: ['M4 7h16', 'M10 11v6', 'M14 11v6', 'M6 7l1 13h10l1-13', 'M9 7V4h6v3'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  list: ['M8 6h12', 'M8 12h12', 'M8 18h12', 'M4 6h.01', 'M4 12h.01', 'M4 18h.01'],
  board: ['M4 4h4v16H4z', 'M10 4h4v10h-4z', 'M16 4h4v13h-4z'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5l3 2'],
  alert: ['M12 3 2 20h20L12 3Z', 'M12 10v4', 'M12 17h.01'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  ball: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'm12 7 4 3-1.5 4.5h-5L8 10l4-3Z', 'M12 3v4', 'm16 10 4.5-1.5', 'm14.5 14.5 2.5 4', 'm9.5 14.5-2.5 4', 'M8 10 3.5 8.5'],
  arrow: ['M5 12h14', 'm13 6 6 6-6 6'],
  check: ['m5 12 5 5 9-10'],
  video: ['M3 6h12v12H3z', 'm15 10 6-3v10l-6-3'],
}
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    class="shrink-0"
  >
    <path v-for="(d, index) in paths[name] ?? []" :key="index" :d="d" />
  </svg>
</template>
