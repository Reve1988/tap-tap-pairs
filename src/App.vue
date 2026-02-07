<script setup lang="ts">
import { useGame } from './composables/useGame'
import GameBoard from './components/GameBoard.vue'
import GameHUD from './components/GameHUD.vue'
import GameModal from './components/GameModal.vue'

const {
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
  startGame,
  nextStage,
  restartGame,
  selectCard,
  useHint,
  useShuffle,
} = useGame()
</script>

<template>
  <div id="game-container">
    <header class="game-header">
      <h1>🀄 사천성</h1>
      <p class="subtitle">Tap Tap Pairs</p>
    </header>

    <!-- Ready Screen -->
    <div v-if="gameStatus === 'ready'" class="start-screen">
      <p class="start-desc">이모지 카드를 매칭하여 모든 카드를 제거하세요!</p>
      <button class="start-btn" @click="startGame">게임 시작</button>
    </div>

    <!-- Playing -->
    <template v-else>
      <GameHUD
        :stage="currentStageIndex + 1"
        :time-left="timeLeft"
        :hints="hints"
        :shuffles="shuffles"
        @hint="useHint"
        @shuffle="useShuffle"
        @restart="restartGame"
      />

      <main class="game-board-area">
        <GameBoard
          :stage="currentStage"
          :cards="cards"
          :selected-cards="selectedCards"
          :hinted-cards="hintedCards"
          :match-path="matchPath"
          @card-click="selectCard"
        />
      </main>

      <GameModal
        v-if="gameStatus === 'stage-clear' || gameStatus === 'game-clear' || gameStatus === 'game-over'"
        :status="gameStatus"
        :stage="currentStageIndex + 1"
        @next-stage="nextStage"
        @restart="restartGame"
      />
    </template>
  </div>
</template>

<style scoped>
#game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  gap: var(--spacing-lg);
}

.game-header {
  text-align: center;
}

.game-header h1 {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.game-header .subtitle {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 2px;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.start-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  margin-top: 60px;
}

.start-desc {
  color: var(--color-text-muted);
  font-size: 1.05rem;
}

.start-btn {
  padding: 14px 40px;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-alt));
  color: white;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
}

.start-btn:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.game-board-area {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
