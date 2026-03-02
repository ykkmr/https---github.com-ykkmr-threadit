import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import HomeView from '../views/HomeView.vue'
import ThreadView from '../views/ThreadView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'
import SearchView from '../views/SearchView.vue'
import HashtagView from '../views/HashtagView.vue'

const authOnly = (to, from, next) => {
  const auth = useAuthStore()
  auth.isLoggedIn ? next() : next('/login')
}

const guestOnly = (to, from, next) => {
  const auth = useAuthStore()
  auth.isLoggedIn ? next('/') : next()
}

const routes = [
  { path: '/',                  component: HomeView },
  { path: '/thread/:id',        component: ThreadView },
  { path: '/login',             component: LoginView,    beforeEnter: guestOnly },
  { path: '/register',          component: RegisterView, beforeEnter: guestOnly },
  { path: '/profile/:userId',   component: ProfileView },
  { path: '/search',            component: SearchView },
  { path: '/hashtag/:name',     component: HashtagView },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
