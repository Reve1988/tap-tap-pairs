import { ref, computed, onUnmounted } from 'vue'
import type { Card, Point, StageConfig, GameStatus } from '../types'
import { loadStage } from '../stages'
import { generateCards, shuffleRemaining } from '../game/board'
import { findPath, buildGrid, findAnyMatch } from '../game/pathfinding'

export function useGame() {
    const currentStageNumber = ref(1)
    const currentStage = ref<StageConfig | null>(null)
    const cards = ref<Card[]>([])
    const selectedCards = ref<Card[]>([])
    const matchPath = ref<Point[] | null>(null)
    const timeLeft = ref(0)
    const gameStatus = ref<GameStatus>('ready')
    const hints = ref(3)
    const shuffles = ref(3)
    const hintedCards = ref<number[]>([])
    const removingCards = ref<number[]>([])
    const isProcessing = ref(false)

    let timerInterval: number | null = null

    const remainingCards = computed(() => cards.value.filter(c => !c.removed))

    // --- Timer ---
    function startTimer() {
        stopTimer()
        timerInterval = window.setInterval(() => {
            if (gameStatus.value !== 'playing') return
            timeLeft.value--
            if (timeLeft.value <= 0) {
                timeLeft.value = 0
                gameOver()
            }
        }, 1000)
    }

    function stopTimer() {
        if (timerInterval !== null) {
            clearInterval(timerInterval)
            timerInterval = null
        }
    }

    // --- Game flow ---
    async function startGame() {
        currentStageNumber.value = 1
        hints.value = 3
        shuffles.value = 3
        await startStage()
    }

    async function startStage() {
        const stage = await loadStage(currentStageNumber.value)
        if (!stage) {
            // No more stages — game clear!
            stopTimer()
            gameStatus.value = 'game-clear'
            return
        }
        currentStage.value = stage
        cards.value = generateCards(stage)
        selectedCards.value = []
        matchPath.value = null
        hintedCards.value = []
        isProcessing.value = false
        timeLeft.value = stage.timeLimit
        gameStatus.value = 'playing'
        startTimer()
        ensureMatchExists()
    }

    function gameOver() {
        stopTimer()
        gameStatus.value = 'game-over'
    }

    async function stageClear() {
        stopTimer()
        // Pre-check if next stage exists
        const next = await loadStage(currentStageNumber.value + 1)
        if (next) {
            gameStatus.value = 'stage-clear'
        } else {
            gameStatus.value = 'game-clear'
        }
    }

    async function nextStage() {
        currentStageNumber.value++
        hints.value = Math.min(hints.value + 1, 3)
        shuffles.value = Math.min(shuffles.value + 1, 3)
        await startStage()
    }

    function restartGame() {
        startGame()
    }

    function devSkipStage() {
        if (gameStatus.value !== 'playing') return
        stageClear()
    }

    async function devPrevStage() {
        if (currentStageNumber.value <= 1) return
        currentStageNumber.value--
        await startStage()
    }

    // --- Card selection ---
    function selectCard(card: Card) {
        if (gameStatus.value !== 'playing' || isProcessing.value) return
        if (card.removed || removingCards.value.includes(card.id)) return
        if (!currentStage.value) return

        hintedCards.value = []

        // Clicking already-selected card deselects it
        if (selectedCards.value.some(c => c.id === card.id)) {
            selectedCards.value = []
            return
        }

        if (selectedCards.value.length === 0) {
            selectedCards.value = [card]
            return
        }

        // Second card selected
        const first = selectedCards.value[0]!
        selectedCards.value = [first, card]

        if (first.emoji === card.emoji) {
            const stage = currentStage.value
            const grid = buildGrid(cards.value, stage.rows, stage.cols)
            const path = findPath(grid, first, card, stage.rows, stage.cols)

            if (path) {
                // Match found — animate out, allow next clicks immediately
                matchPath.value = path
                timeLeft.value += 1
                removingCards.value = [first.id, card.id]
                selectedCards.value = []

                const f = first, c = card
                setTimeout(() => {
                    f.removed = true
                    c.removed = true
                    removingCards.value = []
                    matchPath.value = null

                    if (remainingCards.value.length === 0) {
                        stageClear()
                    } else {
                        ensureMatchExists()
                    }
                }, 500)
                return
            }
        }

        // No match
        isProcessing.value = true
        setTimeout(() => {
            selectedCards.value = []
            isProcessing.value = false
        }, 400)
    }

    // --- Check if any matches exist ---
    function ensureMatchExists() {
        if (!currentStage.value) return
        const stage = currentStage.value
        const match = findAnyMatch(cards.value, stage.rows, stage.cols)
        if (!match) {
            // No matches available — pause and notify
            stopTimer()
            gameStatus.value = 'no-matches'
        }
    }

    // --- Shuffle from no-matches modal ---
    function shuffleFromModal() {
        if (shuffles.value <= 0) return
        shuffles.value--
        selectedCards.value = []
        hintedCards.value = []
        shuffleRemaining(cards.value)
        cards.value = [...cards.value]
        gameStatus.value = 'playing'
        startTimer()
        ensureMatchExists()
    }

    // --- Hint ---
    function useHint() {
        if (hints.value <= 0 || gameStatus.value !== 'playing' || isProcessing.value) return
        if (!currentStage.value) return
        const match = findAnyMatch(cards.value, currentStage.value.rows, currentStage.value.cols)
        if (match) {
            hints.value--
            hintedCards.value = [match.card1.id, match.card2.id]
        }
    }

    // --- Shuffle ---
    function useShuffle() {
        if (shuffles.value <= 0 || gameStatus.value !== 'playing' || isProcessing.value) return
        if (!currentStage.value) return
        shuffles.value--
        selectedCards.value = []
        hintedCards.value = []
        shuffleRemaining(cards.value)
        cards.value = [...cards.value]
        ensureMatchExists()
    }

    onUnmounted(() => stopTimer())

    return {
        // State
        currentStage,
        currentStageNumber,
        cards,
        selectedCards,
        matchPath,
        timeLeft,
        gameStatus,
        hints,
        shuffles,
        hintedCards,
        removingCards,
        // Actions
        startGame,
        nextStage,
        restartGame,
        devSkipStage,
        devPrevStage,
        shuffleFromModal,
        selectCard,
        useHint,
        useShuffle,
    }
}
