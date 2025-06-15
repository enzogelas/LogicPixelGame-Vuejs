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

import { ref } from 'vue';

const props = defineProps({
    level: Object,
    cellSize: Number,
    gridLinesSteps: Object
})

// The grid decoration lines dimensions
const lineWidth = ref(4); // Width of the grid lines

const gridVLinesStyle = (i) => {
    const factor = (i % props.gridLinesSteps.horizontal == 0) ? 2 : 1
    const actualWidth = factor * lineWidth.value
    return {
        left: `${i * props.cellSize - actualWidth/2}px`,
        width: actualWidth + 'px',
        height: `100%`,
    }
}

const gridHLinesStyle = (j) => {
    const factor = (j % props.gridLinesSteps.vertical == 0) ? 2 : 1
    const actualWidth = factor * lineWidth.value
    return {
        top: `${j * props.cellSize - actualWidth/2}px`,
        width: `100%`,
        height: actualWidth + 'px',
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
}

.grid-v-line, .grid-h-line {
    position: absolute;
    background-color: black;
    z-index: 1;

    /* To prevent from dragging */
    pointer-events: none;
}

</style>