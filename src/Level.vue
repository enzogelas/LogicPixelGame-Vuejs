<template>
    <div id="MAIN-DIV">
        <h2>Level {{ levelNb }}</h2>
        <span>Size of the grid</span>
        <input type="range" v-model="cellSize" min="16" max="64" step="1" :style="{width: '80%', zIndex: 2}"/>
        <div id="GAME-CONTAINER" :style="containerOffset">
            <!-- Game grid -->
            <div id="GAME-GRID" 
                :style="gridStyle"
                @mouseup="lostMouseTrack"
                @mouseleave="lostMouseTrack"
                draggable="false"
                >
                <template v-for="(cell, index) of level.grid">
                    <div 
                    class="cell" 
                    :style="cellStyle(index)"
                    @mousedown="cellPressed(index)"
                    @mouseover="cellHover(index)"

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
    </div>
</template>

<script setup>

/* Imports, props and emits */

import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    levelNb : Number,
}) 

/* Logic of the game and the inputs */

// The level object containing the grid and its dimensions
const level = ref({})
const levelResolution = ref([]);

// Clues to display on the left and at the top of the grid
const rowsClues = computed(() => {
    let clues = [];
    for (let j = 0; j < level.value.height; j++) {
        let rowClues = [];
        let currentClueLength = 0;
        for (let i = 0; i < level.value.width; i++) {
            let cell = level.value.grid[idx(i,j)];
            if (cell === 0 && currentClueLength>0) {
                rowClues.push(currentClueLength);
                currentClueLength = 0;
            } else if (cell === 1) {
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
            let cell = level.value.grid[idx(i,j)];
            // If the cell is filled (1), we add 1 to the current clue length
            if (cell === 0 && currentClueLength>0) {
                columnClues.push(currentClueLength);
                currentClueLength = 0;
            } else if (cell === 1) {
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
const idx = (x,y) => {
    return y * level.value.width + x;
}
// And inversely, to get the coordinates of a cell based on its index
const horizontalIdx = (idx) => {
    return idx % level.value.width;
}

const verticalIdx = (idx) => {
    return Math.floor(idx / level.value.width);
}

// The filling action type chosen by the user
// Use ref() to reflect the choice in the template
const fillingType = ref('fill'); // 'fill' or 'cross' : to fill the cells with 1 or 0

// To interact with cells
const currentInteraction = {
    state: 'none', // 'none', 'one', 'multiple' : At which step of the interaction are we
    firstCell: {x: -1, y: -1}, // The first cell we clicked on : will determine the possible column and row to fill
    direction: 'none', // 'undefined', 'horizontal', 'vertical'
    directionIndex: -1, // The index of the direction we are going to fill (row or column)
}

const isMouseDown = ref(false);

const cellPressed = (index) => {
    isMouseDown.value = true;
    levelResolution.value[index] = 1;
}

const cellHover = (index) => {
    if (isMouseDown.value) levelResolution.value[index] = 1;
}

const lostMouseTrack = () => {
    isMouseDown.value = false;
}

/* For the onMounted() method */

onMounted(() => {
    fetch('/data/' + String(props.levelNb) + '.json')
        .then(response => {
            return response.json();
        })
        .then(data => {
            level.value = data;
            levelResolution.value = Array.from({ length: level.value.width * level.value.height }, () => -1);
            console.log('Level resolution is :', levelResolution.value);
        })
        .catch(error => {
            console.error('Error fetching levels:', error);
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

// Default cell size
const cellSize = ref(32); 

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
        gridTemplateColumns: `repeat(${level.value.width}, ${cellSize.value}px)`,
        gridTemplateRows: `repeat(${level.value.height}, ${cellSize.value}px)`,
    }
})

// The cells filling depending on its state (empty, crossed, filled)
const cellStyle = (idx) => {
    const solvingState = levelResolution.value[idx];
    switch (solvingState) {
        case -1:
            return {
                backgroundColor: 'transparent',
            };
        case 0:
            return {
                backgroundColor: 'red',
            };
        case 1:
            return {
                backgroundColor: 'white',
            };
        default:
            return {};
    }
}

// The grid decoration lines dimensions
const lineWidth = ref(4); // Width of the grid lines

const gridVLinesStyle = (i) => {
    return {
        left: `${i * cellSize.value - lineWidth.value/2}px`,
        width: lineWidth.value + 'px',
        height: `100%`,
    }
}

const gridHLinesStyle = (j) => {
    return {
        top: `${j * cellSize.value - lineWidth.value/2}px`,
        width: `100%`,
        height: lineWidth.value + 'px',
    }
}

// The clues dimensions

const singleColumnCluesStyle = computed(() => {
    return {
        width: `${cellSize.value}px`,
        height: 'min-content',
    }
})

const singleRowCluesStyle = computed(() => {
    return {
        height: `${cellSize.value}px`,
        width: 'min-content',
    }
})

const clueStyle = computed(() => {
    return {
        width: `${cellSize.value}px`,
        height: `${cellSize.value}px`,
    }
})

</script>

<style>
#MAIN-DIV {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;

    width: 100%;
    height: 100%;

    margin: 10px;
}

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