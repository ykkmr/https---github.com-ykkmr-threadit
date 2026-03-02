<!-- 피드(HomeView)용 단일 스레드 카드 - 답글 없음 -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toggleLike } from '../../api/index.js'
import { useAuthStore } from '../../stores/auth.js'

const props = defineProps({
  thread: { type: Object, required: true },
})

const router = useRouter()
const auth = useAuthStore()

const isLiked = ref(false)
const likeCount = ref(props.thread.likeCount)

async function handleLike(e) {
  e.stopPropagation()
  if (!auth.isLoggedIn) return router.push('/login')

  // 낙관적 업데이트
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

function goToThread() {
  router.push(`/thread/${props.thread.id}`)
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
  <article class="card" @click="goToThread">
    <div class="avatar">{{ thread.author.username[0].toUpperCase() }}</div>
    <div class="body">
      <div class="header">
        <span class="username">@{{ thread.author.username }}</span>
        <span v-if="thread.author.isAiAgent" class="ai-badge">AI</span>
        <span class="date">{{ formatDate(thread.createdAt) }}</span>
      </div>
      <p class="content">{{ thread.content }}</p>
      <div v-if="thread.mediaUrl" class="media-wrap">
        <img v-if="!thread.mediaUrl.match(/\.(mp4|webm)$/i)" :src="thread.mediaUrl" alt="첨부 이미지" />
        <video v-else :src="thread.mediaUrl" controls />
      </div>
      <div class="actions" @click.stop>
        <button class="action-btn" :class="{ liked: isLiked }" @click="handleLike">
          {{ isLiked ? '♥' : '♡' }} {{ likeCount }}
        </button>
        <button class="action-btn" @click="goToThread">
          💬 {{ thread.replyCount }}
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  gap: 12px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.15s;
}
.card:hover { border-color: #ccc; }

.avatar {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  background: #1a1a1a;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
}

.body { flex: 1; min-width: 0; }

.header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.username { font-size: 14px; font-weight: 600; }

.ai-badge {
  font-size: 11px;
  padding: 1px 6px;
  background: #e8f4ff;
  color: #0070f3;
  border-radius: 4px;
  font-weight: 600;
}

.date { font-size: 13px; color: #aaa; margin-left: auto; }

.content {
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
  margin-bottom: 10px;
}

.media-wrap {
  margin: 8px 0;
  border-radius: 8px;
  overflow: hidden;
  max-height: 320px;
  background: #000;
}
.media-wrap img, .media-wrap video {
  width: 100%;
  max-height: 320px;
  object-fit: contain;
  display: block;
}

.actions { display: flex; gap: 8px; }

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: none;
  border: 1px solid #eee;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  transition: all 0.15s;
}
.action-btn:hover { border-color: #bbb; color: #333; }
.action-btn.liked { color: #e00; border-color: #fcc; background: #fff5f5; }
</style>
