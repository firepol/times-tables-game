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

// Remove pairs with duplicate products — keeps only the first occurrence per product value
function deduplicateByProduct(
  pool: Array<{ a: number; b: number }>
): Array<{ a: number; b: number }> {
  const seen = new Set<number>()
  return pool.filter((p) => {
    const product = p.a * p.b
    if (seen.has(product)) return false
    seen.add(product)
    return true
  })
}

export function buildSession(
  tables: number[],
  count: number,
  mode: SessionMode,
  focusCalcKeys?: string[]
): SessionItem[] {
  const mainPool = buildPool(tables)

  // Primary pool: weak calcs first, padded with random from tables
  let pool: Array<{ a: number; b: number }>
  if (focusCalcKeys?.length) {
    const weakPairs = shuffle(
      focusCalcKeys.map((key) => {
        const [a, b] = key.split('x').map(Number)
        return { a, b }
      })
    )
    if (weakPairs.length >= count) {
      pool = weakPairs
    } else {
      const weakKeys = new Set(focusCalcKeys)
      const padding = mainPool.filter((p) => !weakKeys.has(`${p.a}x${p.b}`))
      pool = [...weakPairs, ...padding]
    }
  } else {
    pool = mainPool
  }

  if (pool.length === 0) return []

  // Ensure we have enough items (no repeating weak calcs — just extend with more random)
  let fullPool = pool
  if (fullPool.length < count + 10) {
    fullPool = [...pool, ...shuffle(mainPool)].slice(0, count + 10)
  }

  const items: SessionItem[] = []

  if (mode === 'drag_drop') {
    // Deduplicate products in the full pool, then split into blocks of 4
    const dedupPool = deduplicateByProduct(fullPool)
    const blockSize = 4
    for (let i = 0; i < dedupPool.length && items.length * blockSize < count; i += blockSize) {
      const block = dedupPool.slice(i, i + blockSize)
      if (block.length < 2) break
      items.push({ kind: 'drag_block', pairs: block })
    }
    return items
  }

  if (mode === 'mixed') {
    // One drag block of 4 at position 2, rest are single questions
    const dragPairs = deduplicateByProduct(fullPool).slice(0, 4)
    const dragKeys = new Set(dragPairs.map((p) => `${p.a}x${p.b}`))
    const rest = fullPool.filter((p) => !dragKeys.has(`${p.a}x${p.b}`))

    const singleCount = count - dragPairs.length
    const singles: SessionItem[] = []
    const typeRotation = shuffle([
      'classic_typed', 'classic_typed',
      'classic_mc', 'classic_mc',
      'missing_factor', 'missing_factor',
    ] as const)
    for (let i = 0; i < singleCount && i < rest.length; i++) {
      const type = typeRotation[i % typeRotation.length]
      singles.push({ kind: 'single', question: { ...rest[i], type } })
    }
    singles.splice(2, 0, { kind: 'drag_block', pairs: dragPairs })
    return singles
  }

  // typed or multiple_choice
  for (let i = 0; i < count && i < fullPool.length; i++) {
    const pair = fullPool[i]
    if (mode === 'multiple_choice') {
      items.push({ kind: 'single', question: { ...pair, type: 'classic_mc' } })
    } else {
      const type = i % 2 === 0 ? 'classic_typed' : 'missing_factor'
      items.push({ kind: 'single', question: { ...pair, type } })
    }
  }
  return items
}
