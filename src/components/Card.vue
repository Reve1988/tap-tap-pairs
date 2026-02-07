<script setup lang="ts">
import type { Card } from '../types'

const props = defineProps<{
  card: Card
  selected: boolean
  hinted: boolean
}>()

const emit = defineEmits<{
  click: [card: Card]
}>()
</script>

<template>
  <div
    class="card"
    :class="{
      selected: selected,
      hinted: hinted,
    }"
    @click="emit('click', card)"
  >
    <span class="card-emoji">{{ card.emoji }}</span>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--color-surface-light);
  border-radius: var(--radius-md);
  border: 2px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: transform var(--transition-fast),
              border-color var(--transition-fast),
              box-shadow var(--transition-fast);
  user-select: none;
}

.card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-md);
}

.card:active {
  transform: translateY(0) scale(0.97);
}

.card.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 12px rgba(246, 211, 101, 0.4),
              0 0 24px rgba(246, 211, 101, 0.15);
}

.card.hinted {
  border-color: var(--color-accent);
  box-shadow: 0 0 12px rgba(102, 126, 234, 0.5),
              0 0 24px rgba(102, 126, 234, 0.2);
  animation: hint-pulse 0.8s ease-in-out infinite alternate;
}

@keyframes hint-pulse {
  from { box-shadow: 0 0 8px rgba(102, 126, 234, 0.3); }
  to { box-shadow: 0 0 18px rgba(102, 126, 234, 0.6); }
}

.card-emoji {
  font-size: 1.8rem;
  line-height: 1;
}
</style>
