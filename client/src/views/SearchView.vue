<!-- 검색 결과 페이지 (FEATURE_RULES.md §1)
     URL: /search?q=keyword
     - 300ms 디바운싱 (useSearch), 커서 기반 무한 스크롤
-->
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ThreadCard from '../components/thread/ThreadCard.vue'
import { useSearch } from '../composables/useSearch.js'

const route = useRoute()

// TODO: api/index.js 에 searchThreads 함수 추가 후 연결
const { results, loading, search } = useSearch(async (kw, cursor) => {
  const { data } = await import('../api/index.js').then(m => m.searchAll?.(kw, cursor) ?? { data: { threads: [], users: [], nextCursor: null } })
  return data
})

watch(() => route.query.q, (q) => search(q), { immediate: true })
</script>

<template>
  <div class="search-page">
    <h2 class="title">
      <span v-if="route.query.q">"{{ route.query.q }}" 검색 결과</span>
      <span v-else>검색</span>
    </h2>

    <div v-if="loading" class="status">검색 중...</div>

    <template v-else>
      <!-- 유저 결과 -->
      <section v-if="results.users.length" class="users-section">
        <h3>사용자</h3>
        <RouterLink
          v-for="u in results.users"
          :key="u.id"
          :to="`/profile/${u.id}`"
          class="user-link"
        >
          @{{ u.username }}
        </RouterLink>
      </section>

      <!-- 스레드 결과 -->
      <section class="threads-section">
        <h3>스레드</h3>
        <div v-if="!results.threads.length" class="status">검색 결과가 없습니다.</div>
        <ThreadCard v-for="t in results.threads" :key="t.id" :thread="t" />
      </section>
    </template>
  </div>
</template>

<style scoped>
.search-page { max-width: 680px; margin: 0 auto; padding: 24px 16px; }
.title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
h3 { font-size: 14px; font-weight: 600; color: #888; margin: 16px 0 8px; }
.users-section { margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 8px; }
.user-link { padding: 6px 14px; background: #f0f0f0; border-radius: 20px; font-size: 14px; text-decoration: none; color: #1a1a1a; }
.threads-section { display: flex; flex-direction: column; gap: 10px; }
.status { text-align: center; padding: 40px; color: #aaa; font-size: 14px; }
</style>
