import type { ChallengeSession, ChallengeConfig } from '../types'

function scoreSession(session: ChallengeSession, timedMode: boolean, timerSeconds: number): number {
  return session.answers.reduce((sum, a) => {
    if (a.correct) {
      const speedBonus = timedMode && timerSeconds > 0
        ? Math.max(0, Math.round(5 * (1 - a.timeMs / (timerSeconds * 1000))))
        : 0
      return sum + 10 + speedBonus
    }
    return sum - 20
  }, 0)
}

export function scoreChallenge(sessions: ChallengeSession[], config: ChallengeConfig): number {
  return Math.max(0, sessions.reduce(
    (sum, s) => sum + scoreSession(s, config.timedMode, config.timerSeconds),
    0
  ))
}
