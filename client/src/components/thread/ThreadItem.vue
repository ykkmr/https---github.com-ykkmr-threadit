<!-- 트리(ThreadView)용 재귀 컴포넌트 - MAX_DEPTH 제한 포함 -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toggleLike } from '../../api/index.js'
import { useAuthStore } from '../../stores/auth.js'
import ThreadForm from './ThreadForm.vue'
import ThreadItem from './ThreadItem.vue' // 재귀 self-import

const MAX_DEPTH = 5

const props = defineProps({
  thread: { type: Object, required: true },
})

const router = useRouter()
const auth = useAuthStore()

const isLiked = ref(false)
const likeCount = ref(props.thread.likeCount)
const showReplyForm = ref(false)
const replies = ref(props.thread.replies ?? [])

async function handleLike() {
  if (!auth.isLoggedIn) return router.push('/login')

  const prev = { isLiked: isLiked.value, likeCount: likeCount.value }
  isLiked.value = !isLiked.value
  likeCount.value += isLiked.value ? 1 : -1

  try {
    const { data } = await toggleLike(props.thread.id)
    isLiked.value = data.isLiked
    likeCount.value = data.likeCount
  } catch {
    isLiked.value = prev.isLiked
    likeCount.value = prev.likeCount
  }
}

function onReplyCreated({ id, content }) {
  // 낙관적 업데이트: 서버 응답 전에 화면에 즉시 반영
  replies.value.push({
    id,
    author: { id: auth.user.id, username: auth.user.username, isAiAgent: false },
    content,
    isDeleted: false,
    depth: props.thread.depth + 1,
    likeCount: 0,
    replyCount: 0,
    createdAt: new Date().toISOString(),
    replies: [],
  })
  showReplyForm.value = false
}

const formatDate = (dateStr) => {
  const diff = Date.now() - new Date(dateStr)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}
</script>

<template>
  <div class="thread-item">
    <div class="avatar" :class="{ deleted: thread.isDeleted }">
      {{ thread.isDeleted ? '?' : thread.author.username[0].toUpperCase() }}
    </div>
    <div class="body">
      <div class="header">
        <span class="username">
          {{ thread.isDeleted ? '알 수 없음' : `@${thread.author.username}` }}
        </span>
        <span v-if="!thread.isDeleted && thread.author.isAiAgent" class="ai-badge">AI</span>
        <span class="date">{{ formatDate(thread.createdAt) }}</span>
      </div>

      <p class="content" :class="{ deleted: thread.isDeleted }">
        {{ thread.isDeleted ? '삭제된 메시지입니다.' : thread.content }}
      </p>

      <div v-if="!thread.isDeleted" class="actions">
        <button class="action-btn" :class="{ liked: isLiked }" @click="handleLike">
          {{ isLiked ? '♥' : '♡' }} {{ likeCount }}
        </button>
        <button v-if="auth.isLoggedIn" class="action-btn" @click="showReplyForm = !showReplyForm">
          💬 답글
        </button>
      </div>

      <ThreadForm
        v-if="showReplyForm"
        :parent-id="thread.id"
        placeholder="답글을 입력하세요..."
        class="reply-form"
        @created="onReplyCreated"
      />

      <!-- 재귀 렌더링: depth가 MAX_DEPTH 미만일 때만 인라인 렌더 -->
      <div v-if="replies.length > 0" class="replies">
        <template v-if="thread.depth < MAX_DEPTH">
          <ThreadItem v-for="reply in replies" :key="reply.id" :thread="reply" />
        </template>
        <RouterLink v-else :to="`/thread/${thread.id}`" class="more-link">
          답글 {{ replies.length }}개 더 보기 →
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.thread-item {
  display: flex;
  gap: 10px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}
.thread-item:last-child { border-bottom: none; }

.avatar {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  background: #1a1a1a;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}
.avatar.deleted { background: #ccc; }

.body { flex: 1; min-width: 0; }

.header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.username { font-size: 14px; font-weight: 600; }
.ai-badge {
  font-size: 11px;
  padding: 1px 5px;
  background: #e8f4ff;
  color: #0070f3;
  border-radius: 4px;
  font-weight: 600;
}
.date { font-size: 12px; color: #bbb; margin-left: auto; }

.content { font-size: 14px; line-height: 1.6; word-break: break-word; margin-bottom: 8px; }
.content.deleted { color: #aaa; font-style: italic; }

.actions { display: flex; gap: 6px; }
.action-btn {
  padding: 3px 10px;
  background: none;
  border: 1px solid #eee;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
}
.action-btn:hover { border-color: #bbb; }
.action-btn.liked { color: #e00; border-color: #fcc; background: #fff5f5; }

.reply-form { margin-top: 10px; }

.replies {
  margin-top: 4px;
  padding-left: 16px;
  border-left: 2px solid #f0f0f0;
}

.more-link {
  display: inline-block;
  margin-top: 8px;
  font-size: 13px;
  color: #0070f3;
}
.more-link:hover { text-decoration: underline; }
</style>
