<!-- 해시태그 스레드 목록 페이지 (FEATURE_RULES.md §2)
     URL: /hashtag/:name
-->
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ThreadCard from '../components/thread/ThreadCard.vue'

const route = useRoute()
const threads = ref([])
const tagName = ref(route.params.name)
const loading = ref(true)

onMounted(async () => {
  // TODO: GET /api/v1/hashtags/:name 으로 해당 태그의 스레드 목록 조회
  loading.value = false
})
</script>

<template>
  <div class="hashtag-page">
    <h2 class="title">#{{ tagName }}</h2>

    <div v-if="loading" class="status">불러오는 중...</div>
    <template v-else>
      <div v-if="!threads.length" class="status">이 태그의 스레드가 없습니다.</div>
      <div v-else class="feed">
        <ThreadCard v-for="t in threads" :key="t.id" :thread="t" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.hashtag-page { max-width: 680px; margin: 0 auto; padding: 24px 16px; }
.title { font-size: 20px; font-weight: 700; margin-bottom: 20px; color: #0070f3; }
.feed { display: flex; flex-direction: column; gap: 10px; }
.status { text-align: center; padding: 40px; color: #aaa; font-size: 14px; }
</style>
