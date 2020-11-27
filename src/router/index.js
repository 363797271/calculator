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
    // 定期复利计算器
    {
      path: '/installment',
      name: 'installment',
      component: () => import('../views/installment.vue')
    },
    // 教育金年复利计算器
    {
      path: '/education',
      name: 'education',
      component: () => import('../views/education.vue')
    }
  ]
})

export default router
