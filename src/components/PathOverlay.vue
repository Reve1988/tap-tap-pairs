<script setup lang="ts">
import { computed } from 'vue'
import type { Point } from '../types'

const props = defineProps<{
  path: Point[]
  rows: number
  cols: number
  cellWidth: number
  cellHeight: number
  gap: number
}>()

const strideX = computed(() => props.cellWidth + props.gap)
const strideY = computed(() => props.cellHeight + props.gap)

const gridWidth = computed(() =>
  props.cols * props.cellWidth + (props.cols - 1) * props.gap
)
const gridHeight = computed(() =>
  props.rows * props.cellHeight + (props.rows - 1) * props.gap
)

function toSvgX(col: number): number {
  return col * strideX.value + props.cellWidth / 2
}

function toSvgY(row: number): number {
  return row * strideY.value + props.cellHeight / 2
}

function pathPoints(): string {
  return props.path.map(p => `${toSvgX(p.col)},${toSvgY(p.row)}`).join(' ')
}
</script>

<template>
  <svg
    class="path-overlay"
    :width="gridWidth"
    :height="gridHeight"
    :viewBox="`0 0 ${gridWidth} ${gridHeight}`"
    overflow="visible"
  >
    <!-- Glow background line -->
    <polyline
      :points="pathPoints()"
      fill="none"
      stroke="rgba(246, 211, 101, 0.3)"
      stroke-width="8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- Main line -->
    <polyline
      class="path-line"
      :points="pathPoints()"
      fill="none"
      stroke="var(--color-primary)"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- Endpoints -->
    <circle
      v-for="(p, i) in [path[0], path[path.length - 1]]"
      :key="i"
      :cx="toSvgX(p.col)"
      :cy="toSvgY(p.row)"
      r="5"
      fill="var(--color-primary)"
    />
  </svg>
</template>

<style scoped>
.path-overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10;
}

.path-line {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw-path 0.35s ease-out forwards;
}

@keyframes draw-path {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
