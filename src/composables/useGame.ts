import { ref, computed, onUnmounted } from 'vue'
import type { Card, Point, GameStatus } from '../types'
import { stages } from '../stages'
import { generateCards, shuffleRemaining } from '../game/board'
import { findPath, buildGrid, findAnyMatch } from '../game/pathfinding'

export function useGame() {
    const currentStageIndex = ref(0)
    const cards = ref<Card[]>([])
    const selectedCards = ref<Card[]>([])
    const matchPath = ref<Point[] | null>(null)
    const timeLeft = ref(0)
    const gameStatus = ref<GameStatus>('ready')
    const hints = ref(3)
    const shuffles = ref(3)
    const hintedCards = ref<number[]>([])
    const isProcessing = ref(false)

    let timerInterval: number | null = null

    const currentStage = computed(() => stages[currentStageIndex.value])
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
    function startGame() {
        currentStageIndex.value = 0
        hints.value = 3
        shuffles.value = 3
        startStage()
    }

    function startStage() {
        const stage = currentStage.value
        cards.value = generateCards(stage)
        selectedCards.value = []
        matchPath.value = null
        hintedCards.value = []
        isProcessing.value = false
        timeLeft.value = stage.timeLimit
        gameStatus.value = 'playing'
        startTimer()
        // Ensure initial board has at least one match
        ensureMatchExists()
    }

    function gameOver() {
        stopTimer()
        gameStatus.value = 'game-over'
    }

    function stageClear() {
        stopTimer()
        if (currentStageIndex.value >= stages.length - 1) {
            gameStatus.value = 'game-clear'
        } else {
            gameStatus.value = 'stage-clear'
        }
    }

    function nextStage() {
        currentStageIndex.value++
        hints.value = Math.min(hints.value + 1, 3)
        shuffles.value = Math.min(shuffles.value + 1, 3)
        startStage()
    }

    function restartGame() {
        startGame()
    }

    // --- Card selection ---
    function selectCard(card: Card) {
        if (gameStatus.value !== 'playing' || isProcessing.value) return
        if (card.removed) return

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
        const first = selectedCards.value[0]
        selectedCards.value = [first, card]

        if (first.emoji === card.emoji) {
            const stage = currentStage.value
            const grid = buildGrid(cards.value, stage.rows, stage.cols)
            const path = findPath(grid, first, card, stage.rows, stage.cols)

            if (path) {
                // Match found!
                isProcessing.value = true
                matchPath.value = path
                timeLeft.value += 1

                setTimeout(() => {
                    first.removed = true
                    card.removed = true
                    matchPath.value = null
                    selectedCards.value = []
                    isProcessing.value = false

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

    // --- Ensure matches exist, auto-shuffle if not ---
    function ensureMatchExists() {
        const stage = currentStage.value
        let attempts = 0
        while (attempts < 20) {
            const match = findAnyMatch(cards.value, stage.rows, stage.cols)
            if (match) return
            shuffleRemaining(cards.value)
            // Force reactivity
            cards.value = [...cards.value]
            attempts++
        }
    }

    // --- Hint ---
    function useHint() {
        if (hints.value <= 0 || gameStatus.value !== 'playing' || isProcessing.value) return
        const stage = currentStage.value
        const match = findAnyMatch(cards.value, stage.rows, stage.cols)
        if (match) {
            hints.value--
            hintedCards.value = [match.card1.id, match.card2.id]
        }
    }

    // --- Shuffle ---
    function useShuffle() {
        if (shuffles.value <= 0 || gameStatus.value !== 'playing' || isProcessing.value) return
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
        currentStageIndex,
        cards,
        selectedCards,
        matchPath,
        timeLeft,
        gameStatus,
        hints,
        shuffles,
        hintedCards,
        // Actions
        startGame,
        nextStage,
        restartGame,
        selectCard,
        useHint,
        useShuffle,
    }
}
