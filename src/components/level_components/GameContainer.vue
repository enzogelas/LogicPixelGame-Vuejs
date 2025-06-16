<template>
    <GameSolved v-if="hasWon" :level="level" :cellSize="cellSize"/>
    <div v-else id="GAME-CONTAINER" :style="containerOffset">
        <!-- Game grid -->
        <div id="GAME-GRID" 
            :style="gridStyle"
            @mouseup="lostMouseTrack"
            @mouseleave="lostMouseTrack"
            draggable="false"
            >
            <template v-for="(_, index) of level.grid">
                <div 
                class="cell" 
                :style="cellStyle(index)"
                @mousedown="cellPress(index)"
                @mouseenter="cellEnter(index)"

                @dragstart.prevent
                draggable="false"
                >              
                </div>
            </template>
        </div>

        <!-- Decoration grid lines -->
        <GridLines :level="level" :cellSize="props.cellSize" :gridLinesSteps="gridLinesStep"/> 

        <!-- Clues -->      
        <ColumnsClues :columnsClues="columnsClues" :cellSize="props.cellSize"/>
        <RowsClues :rowsClues="rowsClues" :cellSize="cellSize"/>

    </div>
</template>

<script setup>
/* Imports, props and emits */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import FillingType from '@/FillingType';
import ColumnsClues from './game_container_components/ColumnsClues.vue';
import RowsClues from './game_container_components/RowsClues.vue';
import GridLines from './game_container_components/GridLines.vue';
import GameSolved from './GameSolved.vue';

const props = defineProps({
    levelNb : Number,
    cellSize : Number,
    chosenFillingType : Number
}) 

/* Game logic */

// The level to solve
const level = ref({})

// The actual resolution of the level
const levelResolution = ref([]);

// Function to get the index of a cell in the grid
// based on its x and y coordinates
const coordsToIndex = (x,y) => {
    return y * level.value.width + x;
}
// And inversely, to get the coordinates of a cell based on its index
const horizontalIdx = (idx) => {
    return idx % level.value.width;
}

const verticalIdx = (idx) => {
    return Math.floor(idx / level.value.width);
}

const indexToCoords = (idx) => {
    return {
        x: horizontalIdx(idx),
        y: verticalIdx(idx)
    }
}

const oneColumnClue = (column) => {
    let columnClues = [];
    let currentClueLength = 0;
    for (let j = 0; j < level.value.height; j++) {
        let cell = level.value.grid[coordsToIndex(column,j)];
        // If the cell is filled (1), we add 1 to the current clue length
        if (cell === FillingType.empty && currentClueLength>0) {
            columnClues.push(currentClueLength);
            currentClueLength = 0;
        } else if (cell === FillingType.fill) {
            currentClueLength++;
            if (j === level.value.height - 1) columnClues.push(currentClueLength)
        }
    }
    return columnClues
}

const oneRowClue = (row) => {
    let rowClues = [];
    let currentClueLength = 0;
    for (let i = 0; i < level.value.width; i++) {
        let cell = level.value.grid[coordsToIndex(i,row)];
        if (cell === FillingType.empty && currentClueLength>0) {
            rowClues.push(currentClueLength);
            currentClueLength = 0;
        } else if (cell === FillingType.fill) {
            currentClueLength++;
            if (i === level.value.width - 1) rowClues.push(currentClueLength)
        }
    }
    return rowClues
}

// To compute the columns and rows clues
const columnsClues = computed(() => {
    let clues = [];
    for (let i = 0; i < level.value.width; i++) {
        clues.push(oneColumnClue(i));
    }
    console.log("The columns clues are :",clues)
    return clues;
})

// Clues to display on the left and at the top of the grid
const rowsClues = computed(() => {
    let clues = [];
    for (let j = 0; j < level.value.height; j++) {
        clues.push(oneRowClue(j));
    }
    console.log("The rows clues are :",clues)
    return clues;
})

// To compute the configuration of a row/column (like clue, but for levelresolution)
const oneColumnResolution = (column) => {
    let columnResolution = [];
    let currentResolutionLength = 0;
    for (let j = 0; j < level.value.height; j++) {
        let cell = levelResolution.value[coordsToIndex(column,j)];
        // If the cell is filled (1), we add 1 to the current clue length
        if (cell === FillingType.empty && currentResolutionLength>0) {
            columnResolution.push(currentResolutionLength);
            currentResolutionLength = 0;
        } else if (cell === FillingType.fill) {
            currentResolutionLength++;
            if (j === level.value.height - 1) columnResolution.push(currentResolutionLength)
        }
    }
    return columnResolution
}

const oneRowResolution = (row) => {
    let rowResolution = [];
    let currentResolutionLength = 0;
    for (let i = 0; i < level.value.width; i++) {
        let cell = levelResolution.value[coordsToIndex(i,row)];
        if (cell === FillingType.empty && currentResolutionLength>0) {
            rowResolution.push(currentResolutionLength);
            currentResolutionLength = 0;
        } else if (cell === FillingType.fill) {
            currentResolutionLength++;
            if (i === level.value.width - 1) rowResolution.push(currentResolutionLength)
        }
    }
    return rowResolution
}

const columnsCorrespondances = ref([]);
const rowsCorrecpondances = ref([]);

const checkColumnCorrespondance = (column) => {
    if (level.value.grid == null || levelResolution.value == null) return false;
    const columnResolution = oneColumnResolution(column);
    const columnClue = columnsClues.value[column];
    if (columnResolution.length !== columnClue.length) return false;
    for (let i = 0; i < columnResolution.length; i++) {
        if (columnResolution[i] !== columnClue[i]) return false;
    }
    return true;
}

const checkRowCorrespondance = (row) => {
    if (level.value.grid == null || levelResolution.value == null) return false;
    const rowResolution = oneRowResolution(row);
    const rowClue = rowsClues.value[row];
    if (rowResolution.length !== rowClue.length) return false;
    for (let i = 0; i < rowResolution.length; i++) {
        if (rowResolution[i] !== rowClue[i]) return false;
    }
    return true;
}

const updateColumnCorrespondance = (column) => { columnsCorrespondances.value[column] = checkColumnCorrespondance(column); }
const updateRowCorrespondance = (row) => { rowsCorrecpondances.value[row] = checkRowCorrespondance(row); }

const updateAllCorrespondances = () => {
    for (let i = 0; i < level.value.width; i++) {
        updateColumnCorrespondance(i);
    }
    for (let j = 0; j < level.value.height; j++) {
        updateRowCorrespondance(j);
    }
}

// Winning condition
const hasWon = computed(() => {
    if (level.value.grid == null || levelResolution.value == null) return false;
    // Check if all columns and rows correspondances match the resolution
    for (let i = 0; i < level.value.width; i++) {
        if (!columnsCorrespondances.value[i]) {
            return false;
        }
    }
    for (let j = 0; j < level.value.height; j++) {
        if (!rowsCorrecpondances.value[j]) {
            return false;
        }
    }
    return true;
})

// To interact with cells
const currentInteraction = {
    state: 'none', // 'none', 'one', 'multiple' : At which step of the interaction are we
    actualFillingType: FillingType.fill, // Different than chosenFillingType because we can empty
    actualModifiableType: FillingType.empty, // Type that can be modified
    // ONLY for state 'one'
    firstCell: {x: -1, y: -1}, // The first cell we clicked on : will determine the possible column and row to fill
    // ONLY for state 'multiple'
    direction: 'none', // 'undefined', 'horizontal', 'vertical'
    directionIndex: -1, // The index of the direction we are going to fill (row or column)
}

const resetCurrentInteraction = () => {   
    currentInteraction.state = 'none';
    currentInteraction.actualFillingType = FillingType.fill;
    currentInteraction.actualModifiableType = FillingType.empty;
    currentInteraction.firstCell = {x: -1, y: -1};
    currentInteraction.direction = 'none';
    currentInteraction.directionIndex = -1;    
}

// Change the cell value
const changeCellValue = (index, filling) => {
    const formerValue = levelResolution.value[index];
    if(filling !== null && currentInteraction.actualModifiableType == formerValue) {
        levelResolution.value[index] = filling;

        // Update the correspondance of the column and row of the cell
        const cell = indexToCoords(index);
        updateColumnCorrespondance(cell.x);
        updateRowCorrespondance(cell.y);
    }
}

// Computes the correct filling depending on user choice and clicked cell
const decideActualFillingType = (firstCellValue) => {
    if (props.chosenFillingType == FillingType.fill){
        if (firstCellValue == FillingType.empty) return FillingType.fill;
        else if (firstCellValue == FillingType.fill) return FillingType.empty;
        else if (firstCellValue == FillingType.cross) return null;
    } else if (props.chosenFillingType == FillingType.cross) {
        if (firstCellValue == FillingType.empty) return FillingType.cross;
        else if (firstCellValue == FillingType.fill) return null;
        else if (firstCellValue == FillingType.cross) return FillingType.empty;
    } else {
        console.error("Problem in chosenFillingType : value not allowed =>", props.chosenFillingType)
    }
}

const editCell = (index) => {
    const cell = indexToCoords(index);
    if (currentInteraction.state == 'none') {
        currentInteraction.state = 'one';
        currentInteraction.actualFillingType = decideActualFillingType(levelResolution.value[index]);
        currentInteraction.actualModifiableType = levelResolution.value[index];
        currentInteraction.firstCell = cell;
    } else if (currentInteraction.state == 'one') {
        currentInteraction.state = 'multiple';
        const firstCell = currentInteraction.firstCell;
        if (cell.x === firstCell.x && cell.y !== firstCell.y) {
            currentInteraction.direction = 'horizontal';
            currentInteraction.directionIndex = cell.x;
        } else if (cell.x !== firstCell.x && cell.y === firstCell.y) {
            currentInteraction.direction = 'vertical';
            currentInteraction.directionIndex = cell.y;
        } else {
            currentInteraction.state = 'one';
            return; // If the user achieved to move diagonally (even if highly not probable), we stop the function here
        }
    } else if (currentInteraction.state == 'multiple') {
        // We just test if the cell is not out the direction
        if (
            (currentInteraction.direction === 'horizontal'
            && cell.x !== currentInteraction.directionIndex)
            ||
            (currentInteraction.direction === 'vertical' 
            && cell.y !== currentInteraction.directionIndex)
        ) return;
    } else {
        console.error("The interaction state is", currentInteraction.state, "which is not valid !!!");
    }
    // If the function were not stopped until here, change the cell value
    changeCellValue(index, currentInteraction.actualFillingType)
}

let mouseEditing = false;

const cellPress = (index) => {
    mouseEditing = true;
    editCell(index);
}

const cellEnter = (index) => {
    if (mouseEditing) editCell(index);    
}

const lostMouseTrack = () => {
    mouseEditing = false;
    resetCurrentInteraction();
}

/* For the onMounted() method */

onMounted(() => {
    import(`@/assets/${props.levelNb}.json`)
    .then((module) => {
        level.value = module.default;

        levelResolution.value = Array.from(
        { length: level.value.width * level.value.height },
        () => FillingType.empty
        );

        // Fill in the columns and rows correspondance arrays with false values
        for (let i = 0; i < level.value.width; i++) {
            columnsCorrespondances.value.push(false);
        }
        for (let j = 0; j < level.value.height; j++) {
            rowsCorrecpondances.value.push(false);
        }
        updateAllCorrespondances();
    })
    .catch((error) => {
        console.error('Error loading level:', error);
    });

    updateOffset();

    // Observer changes of the columns clues div to adapt the offset of the global container
    const observer = new ResizeObserver(updateOffset);
    const columnsCluesElement = document.getElementById('COLUMNS-CLUES');
    if (columnsCluesElement) {
        observer.observe(columnsCluesElement);
    }

    // Cleanup observer on unmount
    onUnmounted(() => {
        observer.disconnect();
    });
});

/* For styles */

// The offset of the container to be able to put the clues on top of it
const containerOffset = ref({});

const updateOffset = () => {
    const columnsCluesElement = document.getElementById('COLUMNS-CLUES');
    if (columnsCluesElement) {
        containerOffset.value = {
            top: `${columnsCluesElement.offsetHeight}px`,
        };
    } else {
        containerOffset.value = { top: '0px' };
    }
};

// The grid dimensions :
    // - Number of rows and columns
    // - Size of each cell (using cellSize)
const gridStyle = computed(() => {
    return {
        gridTemplateColumns: `repeat(${level.value.width}, ${props.cellSize}px)`,
        gridTemplateRows: `repeat(${level.value.height}, ${props.cellSize}px)`,
    }
})

// The cells filling depending on its state (empty, crossed, filled)
const cellStyle = (idx) => {
    const value = levelResolution.value[idx];
    switch (value) {
        case FillingType.empty:
            return {
                backgroundColor: 'transparent',
            };       
        case FillingType.fill:
            return {
                backgroundColor: 'white',
            };
        case FillingType.cross:
            return {
                backgroundColor: 'transparent',
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "80% 80%",
                backgroundImage: "url(/filling_icons/cross.png)",
            };
        default:
            return {};
    }
}

// For grid lines style
const decideModulo = (value) => {
    if (value % 5 == 0) return 5
    if (value % 4 == 0) return 4
    if (value % 3 == 0) return 3
    if (value % 2 == 0) return 2
    return 1
}

const gridLinesStep = computed(() => {
    console.log("Computed gridLinesStep for level");
    console.log("Width:", level.value.width, "Height:", level.value.height);
    console.log("Modulo horizontal:", decideModulo(level.value.width), "Modulo vertical:", decideModulo(level.value.height));
    return {
        horizontal: decideModulo(level.value.width),
        vertical: decideModulo(level.value.height)
    }
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