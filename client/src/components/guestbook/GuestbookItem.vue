<!-- PERIPHERAL_FEATURES.md §3 — 방명록 아이템
     - 1 Depth 구조: 원글 + 주인장 답글 1개만
     - 비밀글(is_secret): 자물쇠 아이콘, 작성자/주인장만 내용 표시
-->
<script setup>
import { useAuthStore } from '../../stores/auth.js'
import { useTimeAgo } from '../../composables/useTimeAgo.js'

const auth = useAuthStore()
const { timeAgo, exactDate } = useTimeAgo()

const props = defineProps({
  entry: { type: Object, required: true },  // { id, writer_id, username, content, is_secret, created_at, reply }
  profileUserId: { type: Number, required: true },
})

const emit = defineEmits(['delete', 'reply'])

const canView = (entry) => {
  if (!entry.is_secret) return true
  return auth.user?.id === entry.writer_id || auth.user?.id === props.profileUserId
}
</script>

<template>
  <div class="gb-item">
    <div class="gb-header">
      <span class="username">@{{ entry.username }}</span>
      <span v-if="entry.is_secret" class="secret-badge">🔒 비밀</span>
      <!-- CONTENT_AND_FILE_RULES.md: 상대시간 표기 + 마우스 오버 시 절대시간 -->
      <span class="date" :title="exactDate(entry.created_at)">{{ timeAgo(entry.created_at) }}</span>
      <button
        v-if="auth.user?.id === entry.writer_id || auth.user?.id === profileUserId"
        class="del-btn"
        @click="emit('delete', entry.id)"
      >삭제</button>
    </div>

    <p class="gb-content">
      {{ canView(entry) ? entry.content : '비밀 방명록입니다.' }}
    </p>

    <!-- 주인장 답글 (Depth 1) -->
    <div v-if="entry.reply" class="gb-reply">
      <span class="reply-label">↳ 주인장</span>
      <p>{{ entry.reply.content }}</p>
    </div>
    <button
      v-else-if="auth.user?.id === profileUserId"
      class="reply-btn"
      @click="emit('reply', entry.id)"
    >
      답글 달기
    </button>
  </div>
</template>

<style scoped>
.gb-item { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.gb-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.username { font-weight: 600; font-size: 14px; }
.secret-badge { font-size: 11px; color: #888; }
.date { font-size: 12px; color: #bbb; margin-left: auto; cursor: default; }
.del-btn { font-size: 12px; color: #e00; background: none; border: none; cursor: pointer; }
.gb-content { font-size: 14px; line-height: 1.6; }
.gb-reply { margin-top: 8px; padding: 8px 12px; background: #f8f8f8; border-radius: 8px; font-size: 13px; }
.reply-label { font-size: 11px; color: #888; margin-right: 6px; }
.reply-btn { margin-top: 6px; font-size: 13px; color: #0070f3; background: none; border: none; cursor: pointer; }
</style>
