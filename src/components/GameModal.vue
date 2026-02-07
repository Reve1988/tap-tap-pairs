<script setup lang="ts">
import type { GameStatus } from '../types'

const props = defineProps<{
  status: GameStatus
  stage: number
  shuffles: number
}>()

const emit = defineEmits<{
  'next-stage': []
  'restart': []
  'shuffle-modal': []
}>()
</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="() => {}">
      <div class="modal" :class="status">
        <!-- Stage Clear -->
        <template v-if="status === 'stage-clear'">
          <div class="modal-icon">🎉</div>
          <h2 class="modal-title">Stage {{ stage }} Clear!</h2>
          <p class="modal-desc">잘하셨습니다! 다음 스테이지로 이동합니다.</p>
          <button class="modal-btn primary" @click="emit('next-stage')">
            다음 스테이지 →
          </button>
        </template>

        <!-- Game Clear (All stages done) -->
        <template v-if="status === 'game-clear'">
          <div class="modal-icon">🏆</div>
          <h2 class="modal-title">축하합니다!</h2>
          <p class="modal-desc">모든 스테이지를 클리어했습니다!</p>
          <button class="modal-btn primary" @click="emit('restart')">
            처음부터 다시하기
          </button>
        </template>

        <!-- Game Over -->
        <template v-if="status === 'game-over'">
          <div class="modal-icon">⏰</div>
          <h2 class="modal-title">시간 초과!</h2>
          <p class="modal-desc">제한 시간이 초과되었습니다. 다시 도전하세요!</p>
          <button class="modal-btn danger" @click="emit('restart')">
            처음부터 다시하기
          </button>
        </template>

        <!-- No Matches -->
        <template v-if="status === 'no-matches'">
          <template v-if="shuffles > 0">
            <div class="modal-icon">🔀</div>
            <h2 class="modal-title">매치 불가!</h2>
            <p class="modal-desc">가능한 매치가 없습니다. 셔플하시겠습니까?</p>
            <button class="modal-btn primary" @click="emit('shuffle-modal')">
              🔀 셔플하기 ({{ shuffles }}회 남음)
            </button>
          </template>
          <template v-else>
            <div class="modal-icon">😢</div>
            <h2 class="modal-title">매치 실패!</h2>
            <p class="modal-desc">가능한 매치가 없고 셔플 횟수도 소진되었습니다.</p>
            <button class="modal-btn danger" @click="emit('restart')">
              처음부터 다시하기
            </button>
          </template>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  z-index: 100;
  animation: fade-in 0.25s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
}

.modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl) 40px;
  background: var(--color-surface);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  text-align: center;
  min-width: 300px;
  animation: scale-in 0.3s ease;
}

@keyframes scale-in {
  from { transform: scale(0.9); opacity: 0; }
}

.modal-icon {
  font-size: 3.5rem;
  line-height: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.modal-desc {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  max-width: 260px;
}

.modal-btn {
  padding: 10px 28px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-top: var(--spacing-sm);
}

.modal-btn.primary {
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-alt));
  color: white;
}

.modal-btn.danger {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.modal-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
</style>
