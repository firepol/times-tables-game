export default {
  // HomePage
  home: {
    title: 'Times Tables!',
    subtitle: 'Practice your multiplication tables',
    play: '▶ Play',
    settings: '⚙ Settings',
    stats: '📊 Statistics',
  },
  // SettingsPage
  settings: {
    title: 'Settings',
    tables: 'Tables to practice',
    presets: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      all: 'All',
    },
    questionsPerSession: 'Questions per session',
    gameMode: 'Game mode',
    modes: {
      mixed: '★ Mixed (recommended)',
      drag_drop: '↔ Drag & Drop only',
      multiple_choice: '◉ Multiple Choice only',
      typed: '✎ Type the answer only',
    },
    timedChallenge: '⏱ Timed challenge',
    timedDesc: 'Each question has a timer. Time up = wrong.',
    on: 'ON',
    off: 'OFF',
    secondsPerQuestion: 'Seconds per question: {{n}}s',
    timedHint: 'For drag & drop: {{count}} questions × {{n}}s = total block time',
    language: 'Language',
  },
  // PlaySetupPage
  play: {
    title: 'Start session',
    tables: 'Tables',
    questions: 'Questions',
    mode: 'Mode',
    modes: {
      mixed: '★ Mixed',
      drag_drop: '↔ Drag & Drop',
      multiple_choice: '◉ Multiple Choice',
      typed: '✎ Type answer',
    },
    weakHint: '💡 You have frequent errors:',
    trainWeak: 'Train these calculations',
    start: '▶ Start',
  },
  // GamePage
  game: {
    matchInstruction: 'Match each calculation to its result!',
    noQuestions: 'No questions available. Check your settings.',
  },
  // ResultsPage
  results: {
    title: 'Session complete!',
    correct: 'correct',
    wrong: 'wrong',
    duration: 'time',
    mistakesTitle: 'You got wrong:',
    youAnswered: 'you answered {{got}} (correct: {{expected}})',
    youAnsweredTimeout: 'no answer (time up)',
    playAgain: '▶ Play again',
    stats: '📊 Statistics',
    home: '🏠 Home',
  },
  // StatsPage
  stats: {
    title: 'Statistics',
    last: 'Last:',
    all: 'All',
    hardestCalcs: 'Hardest calculations',
    legend: '✍ = typed  •  MC = multiple choice  •  ↔ = drag & drop',
    trainWeak: 'Train these calculations',
    recentSessions: 'Recent sessions',
    noSessions: 'No sessions yet. Play the first one!',
    questions: '{{n}} q',
    errors: '{{n}} err',
    reset: '🗑 Reset statistics',
    resetConfirm: 'This will delete all session history and error data. Are you sure?',
  },
  // SessionDetailPage
  sessionDetail: {
    notFound: 'Session not found',
    backToStats: 'Back to statistics',
    title: 'Session detail',
    date: 'Date',
    tables: 'Tables',
    mode: 'Mode',
    score: 'Score',
    answers: 'Answers',
  },
  // Modes (shared label)
  modeLabels: {
    mixed: 'Mixed',
    drag_drop: 'Drag & Drop',
    multiple_choice: 'Multiple Choice',
    typed: 'Typed',
  },
} as const
