<template>
    <div id="FILLING-CHOOSER">
        <div class="filling-choice" id="FILLING-CHOICE-FILL" 
            @click="chosenFillingType = FillingType.fill"
            :style="{
                width: cellSize + 'px',
                height: cellSize + 'px',
                backgroundColor: 'white',
                border: chosenFillingType==FillingType.fill ? '4px solid yellow' : 'none'
            }"></div>
            <div class="filling-choice" id="FILLING-CHOICE-CROSS" 
            @click="chosenFillingType = FillingType.cross"
            :style="{
                width: cellSize + 'px',
                height: cellSize + 'px',
                backgroundColor: 'transparent',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '80% 80%',
                backgroundImage: 'url(/filling_icons/cross.png)',
                border: chosenFillingType==FillingType.cross ? '4px solid yellow' : 'none'
            }"></div>
    </div>
</template>

<script setup>
import FillingType from './FillingType';

const chosenFillingType = defineModel()

const props = defineProps({
    cellSize: Number
})
</script>

<style>
#FILLING-CHOOSER {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 20px;

    width: 80%;
    height: min-content;
}
</style>