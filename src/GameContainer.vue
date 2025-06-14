<template>
    <h3 v-if="hasWon">Bravo ! Vous avez complété la grille !</h3>
    <div id="GAME-CONTAINER" :style="containerOffset">
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
        

        <!-- Clues -->
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
        <!-- Global column of rows clues -->
        <div id="ROWS-CLUES">
            <!-- Representing a "single row" clues -->
            <div class="single-row-clues" v-for="singleRowClues of rowsClues" :style="singleRowCluesStyle">
                <!-- Each clue of this column, written in row -->
                <div class="clue" v-for="clue of singleRowClues" :style="clueStyle">
                    {{ clue }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
/* Imports, props and emits */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import FillingType from './FillingType';

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

// Clues to display on the left and at the top of the grid
const rowsClues = computed(() => {
    let clues = [];
    for (let j = 0; j < level.value.height; j++) {
        let rowClues = [];
        let currentClueLength = 0;
        for (let i = 0; i < level.value.width; i++) {
            let cell = level.value.grid[coordsToIndex(i,j)];
            if (cell === FillingType.empty && currentClueLength>0) {
                rowClues.push(currentClueLength);
                currentClueLength = 0;
            } else if (cell === FillingType.fill) {
                currentClueLength++;
                if (i === level.value.width - 1) rowClues.push(currentClueLength)
            }
        }
        clues.push(rowClues)
    }
    console.log("The rows clues are :",clues)
    return clues;
})

const columnsClues = computed(() => {
    let clues = [];
    for (let i = 0; i < level.value.width; i++) {
        let columnClues = [];
        let currentClueLength = 0;
        for (let j = 0; j < level.value.height; j++) {
            let cell = level.value.grid[coordsToIndex(i,j)];
            // If the cell is filled (1), we add 1 to the current clue length
            if (cell === FillingType.empty && currentClueLength>0) {
                columnClues.push(currentClueLength);
                currentClueLength = 0;
            } else if (cell === FillingType.fill) {
                currentClueLength++;
                if (j === level.value.height - 1) columnClues.push(currentClueLength)
            }
        }
        clues.push(columnClues)
    }
    console.log("The columns clues are :",clues)
    return clues;
})

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
    if(filling !== null && currentInteraction.actualModifiableType == formerValue) 
        levelResolution.value[index] = filling;
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
        console.log("First cell :", currentInteraction.firstCell);
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

// Winning condition
const hasWon = computed(() => {
    if (level.value.grid == null || levelResolution.value == null) return false;
    // Computes the distance between level.value.grid and levelResolution.value 
    // (i.e.) the number of cells that are not filled correctly
    const distance = level.value.grid.reduce((acc, val, i) => {
        const resolutionVal = levelResolution.value[i];
        const increment = 
            (val === FillingType.fill && resolutionVal === FillingType.fill) 
            ||
            (val !== FillingType.fill && resolutionVal !== FillingType.fill)
            ? 0 : 1;
        return acc + increment;
    }, 0);
    return distance === 0;
})

/* For the onMounted() method */

onMounted(() => {
    import(`@/assets/${props.levelNb}.json`)
    .then((module) => {
        level.value = module.default;
        levelResolution.value = Array.from(
        { length: level.value.width * level.value.height },
        () => FillingType.empty
        );
        console.log('Level resolution is :', levelResolution.value);
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

// The grid decoration lines dimensions
const lineWidth = ref(4); // Width of the grid lines

const gridVLinesStyle = (i) => {
    return {
        left: `${i * props.cellSize - lineWidth.value/2}px`,
        width: lineWidth.value + 'px',
        height: `100%`,
    }
}

const gridHLinesStyle = (j) => {
    return {
        top: `${j * props.cellSize - lineWidth.value/2}px`,
        width: `100%`,
        height: lineWidth.value + 'px',
    }
}

// TO DO NEXT
// Display the grid lines with lines every x steps (4 for 12x12, 5 for 10x10, 15x15 or 20x20)

// The clues dimensions

const singleColumnCluesStyle = computed(() => {
    return {
        width: `${props.cellSize}px`,
        height: 'min-content',
    }
})

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

/* For the clues to the left and at the top of the grid */
/* For the columns clues */
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

/* For the rows clues */
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