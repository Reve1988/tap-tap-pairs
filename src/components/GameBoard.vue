<script setup lang="ts">
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

const CELL_WIDTH = 70
const CELL_HEIGHT = 88
const GAP = 6

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
        gridTemplateColumns: `repeat(${stage.cols}, ${CELL_WIDTH}px)`,
        gridTemplateRows: `repeat(${stage.rows}, ${CELL_HEIGHT}px)`,
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
      :cell-width="CELL_WIDTH"
      :cell-height="CELL_HEIGHT"
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
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-md);
}
</style>
