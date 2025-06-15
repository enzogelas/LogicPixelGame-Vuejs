<template>
    <div id="MAIN-DIV">
        <h2>Level {{ levelNb }}</h2>
        <GridSizeChooser v-model="cellSize" :min="16" :max="64"/>
        
        <FillingTypeChooser v-model="chosenFillingType" :cellSize="cellSize"/>
        
        <GameContainer :levelNb="props.levelNb" :chosenFillingType="chosenFillingType" :cellSize="cellSize"/>
    </div>
</template>

<script setup>

/* Imports, props and emits */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import FillingType from '@/FillingType';
import GridSizeChooser from './level_components/GridSizeChooser.vue';
import FillingTypeChooser from './level_components/FillingTypeChooser.vue'
import GameContainer from './level_components/GameContainer.vue'

const props = defineProps({
    levelNb : Number,
}) 

/* Global variables */

// The filling action type chosen by the user
const chosenFillingType = ref(FillingType.fill); // 'fill' or 'cross' : to fill the cells with 1 or 0

// Default cell size
const cellSize = ref(32); 

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
</style>