<script setup lang="ts">
import { computed } from 'vue'
import type { Card, Point, StageConfig } from '../types'
import CardComponent from './Card.vue'
import PathOverlay from './PathOverlay.vue'

const props = defineProps<{
  stage: StageConfig
  cards: Card[]
  selectedCards: Card[]
  hintedCards: number[]
  removingCards: number[]
  matchPath: Point[] | null
}>()

const emit = defineEmits<{
  'card-click': [card: Card]
}>()

const GAP = 6

const cellSize = computed(() => {
  const maxW = Math.min(window.innerWidth - 32, 600)
  const maxH = window.innerHeight - 200
  const cellW = Math.floor((maxW - (props.stage.cols - 1) * GAP) / props.stage.cols)
  const cellH = Math.floor((maxH - (props.stage.rows - 1) * GAP) / props.stage.rows)
  const w = Math.min(cellW, 70)
  const h = Math.min(Math.floor(w * 1.26), cellH, 88)
  return { width: w, height: h }
})

function getCard(row: number, col: number): Card | undefined {
  return props.cards.find(c => c.row === row && c.col === col && !c.removed)
}

function isRemoving(card: Card): boolean {
  return props.removingCards.includes(card.id)
}

function isSelected(card: Card): boolean {
  return props.selectedCards.some(c => c.id === card.id)
}

function isHinted(card: Card): boolean {
  return props.hintedCards.includes(card.id)
}

function isActiveCell(row: number, col: number): boolean {
  return props.stage.layout[row]?.[col] ?? false
}
</script>

<template>
  <div class="board-wrapper">
    <div
      class="board-grid"
      :style="{
        gridTemplateColumns: `repeat(${stage.cols}, ${cellSize.width}px)`,
        gridTemplateRows: `repeat(${stage.rows}, ${cellSize.height}px)`,
        gap: `${GAP}px`
      }"
    >
      <template v-for="r in stage.rows" :key="r">
        <div
          v-for="c in stage.cols"
          :key="`${r}-${c}`"
          class="cell"
          :class="{
            disabled: !isActiveCell(r - 1, c - 1),
            empty: isActiveCell(r - 1, c - 1) && !getCard(r - 1, c - 1)
          }"
        >
          <CardComponent
            v-if="isActiveCell(r - 1, c - 1) && getCard(r - 1, c - 1)"
            :card="getCard(r - 1, c - 1)!"
            :selected="isSelected(getCard(r - 1, c - 1)!)"
            :hinted="isHinted(getCard(r - 1, c - 1)!)"
            :removing="isRemoving(getCard(r - 1, c - 1)!)"
            @click="emit('card-click', getCard(r - 1, c - 1)!)"
          />
        </div>
      </template>
    </div>

    <PathOverlay
      v-if="matchPath"
      :path="matchPath"
      :rows="stage.rows"
      :cols="stage.cols"
      :cell-width="cellSize.width"
      :cell-height="cellSize.height"
      :gap="GAP"
    />
  </div>
</template>

<style scoped>
.board-wrapper {
  position: relative;
  display: inline-block;
}

.board-grid {
  display: grid;
}

.cell {
  border-radius: var(--radius-md);
}

.cell.disabled {
  visibility: hidden;
}

.cell.empty {
  background: var(--color-surface);
  border-radius: var(--radius-md);
}
</style>
