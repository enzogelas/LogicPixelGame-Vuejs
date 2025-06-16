<template>
    <div id="GAME-CONTAINER"
        :style="gridStyle"
        >
        <div id="GAME-GRID"
        :style="gridStyle"
        draggable="false"
        >
            <template v-for="(_,index) of level.grid">
                <div
                class="cell"
                :style="cellColors[index]"

                @dragstart.prevent
                draggable="false"
                ></div>
            </template>
        </div>
    </div>
</template>

<script setup>
/* Imports, props*/
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    level: Object,
    cellSize: Number
})

const cellColors = ref(Array.from({ length: props.level.width * props.level.height }, () => 
({

    backgroundColor: 'transparent'
})
));

/* Styles */
// The grid dimensions :
    // - Number of rows and columns
    // - Size of each cell (using cellSize)
const gridStyle = computed(() => {
    return {
        gridTemplateColumns: `repeat(${props.level.width}, ${props.cellSize}px)`,
        gridTemplateRows: `repeat(${props.level.height}, ${props.cellSize}px)`,
    }
})

onMounted(() => {
    // Create an array of all numbers from 0 to width * height - 1
    let randomIndex = Array.from({ length: props.level.width * props.level.height }, (_, i) => i);
    // Shuffle the array
    randomIndex = randomIndex.sort(() => Math.random() - 0.5);
    let i = 0;
    const intervalId = setInterval(() => {
        if (i >= props.level.width * props.level.height) {
            console.log("The index is", i, "which is greater than the grid size", props.level.width * props.level.height);
            clearInterval(intervalId);
            return;
        }
        // Set the color of the cell at index i
        const colorIndex = props.level.solution[randomIndex[i]];
        cellColors.value[randomIndex[i]] = { backgroundColor: props.level.solutionColors[colorIndex] }; 
        i++;
    }, 10); // Change color every 100ms
})

</script>

<style>

/* The container with grid, grid decoration and clues */
#GAME-CONTAINER {
    position: relative;

    display: flex;
    flex-direction: column;
    justify-content: center;
   
   
    align-items: center;
}

/* The game grid */
#GAME-GRID {
    display: grid;
    gap: 0px;

    width: min-content;
    height: min-content; 
}

.cell {
    -webkit-user-drag: none;
    width: 100% ;
    height: 100% ;
}

</style>