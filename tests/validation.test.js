import { describe, expect, it } from 'vitest'
import { calculateProgress, validateMatch, validateTask } from '../src/utils/validation.js'

describe('validateMatch', () => {
  it('meldet alle Pflichtfelder, wenn das Formular leer ist', () => {
    const errors = validateMatch({ homeTeam: '', awayTeam: '', date: '', time: '' })

    expect(errors).toHaveProperty('homeTeam')
    expect(errors).toHaveProperty('awayTeam')
    expect(errors).toHaveProperty('date')
    expect(errors).toHaveProperty('time')
  })

  it('akzeptiert ein gültiges Match ohne optionale Felder', () => {
    const errors = validateMatch({
      homeTeam: 'FC Zürich',
      awayTeam: 'FC Basel',
      date: '2026-10-18',
      time: '16:30',
    })

    expect(errors).toEqual({})
  })

  it('verhindert gleiche Heim- und Auswärtsteams', () => {
    const errors = validateMatch({
      homeTeam: 'FC Zürich',
      awayTeam: ' fc zürich ',
      date: '2026-10-18',
      time: '16:30',
    })

    expect(errors.awayTeam).toBe('Heim- und Auswärtsteam müssen verschieden sein.')
  })
})

describe('validateTask', () => {
  it('verlangt einen Titel', () => {
    const errors = validateTask({ matchId: 1, title: '   ', category: 'Foto', status: 'Offen' })

    expect(errors.title).toBe('Bitte gib einen Aufgabentitel ein.')
  })

  it('lehnt unbekannte Kategorien und Status ab', () => {
    const errors = validateTask({ matchId: 1, title: 'Matchplakat', category: 'Radio', status: 'Fertig' })

    expect(errors).toHaveProperty('category')
    expect(errors).toHaveProperty('status')
  })

  it('akzeptiert eine gültige Aufgabe', () => {
    const errors = validateTask({ matchId: 1, title: 'Matchplakat', category: 'Grafik', status: 'Geplant' })

    expect(errors).toEqual({})
  })
})

describe('calculateProgress', () => {
  it('gibt 0 zurück, wenn keine Aufgaben vorhanden sind', () => {
    expect(calculateProgress([])).toBe(0)
  })

  it('berechnet den Anteil erledigter Aufgaben in Prozent', () => {
    const tasks = [
      { status: 'Erledigt' },
      { status: 'Offen' },
      { status: 'Erledigt' },
      { status: 'In Arbeit' },
    ]

    expect(calculateProgress(tasks)).toBe(50)
  })

  it('rundet auf ganze Prozent', () => {
    const tasks = [{ status: 'Erledigt' }, { status: 'Offen' }, { status: 'Offen' }]

    expect(calculateProgress(tasks)).toBe(33)
  })
})