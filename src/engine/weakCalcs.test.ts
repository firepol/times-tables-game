import { describe, it, expect } from 'vitest'
import { getWeakCalculations } from '../hooks/useWeakCalcs'
import type { GameSession } from '../types'

function makeSession(errors: [number, number][], type: 'classic_mc' | 'classic_typed' = 'classic_mc'): GameSession {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    tables: [2, 3, 4],
    mode: 'mixed',
    durationMs: 60000,
    answers: errors.map(([a, b]) => ({
      question: { a, b },
      questionType: type,
      correct: false,
      userAnswer: 0,
      correctAnswer: a * b,
      timeMs: 1000,
    })),
  }
}

describe('getWeakCalculations', () => {
  it('returns empty array when no sessions', () => {
    expect(getWeakCalculations([])).toEqual([])
  })

  it('returns keys for wrong answers only', () => {
    const sessions: GameSession[] = [
      {
        ...makeSession([[3, 7], [4, 8]]),
        answers: [
          { question: { a: 3, b: 7 }, questionType: 'classic_mc', correct: false, userAnswer: 0, correctAnswer: 21, timeMs: 1000 },
          { question: { a: 5, b: 5 }, questionType: 'classic_mc', correct: true,  userAnswer: 25, correctAnswer: 25, timeMs: 1000 },
        ],
      },
    ]
    const result = getWeakCalculations(sessions)
    expect(result).toContain('3x7')
    expect(result).not.toContain('5x5')
  })

  it('ranks higher-weight (more recent) errors first', () => {
    const sessions: GameSession[] = [
      makeSession([[2, 3]]),        // older → lower weight
      makeSession([[2, 3], [4, 5]]), // newer → higher weight
    ]
    const result = getWeakCalculations(sessions)
    // 2x3 appears in both (both weighted), 4x5 only in newer session
    // Both should appear; 2x3 has more total weight
    expect(result).toContain('2x3')
    expect(result).toContain('4x5')
    expect(result.indexOf('2x3')).toBeLessThan(result.indexOf('4x5'))
  })

  it('respects the lastN parameter', () => {
    const sessions: GameSession[] = [
      makeSession([[9, 9]]),  // oldest, excluded by lastN=1
      makeSession([[3, 7]]),  // newest, included
    ]
    const result = getWeakCalculations(sessions, 1)
    expect(result).toContain('3x7')
    expect(result).not.toContain('9x9')
  })

  it('respects the topK parameter', () => {
    const sessions = Array.from({ length: 5 }, (_, i) => makeSession([[i + 2, 3]]))
    const result = getWeakCalculations(sessions, 10, 2)
    expect(result).toHaveLength(2)
  })

  it('accumulates errors from multiple sessions for the same calc', () => {
    const sessions: GameSession[] = [
      makeSession([[6, 7]]),
      makeSession([[6, 7]]),
      makeSession([[6, 7]]),
    ]
    const result = getWeakCalculations(sessions)
    expect(result[0]).toBe('6x7')
  })

  it('timeout answers (userAnswer -1) count as errors', () => {
    const sessions: GameSession[] = [{
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      tables: [3],
      mode: 'mixed',
      durationMs: 30000,
      answers: [{
        question: { a: 3, b: 9 },
        questionType: 'classic_mc',
        correct: false,
        userAnswer: -1,
        correctAnswer: 27,
        timeMs: 4000,
      }],
    }]
    const result = getWeakCalculations(sessions)
    expect(result).toContain('3x9')
  })
})
