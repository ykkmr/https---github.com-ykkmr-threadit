<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getThreadTree } from '../api/index.js'
import ThreadItem from '../components/thread/ThreadItem.vue'

const route = useRoute()
const router = useRouter()

const thread = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const { data } = await getThreadTree(route.params.id)
    thread.value = data
  } catch (e) {
    error.value = e.response?.data?.error || '스레드를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="thread-page">
    <button class="back-btn" @click="router.back()">← 뒤로</button>

    <div v-if="loading" class="status">불러오는 중...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="thread" class="tree-box">
      <ThreadItem :thread="thread" />
    </div>
  </div>
</template>

<style scoped>
.thread-page { max-width: 640px; margin: 0 auto; padding: 24px 16px; }
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;
  padding: 6px 12px;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 13px;
  color: #555;
}
.back-btn:hover { border-color: #aaa; }

.tree-box {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 16px;
}

.status, .error {
  text-align: center;
  padding: 40px;
  color: #aaa;
  font-size: 14px;
}
.error { color: #e00; }
</style>
