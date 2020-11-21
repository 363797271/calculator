import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/installment',
      name: 'installment',
      component: () => import('../views/installment.vue')
    }
  ]
})

export default router
