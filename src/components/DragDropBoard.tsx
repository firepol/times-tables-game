import { useState, useMemo, useRef } from 'react'
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import type { Answer } from '../types'
import { shuffle } from '../engine/questionGenerator'
import './DragDropBoard.css'

interface Pair { a: number; b: number }

interface Props {
  pairs: Pair[]
  onComplete: (answers: Answer[]) => void
}

function DraggableCalc({ id, label, matched }: { id: string; label: string; matched: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id })
  // No transform applied: DragOverlay handles the visual, original stays in place but hidden
  if (matched) return <div className="dd-cell matched" />
  return (
    <div
      ref={setNodeRef}
      className={`dd-cell dd-calc ${isDragging ? 'dd-source-hidden' : ''}`}
      {...listeners}
      {...attributes}
    >
      {label}
    </div>
  )
}

function DroppableResult({ id, value, flash }: { id: string; value: number; flash: 'correct' | 'wrong' | null }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`dd-cell dd-result ${isOver ? 'over' : ''} ${flash ?? ''}`}
    >
      {value}
    </div>
  )
}

export default function DragDropBoard({ pairs, onComplete }: Props) {
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [flash, setFlash] = useState<Record<string, 'correct' | 'wrong'>>({})
  const pendingAnswers = useRef<Answer[]>([])
  const [activeLabel, setActiveLabel] = useState<string | null>(null)

  const startTimes = useMemo(() => {
    const m: Record<string, number> = {}
    pairs.forEach((p) => { m[`${p.a}x${p.b}`] = Date.now() })
    return m
  }, [pairs])

  const shuffledResults = useMemo(() => shuffle(pairs.map((p) => ({ id: `r_${p.a}x${p.b}`, value: p.a * p.b, a: p.a, b: p.b }))), [pairs])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  function onDragEnd(event: DragEndEvent) {
    setActiveLabel(null)
    const { active, over } = event
    if (!over) return

    const calcKey = active.id as string          // e.g. "c_3x4"
    const dropKey = over.id as string            // e.g. "r_7x8"
    const [ca, cb] = calcKey.replace('c_', '').split('x').map(Number)
    const droppedResult = shuffledResults.find((r) => `r_${r.a}x${r.b}` === dropKey)
    if (!droppedResult) return

    const correct = droppedResult.a === ca && droppedResult.b === cb
    const elapsed = Date.now() - (startTimes[calcKey.replace('c_', '')] ?? Date.now())

    const answer: Answer = {
      question: { a: ca, b: cb },
      questionType: 'drag_drop',
      correct,
      userAnswer: droppedResult.value,
      correctAnswer: ca * cb,
      timeMs: elapsed,
    }

    if (correct) {
      setFlash((f) => ({ ...f, [dropKey]: 'correct' }))
      const newMatched = new Set(matched).add(calcKey)
      pendingAnswers.current = [...pendingAnswers.current, answer]
      if (newMatched.size === pairs.length) {
        const final = pendingAnswers.current
        setTimeout(() => onComplete(final), 400)
      }
      setMatched(newMatched)
      if (navigator.vibrate) navigator.vibrate(50)
    } else {
      setFlash((f) => ({ ...f, [dropKey]: 'wrong' }))
      pendingAnswers.current = [...pendingAnswers.current, answer]
      if (navigator.vibrate) navigator.vibrate([80, 40, 80])
    }
    setTimeout(() => setFlash((f) => { const n = { ...f }; delete n[dropKey]; return n }), 500)
  }

  return (
    <DndContext sensors={sensors} onDragStart={(e) => setActiveLabel(e.active.id as string)} onDragEnd={onDragEnd}>
      <div className="dd-board">
        <div className="dd-col">
          {pairs.map((p) => (
            <DraggableCalc
              key={`c_${p.a}x${p.b}`}
              id={`c_${p.a}x${p.b}`}
              label={`${p.a} × ${p.b}`}
              matched={matched.has(`c_${p.a}x${p.b}`)}
            />
          ))}
        </div>
        <div className="dd-col">
          {shuffledResults.map((r) => (
            <DroppableResult
              key={r.id}
              id={r.id}
              value={r.value}
              flash={flash[r.id] ?? null}
            />
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeLabel ? <div className="dd-cell dd-calc dragging-overlay">{activeLabel.replace('c_', '').replace('x', ' × ')}</div> : null}
      </DragOverlay>
    </DndContext>
  )
}
