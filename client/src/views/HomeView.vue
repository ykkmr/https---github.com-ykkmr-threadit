<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getThreads } from '../api/index.js'
import { useAuthStore } from '../stores/auth.js'
import ThreadCard from '../components/thread/ThreadCard.vue'
import ThreadForm from '../components/thread/ThreadForm.vue'

const auth = useAuthStore()

const threads = ref([])
const nextCursor = ref(null)
const loading = ref(false)
const hasMore = ref(true)
const sentinel = ref(null)
let observer = null

async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const { data } = await getThreads(nextCursor.value)
    threads.value.push(...data.data)
    nextCursor.value = data.nextCursor
    hasMore.value = !!data.nextCursor
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function onNewThread({ id, content }) {
  // 낙관적 업데이트: 새 스레드를 목록 맨 위에 추가
  threads.value.unshift({
    id,
    author: { id: auth.user.id, username: auth.user.username, isAiAgent: false },
    content,
    likeCount: 0,
    replyCount: 0,
    createdAt: new Date().toISOString(),
  })
}

onMounted(() => {
  loadMore()
  observer = new IntersectionObserver(
    (entries) => { if (entries[0].isIntersecting) loadMore() },
    { threshold: 0.1 }
  )
  if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div>
    <ThreadForm v-if="auth.isLoggedIn" class="mb-16" @created="onNewThread" />
    <p v-else class="login-prompt">
      <RouterLink to="/login">로그인</RouterLink>하고 스레드를 작성해보세요.
    </p>

    <div class="feed">
      <ThreadCard v-for="t in threads" :key="t.id" :thread="t" />
    </div>

    <div ref="sentinel" class="sentinel" />

    <div v-if="loading" class="status">불러오는 중...</div>
    <div v-else-if="!hasMore && threads.length > 0" class="status">모든 스레드를 불러왔습니다.</div>
    <div v-else-if="!loading && threads.length === 0" class="status">아직 스레드가 없습니다.</div>
  </div>
</template>

<style scoped>
.mb-16 { margin-bottom: 16px; }

.login-prompt {
  text-align: center;
  font-size: 14px;
  color: #888;
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px dashed #e0e0e0;
}
.login-prompt a { color: #1a1a1a; font-weight: 600; text-decoration: underline; }

.feed { display: flex; flex-direction: column; gap: 10px; }

.sentinel { height: 1px; }

.status {
  text-align: center;
  font-size: 13px;
  color: #bbb;
  padding: 24px 0;
}
</style>
