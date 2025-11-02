import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

// Mengarahkan ke file yang sudah diganti nama di folder 'views'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/views/CryptoTracker.vue')
  }
  // Semua rute tabs lama dihilangkan
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router