<script setup lang="ts">
import { ref } from 'vue'
import { useGame } from './composables/useGame'
import GameBoard from './components/GameBoard.vue'
import GameHUD from './components/GameHUD.vue'
import GameModal from './components/GameModal.vue'
import StageEditor from './components/StageEditor.vue'

const currentPage = ref<'game' | 'editor'>('game')

const {
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
  startGame,
  nextStage,
  restartGame,
  devSkipStage,
  selectCard,
  useHint,
  useShuffle,
} = useGame()

const isDev = import.meta.env.DEV

declare const __APP_VERSION__: string
const appVersion = __APP_VERSION__
</script>

<template>
  <!-- Stage Editor (dev only) -->
  <StageEditor v-if="isDev && currentPage === 'editor'" @back="currentPage = 'game'" />

  <!-- Game -->
  <div v-else id="game-container">
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
        :stage="currentStageNumber"
        :time-left="timeLeft"
        :hints="hints"
        :shuffles="shuffles"
        @hint="useHint"
        @shuffle="useShuffle"
        @restart="restartGame"
      />

      <main class="game-board-area">
        <GameBoard
          v-if="currentStage"
          :stage="currentStage"
          :cards="cards"
          :selected-cards="selectedCards"
          :hinted-cards="hintedCards"
          :removing-cards="removingCards"
          :match-path="matchPath"
          @card-click="selectCard"
        />
      </main>

      <GameModal
        v-if="gameStatus === 'stage-clear' || gameStatus === 'game-clear' || gameStatus === 'game-over'"
        :status="gameStatus"
        :stage="currentStageNumber"
        @next-stage="nextStage"
        @restart="restartGame"
      />
    </template>

    <!-- Dev-only buttons -->
    <div v-if="isDev" class="dev-buttons">
      <button class="dev-btn" @click="devSkipStage" title="스테이지 넘기기 (DEV)">
        ⏭️
      </button>
      <button class="dev-btn" @click="currentPage = 'editor'" title="스테이지 생성자 (DEV)">
        🛠️
      </button>
    </div>

    <span class="version-badge">v{{ appVersion }}</span>
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

.dev-buttons {
  position: fixed;
  bottom: 40px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dev-btn {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 200, 0, 0.3);
  border-radius: 50%;
  background: var(--color-surface);
  font-size: 1.1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dev-btn:hover {
  background: var(--color-surface-light);
  border-color: rgba(255, 200, 0, 0.6);
  transform: scale(1.1);
}

.version-badge {
  position: fixed;
  bottom: 8px;
  right: 12px;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.2);
  letter-spacing: 0.5px;
}
</style>
