import type { SessionItem, SessionMode } from '../types'

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildPool(tables: number[]): Array<{ a: number; b: number }> {
  const pool: Array<{ a: number; b: number }> = []
  for (const a of tables) {
    for (let b = 1; b <= 9; b++) {
      pool.push({ a, b })
    }
  }
  return shuffle(pool)
}

function buildPoolFromCalcKeys(calcKeys: string[]): Array<{ a: number; b: number }> {
  return shuffle(
    calcKeys.map((key) => {
      const [a, b] = key.split('x').map(Number)
      return { a, b }
    })
  )
}

export function buildSession(
  tables: number[],
  count: number,
  mode: SessionMode,
  focusCalcKeys?: string[]
): SessionItem[] {
  const pool = focusCalcKeys?.length
    ? buildPoolFromCalcKeys(focusCalcKeys)
    : buildPool(tables)

  if (pool.length === 0) return []

  // Repeat pool if needed
  const repeated = [...pool]
  while (repeated.length < count + 6) repeated.push(...shuffle(pool))

  const items: SessionItem[] = []
  let idx = 0

  if (mode === 'drag_drop') {
    // One big drag block, batched in groups of 5
    while (items.length * 5 < count && idx < repeated.length) {
      const blockSize = Math.min(5, count - items.length * 5, repeated.length - idx)
      if (blockSize < 2) break
      items.push({ kind: 'drag_block', pairs: repeated.slice(idx, idx + blockSize) })
      idx += blockSize
    }
    return items
  }

  if (mode === 'mixed') {
    // Insert one drag_block of 4 pairs, rest are single questions
    const dragPairs = repeated.slice(idx, idx + 4)
    idx += 4
    const singleCount = count - 4
    const singles: SessionItem[] = []
    const typeRotation: Array<'classic_typed' | 'classic_mc' | 'missing_factor'> = shuffle([
      'classic_typed', 'classic_typed',
      'classic_mc', 'classic_mc',
      'missing_factor', 'missing_factor',
    ] as const)
    for (let i = 0; i < singleCount && idx < repeated.length; i++) {
      const type = typeRotation[i % typeRotation.length]
      singles.push({ kind: 'single', question: { ...repeated[idx++], type } })
    }
    // Insert drag_block at position 2 in the session
    singles.splice(2, 0, { kind: 'drag_block', pairs: dragPairs })
    return singles
  }

  // typed or multiple_choice
  for (let i = 0; i < count && idx < repeated.length; i++) {
    const pair = repeated[idx++]
    if (mode === 'multiple_choice') {
      items.push({ kind: 'single', question: { ...pair, type: 'classic_mc' } })
    } else {
      // typed: alternate classic_typed and missing_factor
      const type = i % 2 === 0 ? 'classic_typed' : 'missing_factor'
      items.push({ kind: 'single', question: { ...pair, type } })
    }
  }
  return items
}
