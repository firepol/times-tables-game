import { describe, it, expect } from 'vitest'
import { generateDistractors } from './distractors'

describe('generateDistractors', () => {
  it('returns exactly 2 distractors', () => {
    expect(generateDistractors(3, 7)).toHaveLength(2)
    expect(generateDistractors(9, 9)).toHaveLength(2)
    expect(generateDistractors(2, 1)).toHaveLength(2)
  })

  it('does not include the correct answer', () => {
    for (const [a, b] of [[3,7],[4,8],[6,9],[2,2],[9,9]] as [number,number][]) {
      const correct = a * b
      const distractors = generateDistractors(a, b)
      expect(distractors).not.toContain(correct)
    }
  })

  it('all distractors are positive', () => {
    for (const [a, b] of [[2,1],[3,3],[7,8]] as [number,number][]) {
      const distractors = generateDistractors(a, b)
      expect(distractors.every((d) => d > 0)).toBe(true)
    }
  })

  it('all distractors are at most 81', () => {
    for (const [a, b] of [[9,9],[8,9],[7,9]] as [number,number][]) {
      const distractors = generateDistractors(a, b)
      expect(distractors.every((d) => d <= 81)).toBe(true)
    }
  })

  it('distractors are near-miss values (within 2× a factor of the answer)', () => {
    const [a, b] = [3, 7]
    const correct = 21
    const distractors = generateDistractors(a, b)
    // Each distractor should be a candidate from the near-miss set
    for (const d of distractors) {
      const diff = Math.abs(d - correct)
      // Should be reachable by ±a, ±b, ±2a, ±2b, or adjacent table
      expect(diff).toBeLessThanOrEqual(Math.max(a, b) * 2 + 1)
    }
  })
})
