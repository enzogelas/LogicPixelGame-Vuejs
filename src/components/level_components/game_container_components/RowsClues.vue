<template>
    <div id="ROWS-CLUES">
        <!-- Representing a "single row" clues -->
        <div class="single-row-clues" v-for="singleRowClues of rowsClues" :style="singleRowCluesStyle">
            <!-- Each clue of this column, written in row -->
            <div class="clue" v-for="clue of singleRowClues" :style="clueStyle">
                {{ clue }}
            </div>
        </div>
    </div>
</template>

<script setup>

import { computed } from 'vue';

const props = defineProps({
    rowsClues: Array,
    cellSize: Number
})

// Function to get the index of a cell in the grid
// based on its x and y coordinates
const coordsToIndex = (x,y) => {
    return y * props.level.width + x;
}
// And inversely, to get the coordinates of a cell based on its index
const horizontalIdx = (idx) => {
    return idx % props.level.width;
}

const verticalIdx = (idx) => {
    return Math.floor(idx / props.level.width);
}

const indexToCoords = (idx) => {
    return {
        x: horizontalIdx(idx),
        y: verticalIdx(idx)
    }
}

const singleRowCluesStyle = computed(() => {
    return {
        height: `${props.cellSize}px`,
        width: 'min-content',
    }
})

const clueStyle = computed(() => {
    return {
        width: `${props.cellSize}px`,
        height: `${props.cellSize}px`,
    }
})

</script>

<style>

#ROWS-CLUES {
    position: absolute;
    top: 0;
    left: 0;
    transform: translateX(-100%);

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    height: 100%;
}

.single-row-clues {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 0px;
}

.clue {
    display: flex;
    justify-content: center;
    align-items: center;
}

</style>