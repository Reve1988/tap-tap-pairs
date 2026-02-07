export interface Point {
    row: number
    col: number
}

export interface Card {
    id: number
    emoji: string
    row: number
    col: number
    removed: boolean
}

export interface StageConfig {
    id: number
    cols: number
    rows: number
    timeLimit: number
    layout: boolean[][]
}

export type GameStatus = 'ready' | 'playing' | 'stage-clear' | 'game-clear' | 'game-over'
