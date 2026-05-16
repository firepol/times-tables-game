export type QuestionType =
  | 'classic_typed'
  | 'classic_mc'
  | 'missing_factor'
  | 'drag_drop'

export type SessionMode = 'mixed' | 'drag_drop' | 'multiple_choice' | 'typed'

export interface Question {
  a: number
  b: number
  type: QuestionType
}

export type SessionItem =
  | { kind: 'single'; question: Question }
  | { kind: 'drag_block'; pairs: Array<{ a: number; b: number }> }

export interface Answer {
  question: { a: number; b: number }
  questionType: QuestionType
  correct: boolean
  userAnswer: number
  correctAnswer: number
  timeMs: number
}

export interface GameSession {
  id: string
  date: string
  tables: number[]
  mode: SessionMode
  answers: Answer[]
  durationMs: number
}

export interface AppSettings {
  selectedTables: number[]
  questionsPerSession: number
  sessionMode: SessionMode
}
