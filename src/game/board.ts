import type { Card, Point, StageConfig } from '../types'

const EMOJI_POOL = [
    '🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🍑', '🥝', '🍌', '🍉',
    '🐶', '🐱', '🐼', '🦊', '🐯', '🦁', '🐸', '🐵', '🐰', '🐷',
    '⚽', '🏀', '🎾', '🏐', '🎱', '🍕', '🍔', '🌮', '🍩', '🧁',
    '💎', '⭐', '🔥', '🎵', '🏆', '🌸', '🌺', '🌻', '🌹', '🌷',
    '🚗', '🚀', '✈️', '🚁', '🚂', '😎', '🤩', '🥳', '😍', '🤗',
    '🎲', '🎯', '🎪', '🎭', '🎬', '🧩', '🔮', '🎠', '🎡', '🎢',
    '🦄', '🐲', '🐳', '🦋', '🐢', '🦀', '🐙', '🦑', '🦜', '🦩',
    '🥭', '🍍', '🥥', '🫐', '🍅', '🥑', '🌽', '🥕', '🧄', '🧅',
    '❤️', '💜', '💙', '💚', '💛', '🧡', '🩵', '🩷', '🩶', '🖤',
]

function shuffle<T>(arr: T[]): T[] {
    const result = [...arr]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[result[i], result[j]] = [result[j]!, result[i]!]
    }
    return result
}

export function getActiveCells(stage: StageConfig): Point[] {
    const cells: Point[] = []
    for (let r = 0; r < stage.rows; r++) {
        for (let c = 0; c < stage.cols; c++) {
            if (stage.layout[r]![c]) {
                cells.push({ row: r, col: c })
            }
        }
    }
    return cells
}

export function generateCards(stage: StageConfig): Card[] {
    const cells = getActiveCells(stage)
    const total = cells.length
    const numTypes = total / 4

    if (numTypes > EMOJI_POOL.length) {
        throw new Error(`Not enough emojis: need ${numTypes}, have ${EMOJI_POOL.length}`)
    }

    // Shuffle pool then pick first numTypes for variety across games
    const shuffledPool = shuffle(EMOJI_POOL)
    const selectedEmojis = shuffledPool.slice(0, numTypes)

    let emojis: string[] = []
    for (const emoji of selectedEmojis) {
        for (let i = 0; i < 4; i++) {
            emojis.push(emoji)
        }
    }
    emojis = shuffle(emojis)

    return cells.map((pos, i) => ({
        id: i,
        emoji: emojis[i]!,
        row: pos.row,
        col: pos.col,
        removed: false
    }))
}

/**
 * Shuffle emojis among remaining (non-removed) cards, keeping positions fixed.
 */
export function shuffleRemaining(cards: Card[]): void {
    const remaining = cards.filter(c => !c.removed)
    let emojis = remaining.map(c => c.emoji)
    emojis = shuffle(emojis)
    remaining.forEach((card, i) => {
        card.emoji = emojis[i]!
    })
}
