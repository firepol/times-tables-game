import { useState, useCallback } from 'react'
import type { ChallengeConfig, ChallengeRun } from '../types'

const CONFIGS_KEY = 'tabelline_challenge_configs'
const RUNS_KEY = 'tabelline_challenge_runs'
const MAX_RUNS = 500

function loadConfigs(): ChallengeConfig[] {
  try { return JSON.parse(localStorage.getItem(CONFIGS_KEY) ?? '[]') } catch { return [] }
}
function loadRuns(): ChallengeRun[] {
  try { return JSON.parse(localStorage.getItem(RUNS_KEY) ?? '[]') } catch { return [] }
}

export function useChallenges() {
  const [configs, setConfigs] = useState<ChallengeConfig[]>(loadConfigs)
  const [runs, setRuns] = useState<ChallengeRun[]>(loadRuns)

  const saveConfig = useCallback((config: ChallengeConfig) => {
    setConfigs((prev) => {
      const next = prev.find((c) => c.id === config.id)
        ? prev.map((c) => (c.id === config.id ? config : c))
        : [...prev, config]
      localStorage.setItem(CONFIGS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const deleteConfig = useCallback((id: string) => {
    setConfigs((prev) => {
      const next = prev.filter((c) => c.id !== id)
      localStorage.setItem(CONFIGS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const saveRun = useCallback((run: ChallengeRun) => {
    setRuns((prev) => {
      const next = [...prev, run].slice(-MAX_RUNS)
      localStorage.setItem(RUNS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearRuns = useCallback(() => {
    localStorage.removeItem(RUNS_KEY)
    setRuns([])
  }, [])

  return { configs, runs, saveConfig, deleteConfig, saveRun, clearRuns }
}
