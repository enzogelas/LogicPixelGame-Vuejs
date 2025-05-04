<template>
    <div id="MAIN-DIV">
        <h2>Welcome to the game</h2>
        <RouterLink to="/levels" v-slot="{ navigate }">
            <button @click="navigate">Go to levels</button>
        </RouterLink>
    </div>
</template>

<script setup>
const emits = defineEmits(['goToLevels', 'showSettings'])
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