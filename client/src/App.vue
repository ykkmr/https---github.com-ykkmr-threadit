<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth.js'

const router = useRouter()
const auth = useAuthStore()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div id="app-wrapper">
    <header class="nav">
      <RouterLink to="/" class="logo">Threadit</RouterLink>
      <nav class="nav-links">
        <template v-if="auth.isLoggedIn">
          <span class="username">@{{ auth.user.username }}</span>
          <button class="btn-ghost" @click="logout">로그아웃</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="btn-ghost">로그인</RouterLink>
          <RouterLink to="/register" class="btn-solid">회원가입</RouterLink>
        </template>
      </nav>
    </header>
    <main class="page-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f2f2f2;
  color: #1a1a1a;
  line-height: 1.6;
}
a { color: inherit; text-decoration: none; }
button { cursor: pointer; font-family: inherit; }
</style>

<style scoped>
#app-wrapper { min-height: 100vh; }

.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 54px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.logo { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; }

.nav-links { display: flex; align-items: center; gap: 12px; }

.username { font-size: 14px; color: #666; }

.btn-ghost {
  padding: 6px 14px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  color: #444;
}
.btn-ghost:hover { border-color: #999; }

.btn-solid {
  padding: 6px 14px;
  background: #1a1a1a;
  color: #fff;
  border-radius: 20px;
  font-size: 14px;
}
.btn-solid:hover { background: #333; }

.page-content {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px;
}
</style>
