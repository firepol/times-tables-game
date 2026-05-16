import { shuffle } from './questionGenerator'

export function generateDistractors(a: number, b: number): number[] {
  const correct = a * b
  const candidates = new Set<number>()

  // Near-miss by adding/subtracting one factor
  for (const delta of [-b, b, -a, a, -b * 2, b * 2, -a * 2, a * 2]) {
    const v = correct + delta
    if (v > 0 && v !== correct && v <= 81) candidates.add(v)
  }

  // Adjacent table results
  for (const da of [-1, 1]) {
    const v = (a + da) * b
    if (v > 0 && v !== correct && v <= 81) candidates.add(v)
  }
  for (const db of [-1, 1]) {
    const v = a * (b + db)
    if (v > 0 && v !== correct && v <= 81) candidates.add(v)
  }

  const pool = shuffle([...candidates])
  return pool.slice(0, 2)
}
