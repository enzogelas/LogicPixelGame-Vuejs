<template>
  <header>
    <h1 id="MAIN-TITLE">Logic Pixel Game</h1>
  </header>
  <!-- The next element is the main element of the app -->
  <RouterView/>
</template>

<script setup>
import {ref} from 'vue'
import Menu from './Menu.vue'
import LevelPanel from './LevelPanel.vue'
import Level from './Level.vue'

const Mode = {
  MENU: 'menu',
  LEVELS: 'levels',
  GAME: 'game',
}

const mode = ref(Mode.MENU)

const goToLevels = () => {
  mode.value = Mode.LEVELS
}

const levelNb = ref(0);
const goToGame = (level) => {
  levelNb.value = level
  mode.value = Mode.GAME
}

</script>
ls
<style>
html, body, #app {
  height: 100%;
  width: 100%;

  max-height: none;
  max-width: none;

  margin: 0;
  padding: 0;
}

#app {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

header {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  width: 100%;
  max-width: none;

  background-color: #33790f;

  box-shadow: 0 0 10px #33790f;
}

#MAIN-TITLE {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>