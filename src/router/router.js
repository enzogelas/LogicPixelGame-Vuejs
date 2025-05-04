// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Menu from '../Menu.vue'
import LevelPanel from '../LevelPanel.vue'
import Level from '../Level.vue'

const routes = [
  { path: '/', name: 'Menu', component: Menu },
  { path: '/levels', name: 'Levels', component: LevelPanel },
  { path: '/level/:levelNb', name: 'Level', component: Level, props: route => ({ levelNb: parseInt(route.params.levelNb) })  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
