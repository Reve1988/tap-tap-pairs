<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  back: []
}>()

const GRID_SIZE = 20

const stageId = ref(1)
const timeLimit = ref(120)
const grid = ref<boolean[][]>(
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false))
)

const isDragging = ref(false)
const dragValue = ref(true)

const selectedCount = computed(() => {
  let count = 0
  for (const row of grid.value) {
    for (const cell of row) {
      if (cell) count++
    }
  }
  return count
})

const isValid = computed(() => selectedCount.value > 0 && selectedCount.value % 4 === 0)

// Compute actual bounding box of selected cells
const bounds = computed(() => {
  let minR = GRID_SIZE, maxR = -1, minC = GRID_SIZE, maxC = -1
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid.value[r]![c]) {
        minR = Math.min(minR, r)
        maxR = Math.max(maxR, r)
        minC = Math.min(minC, c)
        maxC = Math.max(maxC, c)
      }
    }
  }
  return { minR, maxR, minC, maxC }
})

function onCellDown(r: number, c: number) {
  isDragging.value = true
  dragValue.value = !grid.value[r]![c]
  grid.value[r]![c] = dragValue.value
}

function onCellEnter(r: number, c: number) {
  if (isDragging.value) {
    grid.value[r]![c] = dragValue.value
  }
}

function onMouseUp() {
  isDragging.value = false
}

function clearAll() {
  grid.value = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false))
}

function fillRect() {
  const cols = Math.min(6, GRID_SIZE)
  const rows = Math.min(4, GRID_SIZE)
  clearAll()
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.value[r]![c] = true
    }
  }
}

function downloadJSON() {
  if (!isValid.value) return

  const { minR, maxR, minC, maxC } = bounds.value
  const rows = maxR - minR + 1
  const cols = maxC - minC + 1

  const layout: boolean[][] = []
  for (let r = minR; r <= maxR; r++) {
    const row: boolean[] = []
    for (let c = minC; c <= maxC; c++) {
      row.push(grid.value[r]![c]!)
    }
    layout.push(row)
  }

  const stage = {
    id: stageId.value,
    cols,
    rows,
    timeLimit: timeLimit.value,
    layout,
  }

  const blob = new Blob([JSON.stringify(stage, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `stage${stageId.value}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="editor" @mouseup="onMouseUp" @mouseleave="onMouseUp">
    <header class="editor-header">
      <button class="back-btn" @click="emit('back')">← 게임으로 돌아가기</button>
      <h2>스테이지 생성자</h2>
    </header>

    <div class="editor-body">
      <div class="editor-controls">
        <div class="control-group">
          <label>스테이지 레벨</label>
          <input type="number" v-model.number="stageId" min="1" />
        </div>
        <div class="control-group">
          <label>제한 시간 (초)</label>
          <input type="number" v-model.number="timeLimit" min="10" step="10" />
        </div>
        <div class="control-group">
          <label>선택된 칸</label>
          <span class="cell-count" :class="{ invalid: selectedCount > 0 && !isValid }">
            {{ selectedCount }}칸
            <span v-if="selectedCount > 0 && !isValid" class="warn">
              (4의 배수여야 합니다)
            </span>
            <span v-if="isValid" class="ok">✓</span>
          </span>
        </div>

        <div class="control-actions">
          <button class="ctrl-btn" @click="fillRect">6×4 사각형</button>
          <button class="ctrl-btn" @click="clearAll">전체 지우기</button>
        </div>

        <button
          class="download-btn"
          :disabled="!isValid"
          @click="downloadJSON"
        >
          💾 JSON 다운로드
        </button>
      </div>

      <div class="grid-area">
        <div
          class="editor-grid"
          :style="{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }"
        >
          <div
            v-for="r in GRID_SIZE"
            :key="r"
          >
            <div
              v-for="c in GRID_SIZE"
              :key="`${r}-${c}`"
              class="grid-cell"
              :class="{ active: grid[r - 1]![c - 1] }"
              @mousedown.prevent="onCellDown(r - 1, c - 1)"
              @mouseenter="onCellEnter(r - 1, c - 1)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20px;
  user-select: none;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.editor-header h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-text);
}

.back-btn {
  padding: 6px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.back-btn:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: var(--color-text);
}

.editor-body {
  display: flex;
  gap: var(--spacing-xl);
  flex: 1;
}

.editor-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-width: 200px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-group label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.control-group input {
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 1rem;
  width: 100%;
}

.control-group input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.cell-count {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

.cell-count.invalid {
  color: var(--color-warning);
}

.cell-count .warn {
  font-size: 0.75rem;
  font-weight: 400;
}

.cell-count .ok {
  color: var(--color-success);
}

.control-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.ctrl-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  background: var(--color-surface-light);
  color: var(--color-text);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.download-btn {
  padding: 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-alt));
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-top: var(--spacing-sm);
}

.download-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.download-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.grid-area {
  flex: 1;
  display: flex;
}

.editor-grid {
  display: grid;
  gap: 1px;
  width: 600px;
  max-width: 70vw;
  aspect-ratio: 1;
}

.editor-grid > div {
  display: contents;
}

.grid-cell {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.grid-cell:hover {
  background: rgba(255, 255, 255, 0.15);
}

.grid-cell.active {
  background: #5b8def;
  border-color: #7aa5f5;
}
</style>
