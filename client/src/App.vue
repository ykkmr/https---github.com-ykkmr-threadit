<script setup>
import GNB from '@/components/common/GNB.vue'
import Toast from '@/components/common/Toast.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function onSearch(query) {
  if (query.length >= 2) router.push({ path: '/search', query: { q: query } })
}
</script>

<template>
  <div id="app-wrapper">
    <GNB @search="onSearch" />
    <main class="page-content">
      <RouterView />
    </main>
    <Toast />
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
/* max-width는 각 View에서 직접 제어 — ProfileView처럼 넓은 레이아웃이 필요한 페이지 대응 */
.page-content { width: 100%; }
</style>
