<!-- PERIPHERAL_FEATURES.md §2.1 — Global Navigation Bar
     - 상단 고정 (Sticky), z-index 관리
     - 모바일: 햄버거 Off-canvas 드로어
     - 통합 검색바 포함 (300ms 디바운싱, useSearch 활용)
-->
<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { useUIStore } from '../../stores/ui.js'

const auth = useAuthStore()
const ui = useUIStore()
const drawerOpen = ref(false)
const searchQuery = ref('')

// TODO: useSearch composable 연결 (300ms 디바운싱 자동 적용)
// TODO: 검색 히스토리 localStorage 저장/불러오기
</script>

<template>
  <header class="gnb">
    <div class="gnb-inner">
      <RouterLink class="logo" to="/">Threadit</RouterLink>

      <!-- 통합 검색바 -->
      <div class="search-wrap">
        <input
          v-model="searchQuery"
          class="search-input"
          type="text"
          placeholder="검색 (최소 2자)"
          maxlength="50"
          @input="$emit('search', searchQuery)"
        />
      </div>

      <!-- 데스크탑 메뉴 -->
      <nav class="nav-desktop">
        <RouterLink to="/">홈</RouterLink>
        <RouterLink v-if="auth.isLoggedIn" :to="`/profile/${auth.user.id}`">프로필</RouterLink>
        <RouterLink v-if="!auth.isLoggedIn" to="/login">로그인</RouterLink>
        <button v-else @click="auth.logout()">로그아웃</button>
      </nav>

      <!-- 모바일 햄버거 -->
      <button class="hamburger" @click="drawerOpen = !drawerOpen">☰</button>
    </div>

    <!-- Off-canvas 드로어 (모바일) -->
    <div v-if="drawerOpen" class="drawer" @click.self="drawerOpen = false">
      <nav class="drawer-nav">
        <RouterLink to="/" @click="drawerOpen = false">홈</RouterLink>
        <RouterLink v-if="auth.isLoggedIn" :to="`/profile/${auth.user.id}`" @click="drawerOpen = false">프로필</RouterLink>
        <RouterLink v-if="!auth.isLoggedIn" to="/login" @click="drawerOpen = false">로그인</RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.gnb {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}
.gnb-inner {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 16px;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo { font-weight: 700; font-size: 18px; color: #1a1a1a; text-decoration: none; }
.search-wrap { flex: 1; }
.search-input {
  width: 100%;
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
}
.search-input:focus { border-color: #aaa; }
.nav-desktop { display: flex; gap: 12px; align-items: center; font-size: 14px; }
.nav-desktop a { color: #444; text-decoration: none; }
.hamburger { display: none; background: none; border: none; font-size: 20px; }
.drawer {
  position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 200;
}
.drawer-nav {
  position: absolute; right: 0; top: 0; bottom: 0; width: 240px;
  background: #fff; padding: 24px 16px; display: flex; flex-direction: column; gap: 16px;
}

@media (max-width: 600px) {
  .nav-desktop { display: none; }
  .hamburger { display: block; }
}
</style>
