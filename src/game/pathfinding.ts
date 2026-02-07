import type { Point, Card } from '../types'

/**
 * Check if a cell is blocked (has a non-removed card).
 * Cells outside the board boundaries are always free (allows outside-board paths).
 */
function isCellBlocked(
    grid: (Card | null)[][],
    row: number,
    col: number,
    rows: number,
    cols: number
): boolean {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return false
    const card = grid[row][col]
    return card !== null && !card.removed
}

/**
 * Check if a straight line between two points (same row or col) is clear.
 * Only checks intermediate cells (exclusive of endpoints).
 */
function isLineClear(
    grid: (Card | null)[][],
    r1: number, c1: number,
    r2: number, c2: number,
    rows: number, cols: number
): boolean {
    if (r1 === r2) {
        const minC = Math.min(c1, c2)
        const maxC = Math.max(c1, c2)
        for (let c = minC + 1; c < maxC; c++) {
            if (isCellBlocked(grid, r1, c, rows, cols)) return false
        }
        return true
    }
    if (c1 === c2) {
        const minR = Math.min(r1, r2)
        const maxR = Math.max(r1, r2)
        for (let r = minR + 1; r < maxR; r++) {
            if (isCellBlocked(grid, r, c1, rows, cols)) return false
        }
        return true
    }
    return false
}

/**
 * Build a 2D grid from cards array.
 */
export function buildGrid(cards: Card[], rows: number, cols: number): (Card | null)[][] {
    const grid: (Card | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null))
    for (const card of cards) {
        if (!card.removed) {
            grid[card.row][card.col] = card
        }
    }
    return grid
}

/**
 * Find a path between two points with at most 2 bends.
 * Returns array of Points (waypoints including start/end), or null if no path.
 * Supports outside-board routing (coordinates -1 and rows/cols).
 */
export function findPath(
    grid: (Card | null)[][],
    p1: Point,
    p2: Point,
    rows: number,
    cols: number
): Point[] | null {
    if (p1.row === p2.row && p1.col === p2.col) return null

    // 0 bends: direct straight line
    if ((p1.row === p2.row || p1.col === p2.col) &&
        isLineClear(grid, p1.row, p1.col, p2.row, p2.col, rows, cols)) {
        return [p1, p2]
    }

    // 1 bend: two segments meeting at a corner
    const corners = [
        { row: p1.row, col: p2.col },
        { row: p2.row, col: p1.col }
    ]
    for (const corner of corners) {
        if (!isCellBlocked(grid, corner.row, corner.col, rows, cols) &&
            isLineClear(grid, p1.row, p1.col, corner.row, corner.col, rows, cols) &&
            isLineClear(grid, corner.row, corner.col, p2.row, p2.col, rows, cols)) {
            return [p1, corner, p2]
        }
    }

    // 2 bends: three segments via intermediate column
    for (let c = -1; c <= cols; c++) {
        const m1 = { row: p1.row, col: c }
        const m2 = { row: p2.row, col: c }
        if (!isCellBlocked(grid, m1.row, m1.col, rows, cols) &&
            !isCellBlocked(grid, m2.row, m2.col, rows, cols) &&
            isLineClear(grid, p1.row, p1.col, m1.row, m1.col, rows, cols) &&
            isLineClear(grid, m1.row, m1.col, m2.row, m2.col, rows, cols) &&
            isLineClear(grid, m2.row, m2.col, p2.row, p2.col, rows, cols)) {
            return [p1, m1, m2, p2]
        }
    }

    // 2 bends: three segments via intermediate row
    for (let r = -1; r <= rows; r++) {
        const m1 = { row: r, col: p1.col }
        const m2 = { row: r, col: p2.col }
        if (!isCellBlocked(grid, m1.row, m1.col, rows, cols) &&
            !isCellBlocked(grid, m2.row, m2.col, rows, cols) &&
            isLineClear(grid, p1.row, p1.col, m1.row, m1.col, rows, cols) &&
            isLineClear(grid, m1.row, m1.col, m2.row, m2.col, rows, cols) &&
            isLineClear(grid, m2.row, m2.col, p2.row, p2.col, rows, cols)) {
            return [p1, m1, m2, p2]
        }
    }

    return null
}

/**
 * Find any matchable pair on the board. Returns [card1, card2, path] or null.
 */
export function findAnyMatch(
    cards: Card[],
    rows: number,
    cols: number
): { card1: Card; card2: Card; path: Point[] } | null {
    const grid = buildGrid(cards, rows, cols)
    const remaining = cards.filter(c => !c.removed)

    for (let i = 0; i < remaining.length; i++) {
        for (let j = i + 1; j < remaining.length; j++) {
            if (remaining[i].emoji === remaining[j].emoji) {
                const path = findPath(grid, remaining[i], remaining[j], rows, cols)
                if (path) {
                    return { card1: remaining[i], card2: remaining[j], path }
                }
            }
        }
    }
    return null
}
