import { useMemo, useState } from 'react'
import { generateDistractors } from '../engine/distractors'
import { shuffle } from '../engine/questionGenerator'
import './MultipleChoice.css'

interface Props {
  a: number
  b: number
  onAnswer: (value: number) => void
}

export default function MultipleChoice({ a, b, onAnswer }: Props) {
  const choices = useMemo(() => {
    const distractors = generateDistractors(a, b)
    return shuffle([a * b, ...distractors])
  }, [a, b])

  const [chosen, setChosen] = useState<number | null>(null)

  function pick(v: number) {
    if (chosen !== null) return
    setChosen(v)
    setTimeout(() => { onAnswer(v); setChosen(null) }, 500)
  }

  return (
    <div className="mc-choices">
      {choices.map((c) => (
        <button
          key={c}
          className={`mc-btn ${chosen === null ? '' : c === a * b ? 'correct' : chosen === c ? 'wrong' : 'dim'}`}
          onClick={() => pick(c)}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
