<template>
    <div id="MAIN-DIV">
        <h2>Levels</h2>
        <div id="LEVELS-LIST">
            <template v-for="level of levels" :key="level.level">
                <RouterLink :to="'/level/' + level.level" v-slot="{ navigate }">
                    <button @click="navigate">{{ level.name }}</button>
                </RouterLink>
            </template>
        </div>
    </div>
     
</template>

<script setup>
import { onMounted, ref } from 'vue';

const emits = defineEmits(['goToGame'])

onMounted(() => {
    fetch('data/levels.json')
        .then(response => response.json())
        .then(data => {
            console.log('Levels data:', data);
            levels.value = data
        })
        .catch(error => {
            console.error('Error fetching levels:', error);
        });
}); 

const levels = ref([]);

</script>

<style>
.levelButton {
    width: min-content;
    height: min-content;
    /*
    white-space: nowrap;
    */
}

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

#LEVELS-LIST {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    flex-wrap: wrap;

    margin: 10px;
}
</style>