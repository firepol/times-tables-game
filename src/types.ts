export type QuestionType = 'multiple-choice' | 'drag-drop' | 'fill-in'

export interface Answer {
  value: number
  isCorrect: boolean
  selectedAt?: number
}

export interface GameSession {
  id: string
  tableNumber: number
  questionType: QuestionType
  startedAt: number
  endedAt?: number
  answers: Answer[]
  score: number
  totalQuestions: number
}

export interface AppSettings {
  selectedTables: number[]
  questionTypes: QuestionType[]
  questionsPerSession: number
  soundEnabled: boolean
  language: 'it' | 'en'
}
