import { useState, useCallback } from 'react'
import type { GameSession } from '../types'

const KEY = 'tabelline_sessions'
const MAX = 100

function load(): GameSession[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useSessions() {
  const [sessions, setSessions] = useState<GameSession[]>(load)

  const saveSession = useCallback((session: GameSession) => {
    setSessions((prev) => {
      const next = [...prev, session].slice(-MAX)
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearSessions = useCallback(() => {
    localStorage.removeItem(KEY)
    setSessions([])
  }, [])

  return { sessions, saveSession, clearSessions }
}
