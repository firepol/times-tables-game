import { useState, useCallback } from 'react'
import i18n from '../i18n'
import type { AppSettings, SessionMode } from '../types'

const KEY = 'tabelline_settings'

const DEFAULTS: AppSettings = {
  selectedTables: [2, 3, 4, 5, 6, 7, 8, 9],
  questionsPerSession: 15,
  sessionMode: 'mixed',
  timedMode: false,
  timerSeconds: 4,
  language: (i18n.language?.startsWith('it') ? 'it' : 'en') as 'en' | 'it',
}

function load(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return DEFAULTS
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(load)

  const save = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const toggleTable = useCallback((table: number) => {
    setSettings((prev) => {
      const tables = prev.selectedTables.includes(table)
        ? prev.selectedTables.filter((t) => t !== table)
        : [...prev.selectedTables, table].sort((a, b) => a - b)
      if (tables.length === 0) return prev
      const next = { ...prev, selectedTables: tables }
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const setTables = useCallback((tables: number[]) => save({ selectedTables: tables }), [save])
  const setQuestionsPerSession = useCallback((n: number) => save({ questionsPerSession: n }), [save])
  const setSessionMode = useCallback((mode: SessionMode) => save({ sessionMode: mode }), [save])
  const setTimedMode = useCallback((on: boolean) => save({ timedMode: on }), [save])
  const setTimerSeconds = useCallback((s: number) => save({ timerSeconds: Math.max(2, Math.min(6, s)) }), [save])

  const setLanguage = useCallback((lang: 'en' | 'it') => {
    i18n.changeLanguage(lang)
    save({ language: lang })
  }, [save])

  return {
    settings, toggleTable, setTables, setQuestionsPerSession,
    setSessionMode, setTimedMode, setTimerSeconds, setLanguage,
  }
}
