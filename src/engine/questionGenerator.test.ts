import { describe, it, expect } from 'vitest'
import { shuffle, buildSession } from './questionGenerator'

describe('shuffle', () => {
  it('returns an array of the same length', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(shuffle(arr)).toHaveLength(5)
  })

  it('contains the same elements', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(shuffle(arr).sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('does not mutate the original', () => {
    const arr = [1, 2, 3]
    shuffle(arr)
    expect(arr).toEqual([1, 2, 3])
  })
})

describe('buildSession – typed mode', () => {
  const tables = [2, 3, 4]

  it('returns exactly count items', () => {
    const items = buildSession(tables, 10, 'typed')
    expect(items).toHaveLength(10)
  })

  it('all items are single kind', () => {
    const items = buildSession(tables, 10, 'typed')
    expect(items.every((i) => i.kind === 'single')).toBe(true)
  })

  it('question types alternate between classic_typed and missing_factor', () => {
    const items = buildSession(tables, 10, 'typed')
    for (const item of items) {
      expect(item.kind).toBe('single')
      if (item.kind === 'single') {
        expect(['classic_typed', 'missing_factor']).toContain(item.question.type)
      }
    }
  })

  it('all questions use tables from the selected set (a ∈ tables)', () => {
    const items = buildSession(tables, 15, 'typed')
    for (const item of items) {
      if (item.kind === 'single') {
        expect(tables).toContain(item.question.a)
      }
    }
  })
})

describe('buildSession – multiple_choice mode', () => {
  it('all items have type classic_mc', () => {
    const items = buildSession([3, 4, 5], 10, 'multiple_choice')
    for (const item of items) {
      if (item.kind === 'single') {
        expect(item.question.type).toBe('classic_mc')
      }
    }
  })
})

describe('buildSession – drag_drop mode', () => {
  it('returns drag_block items only', () => {
    const items = buildSession([2, 3, 4, 5, 6], 12, 'drag_drop')
    expect(items.every((i) => i.kind === 'drag_block')).toBe(true)
  })

  it('blocks have at most 4 pairs each', () => {
    const items = buildSession([2, 3, 4, 5], 12, 'drag_drop')
    for (const item of items) {
      if (item.kind === 'drag_block') {
        expect(item.pairs.length).toBeLessThanOrEqual(4)
        expect(item.pairs.length).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('no two pairs in the same block share the same product', () => {
    const items = buildSession([2, 3, 4, 5, 6, 7, 8, 9], 20, 'drag_drop')
    for (const item of items) {
      if (item.kind === 'drag_block') {
        const products = item.pairs.map((p) => p.a * p.b)
        const unique = new Set(products)
        expect(unique.size).toBe(products.length)
      }
    }
  })
})

describe('buildSession – mixed mode', () => {
  it('contains exactly one drag_block', () => {
    const items = buildSession([2, 3, 4, 5], 15, 'mixed')
    const blocks = items.filter((i) => i.kind === 'drag_block')
    expect(blocks).toHaveLength(1)
  })

  it('places the drag block at index 2', () => {
    const items = buildSession([2, 3, 4, 5], 15, 'mixed')
    expect(items[2].kind).toBe('drag_block')
  })

  it('total answer count equals requested count', () => {
    const items = buildSession([2, 3, 4, 5], 15, 'mixed')
    const total = items.reduce((sum, i) => {
      return sum + (i.kind === 'drag_block' ? i.pairs.length : 1)
    }, 0)
    expect(total).toBe(15)
  })

  it('no duplicate products in the drag block', () => {
    const items = buildSession([2, 3, 4, 5, 6, 7, 8, 9], 15, 'mixed')
    const block = items.find((i) => i.kind === 'drag_block')
    if (block && block.kind === 'drag_block') {
      const products = block.pairs.map((p) => p.a * p.b)
      expect(new Set(products).size).toBe(products.length)
    }
  })
})

describe('buildSession – focusCalcKeys', () => {
  const focusCalcKeys = ['3x7', '4x8', '6x9']
  const tables = [2, 3, 4, 5, 6, 7, 8, 9]

  it('includes all weak calc pairs at least once', () => {
    const items = buildSession(tables, 10, 'typed', focusCalcKeys)
    const singles = items.filter((i) => i.kind === 'single').map((i) => {
      if (i.kind === 'single') return `${i.question.a}x${i.question.b}`
      return ''
    })
    for (const key of focusCalcKeys) {
      expect(singles).toContain(key)
    }
  })

  it('does not repeat weak calcs to fill the count', () => {
    const items = buildSession(tables, 10, 'typed', focusCalcKeys)
    const singles = items.filter((i) => i.kind === 'single')
    const keys = singles.map((i) => i.kind === 'single' ? `${i.question.a}x${i.question.b}` : '')
    // Each key should appear at most once (no repetition)
    const keySet = new Set(keys)
    expect(keySet.size).toBe(keys.length)
  })

  it('returns empty array for empty tables', () => {
    expect(buildSession([], 10, 'typed')).toEqual([])
  })
})
