<script setup lang="ts">
import { ref } from 'vue'
import { useGame } from './composables/useGame'
import { useTheme } from './composables/useTheme'
import GameBoard from './components/GameBoard.vue'
import GameHUD from './components/GameHUD.vue'
import GameModal from './components/GameModal.vue'
import StageEditor from './components/StageEditor.vue'
import { Sun, Moon, SkipBack, SkipForward, Settings, Lightbulb, Shuffle } from 'lucide-vue-next'

const { currentTheme, toggleTheme } = useTheme()

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
  devPrevStage,
  shuffleFromModal,
  selectCard,
  useHint,
  useShuffle,
} = useGame()

const isDev = import.meta.env.DEV

declare const __APP_VERSION__: string
const appVersion = __APP_VERSION__

// Confirm modal
const confirmAction = ref<'hint' | 'shuffle' | null>(null)

function requestHint() {
  confirmAction.value = 'hint'
}
function requestShuffle() {
  confirmAction.value = 'shuffle'
}
function confirmUse() {
  if (confirmAction.value === 'hint') useHint()
  else if (confirmAction.value === 'shuffle') useShuffle()
  confirmAction.value = null
}
function cancelConfirm() {
  confirmAction.value = null
}
</script>

<template>
  <!-- Theme Toggle (floating) -->
  <button class="theme-float-btn" @click="toggleTheme" :title="currentTheme === 'dark' ? '라이트 모드' : '다크 모드'">
    <Sun v-if="currentTheme === 'dark'" :size="18" />
    <Moon v-else :size="18" />
  </button>

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
        @hint="requestHint"
        @shuffle="requestShuffle"
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
        v-if="gameStatus === 'stage-clear' || gameStatus === 'game-clear' || gameStatus === 'game-over' || gameStatus === 'no-matches'"
        :status="gameStatus"
        :stage="currentStageNumber"
        :shuffles="shuffles"
        @next-stage="nextStage"
        @restart="restartGame"
        @shuffle-modal="shuffleFromModal"
      />
    </template>

    <!-- Confirm Modal -->
    <Teleport to="body">
      <div v-if="confirmAction" class="confirm-overlay" @click.self="cancelConfirm">
        <div class="confirm-modal">
          <div class="confirm-icon">
            <Lightbulb v-if="confirmAction === 'hint'" :size="40" />
            <Shuffle v-else :size="40" />
          </div>
          <p class="confirm-text">
            {{ confirmAction === 'hint' ? '힌트' : '셔플' }}를 사용하시겠습니까?
          </p>
          <p class="confirm-remaining">
            남은 횟수: {{ confirmAction === 'hint' ? hints : shuffles }}회
          </p>
          <div class="confirm-buttons">
            <button class="confirm-btn cancel" @click="cancelConfirm">취소</button>
            <button class="confirm-btn ok" @click="confirmUse">사용</button>
          </div>
        </div>
      </div>
    </Teleport>


    <!-- Dev-only buttons -->
    <div v-if="isDev" class="dev-buttons">
      <button class="dev-btn" @click="devPrevStage" title="이전 스테이지 (DEV)">
        <SkipBack :size="18" />
      </button>
      <button class="dev-btn" @click="devSkipStage" title="다음 스테이지 (DEV)">
        <SkipForward :size="18" />
      </button>
      <button class="dev-btn" @click="currentPage = 'editor'" title="스테이지 생성자 (DEV)">
        <Settings :size="18" />
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

.theme-float-btn {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 50;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--card-border);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.theme-float-btn:hover {
  border-color: var(--card-border-hover);
  transform: scale(1.15);
  box-shadow: var(--shadow-md);
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
  border: 1px solid var(--color-warning);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 1.1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dev-btn:hover {
  background: var(--color-surface-light);
  border-color: var(--color-warning);
  transform: scale(1.1);
}

.version-badge {
  position: fixed;
  bottom: 8px;
  right: 12px;
  font-size: 1rem;
  color: var(--color-text-muted);
  letter-spacing: 0.5px;
}

.confirm-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--modal-backdrop);
  backdrop-filter: blur(6px);
  z-index: 200;
  animation: fade-in 0.2s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.confirm-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: 32px 40px;
  background: var(--color-surface);
  border: 1px solid var(--modal-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  text-align: center;
  animation: modal-pop 0.25s ease;
}

@keyframes modal-pop {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.confirm-icon {
  color: var(--color-accent);
}

.confirm-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.confirm-remaining {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0;
}

.confirm-buttons {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.confirm-btn {
  padding: 8px 28px;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.confirm-btn.cancel {
  background: var(--color-surface-light);
  color: var(--color-text-muted);
}

.confirm-btn.cancel:hover {
  border-color: var(--card-border-hover);
  color: var(--color-text);
}

.confirm-btn.ok {
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-alt));
  color: white;
  border: none;
}

.confirm-btn.ok:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

@media (max-width: 480px) {
  #game-container {
    padding: 12px 8px;
    gap: var(--spacing-md);
  }

  .game-header h1 {
    font-size: 1.4rem;
  }

  .game-header .subtitle {
    font-size: 0.7rem;
  }

  .start-btn {
    padding: 12px 40px;
    font-size: 1rem;
  }

  .theme-float-btn {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
    top: 8px;
    right: 8px;
  }

  .confirm-modal {
    padding: 24px 28px;
    margin: 0 16px;
  }

  .confirm-text {
    font-size: 1rem;
  }

  .confirm-btn {
    padding: 8px 22px;
    font-size: 0.9rem;
  }

  .dev-buttons {
    bottom: 12px;
    right: 8px;
  }

  .dev-btn {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }

  .version-badge {
    font-size: 0.8rem;
    bottom: 4px;
    right: 8px;
  }
}
</style>
