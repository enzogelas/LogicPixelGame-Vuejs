<template>
    <!-- Global line of columns clues -->
    <div id="COLUMNS-CLUES"> 
        <!-- Representing a "single column" clues -->
        <div class="single-column-clues" v-for="singleColumnClues of columnsClues" :style="singleColumnCluesStyle"> 
            <!-- Each clue of this row, written in column -->
            <div class="clue" v-for="clue of singleColumnClues" :style="clueStyle">
                {{ clue }}
            </div>
        </div>
    </div>
</template>

<script setup>

import { computed } from 'vue';
import FillingType from './FillingType';

const props = defineProps({
    columnsClues: Array,
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

const singleColumnCluesStyle = computed(() => {
    return {
        width: `${props.cellSize}px`,
        height: 'min-content',
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

#COLUMNS-CLUES {
    position: absolute;
    top: 0;
    left: 0;
    transform: translateY(-100%);

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-end;
    width: 100%;
}

.single-column-clues {
    display: flex;
    flex-direction: column;
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