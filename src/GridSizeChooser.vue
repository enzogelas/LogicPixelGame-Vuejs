<template>
    <h5>Size of the grid : {{ gridSize }} (Between {{ min }} and {{ max }})</h5>
    <input type="range" v-model="gridSize" :min="min" :max="max" step="1" :style="{width: '80%', zIndex: 2}">
</template>

<script setup>
const props = defineProps({
    min: Number,
    max: Number
})

const gridSize = defineModel()
</script>