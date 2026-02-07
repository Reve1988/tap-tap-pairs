import type { StageConfig } from './types'

export async function loadStage(stageNumber: number): Promise<StageConfig | null> {
    try {
        const res = await fetch(`/stages/stage${stageNumber}.json`)
        if (!res.ok) return null
        const data: StageConfig = await res.json()
        return data
    } catch {
        return null
    }
}
