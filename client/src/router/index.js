import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import HomeView from '../views/HomeView.vue'
import ThreadView from '../views/ThreadView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/thread/:id', component: ThreadView },
  {
    path: '/login',
    component: LoginView,
    beforeEnter: (to, from, next) => {
      const auth = useAuthStore()
      auth.isLoggedIn ? next('/') : next()
    },
  },
  {
    path: '/register',
    component: RegisterView,
    beforeEnter: (to, from, next) => {
      const auth = useAuthStore()
      auth.isLoggedIn ? next('/') : next()
    },
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
