<template>
    <div id="GRID-LINES">
    <!-- Vertical lines -->        
        <template v-for="i in Array.from({ length: level.width + 1 }, (_, i) => i)">
            <div class="grid-v-line" :style="gridVLinesStyle(i)"></div>
        </template>
    <!-- Horizontal lines -->
        <template v-for="j in Array.from({ length: level.height + 1 }, (_, j) => j)">
            <div class="grid-h-line" :style="gridHLinesStyle(j)"></div>
        </template>
    </div>
</template>

<script setup>

import { ref, computed } from 'vue';

const props = defineProps({
    level: Object,
    cellSize: Number,
    gridLinesSteps: Object
})

// The grid decoration lines dimensions
const defaultLineWidth = computed(() => {
    return Math.max(Math.floor(props.cellSize/10), 1)
})

const gridVLinesStyle = (i) => {
    const isBig = (i % props.gridLinesSteps.horizontal == 0)
    const factor = isBig ? 2 : 1
    const actualWidth = factor * defaultLineWidth.value
    const actualColor = isBig ? 'black' : 'gray'
    const zIndex = isBig ? 2 : 1
    return {
        left: `${i * props.cellSize - actualWidth/2}px`,
        width: actualWidth + 'px',
        height: (props.level.height * props.cellSize + actualWidth) + 'px',
        backgroundColor: actualColor,
        zIndex : zIndex
    }
}

const gridHLinesStyle = (j) => {
    const isBig = (j % props.gridLinesSteps.horizontal == 0)
    const factor = isBig ? 2 : 1
    const actualWidth = factor * defaultLineWidth.value
    const actualColor = isBig ? 'black' : 'gray'
    const zIndex = isBig ? 2 : 1
    return {
        top: `${j * props.cellSize - actualWidth/2}px`,
        width: (props.level.width * props.cellSize + actualWidth) + 'px',
        height: actualWidth + 'px',
        backgroundColor: actualColor,
        zIndex : zIndex
    }
}

</script>

<style>

/* For the decoration lines */
#GRID-LINES {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    display: flex;
    justify-content: center;
    align-items: center;
}

.grid-v-line, .grid-h-line {
    position: absolute;

    /* To prevent from dragging */
    pointer-events: none;
}

</style>