import type { StageConfig } from './types'

function rect(rows: number, cols: number): boolean[][] {
    return Array.from({ length: rows }, () => Array(cols).fill(true))
}

export const stages: StageConfig[] = [
    {
        id: 1,
        cols: 6,
        rows: 4,
        timeLimit: 120,
        layout: rect(4, 6)
    }
]
