import type { GameSession } from '../types'

export function getWeakCalculations(sessions: GameSession[], lastN = 10, topK = 10): string[] {
  const recent = sessions.slice(-lastN)
  const scores = new Map<string, number>()

  recent.forEach((session, idx) => {
    const weight = idx + 1
    session.answers
      .filter((a) => !a.correct)
      .forEach((a) => {
        const key = `${a.question.a}x${a.question.b}`
        scores.set(key, (scores.get(key) ?? 0) + weight)
      })
  })

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([key]) => key)
}

export function useWeakCalcs(sessions: GameSession[], lastN = 10) {
  return getWeakCalculations(sessions, lastN)
}
