<script setup lang="ts">
import { Clock, Lightbulb, Shuffle, RotateCcw } from 'lucide-vue-next'
defineProps<{
  stage: number
  timeLeft: number
  hints: number
  shuffles: number
}>()

const emit = defineEmits<{
  hint: []
  shuffle: []
  restart: []
}>()

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="hud">
    <div class="hud-left">
      <span class="stage-badge">Stage {{ stage }}</span>
    </div>

    <div class="hud-center">
      <div class="timer" :class="{ warning: timeLeft <= 10 }">
        <Clock :size="16" class="timer-icon" />
        <span class="timer-text">{{ formatTime(timeLeft) }}</span>
      </div>
    </div>

    <div class="hud-right">
      <button class="hud-btn" :disabled="hints <= 0" @click="emit('hint')">
        <Lightbulb :size="16" /> <span class="btn-count">{{ hints }}</span>
      </button>
      <button class="hud-btn" :disabled="shuffles <= 0" @click="emit('shuffle')">
        <Shuffle :size="16" /> <span class="btn-count">{{ shuffles }}</span>
      </button>
      <button class="hud-btn restart-btn" @click="emit('restart')">
        <RotateCcw :size="16" /> 처음부터
      </button>
    </div>
  </div>
</template>

<style scoped>
.hud {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 560px;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow-sm);
}

.hud-left, .hud-center, .hud-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.stage-badge {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-alt));
  color: white;
  letter-spacing: 0.5px;
}

.timer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1.3rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
  transition: color var(--transition-normal);
}

.timer.warning {
  color: var(--color-danger);
  animation: timer-blink 0.5s ease-in-out infinite alternate;
}

@keyframes timer-blink {
  to { opacity: 0.5; }
}

.timer-icon {
  font-size: 1.1rem;
}

.hud-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-light);
  color: var(--color-text);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.hud-btn:hover:not(:disabled) {
  background: var(--color-surface-light);
  border-color: var(--card-border-hover);
}

.hud-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.restart-btn {
  margin-left: 4px;
  border-color: rgba(248, 113, 113, 0.25);
  font-size: 0.8rem;
}

.restart-btn:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.btn-count {
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
}
</style>
