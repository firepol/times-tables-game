import { useState } from 'react'
import './NumberPad.css'

interface Props {
  onSubmit: (value: number) => void
  maxDigits?: number
}

export default function NumberPad({ onSubmit, maxDigits = 2 }: Props) {
  const [input, setInput] = useState('')

  function press(digit: string) {
    if (input.length >= maxDigits) return
    const next = input + digit
    setInput(next)
    if (next.length === maxDigits) {
      setTimeout(() => { onSubmit(parseInt(next, 10)); setInput('') }, 80)
    }
  }

  function del() {
    setInput((s) => s.slice(0, -1))
  }

  function submit() {
    if (!input) return
    onSubmit(parseInt(input, 10))
    setInput('')
  }

  return (
    <div className="numpad">
      <div className="numpad-display">{input || <span className="numpad-placeholder">?</span>}</div>
      <div className="numpad-grid">
        {['1','2','3','4','5','6','7','8','9'].map((d) => (
          <button key={d} className="numpad-key" onClick={() => press(d)}>{d}</button>
        ))}
        <button className="numpad-key numpad-del" onClick={del}>⌫</button>
        <button className="numpad-key" onClick={() => press('0')}>0</button>
        <button className="numpad-key numpad-ok" onClick={submit}>OK</button>
      </div>
    </div>
  )
}
