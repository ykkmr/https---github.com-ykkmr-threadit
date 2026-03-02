<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import GuestbookItem from '@/components/guestbook/GuestbookItem.vue'
import GuestbookForm from '@/components/guestbook/GuestbookForm.vue'
import AdSlot from '@/components/common/AdSlot.vue'
import { useAuthStore } from '@/stores/auth.js'
import { useUIStore } from '@/stores/ui.js'
import { getProfile, getGuestbook, writeGuestbook, deleteGuestbookEntry } from '@/api/index.js'

const route = useRoute()
const auth = useAuthStore()
const ui = useUIStore()

const profile = ref(null)
const guestbook = ref([])
const showForm = ref(false)
const replyTargetId = ref(null)
const loading = ref(true)
const error = ref('')

const profileUserId = Number(route.params.userId)

onMounted(async () => {
  try {
    const [profileRes, gbRes] = await Promise.all([
      getProfile(profileUserId),
      getGuestbook(profileUserId),
    ])
    profile.value = profileRes.data
    guestbook.value = gbRes.data.data ?? []
  } catch (e) {
    error.value = e.response?.data?.error || '프로필을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})

async function onGuestbookCreated({ content, isSecret, parentId }) {
  // 낙관적 업데이트
  const optimistic = {
    id: Date.now(),
    writer_id: auth.user.id,
    username: auth.user.username,
    content,
    is_secret: isSecret,
    parent_id: parentId ?? null,
    created_at: new Date().toISOString(),
    reply: null,
  }

  if (parentId) {
    const root = guestbook.value.find(e => e.id === parentId)
    if (root) root.reply = optimistic
  } else {
    guestbook.value.unshift(optimistic)
  }
  showForm.value = false
  replyTargetId.value = null

  try {
    await writeGuestbook(profileUserId, { content, isSecret, parentId })
  } catch {
    // 롤백
    if (parentId) {
      const root = guestbook.value.find(e => e.id === parentId)
      if (root) root.reply = null
    } else {
      guestbook.value = guestbook.value.filter(e => e.id !== optimistic.id)
    }
    ui.showSyncError()
  }
}

async function onDelete(id) {
  const prev = [...guestbook.value]
  guestbook.value = guestbook.value.filter(e => e.id !== id)
  try {
    await deleteGuestbookEntry(id)
  } catch {
    guestbook.value = prev
    ui.showSyncError()
  }
}

const formatDate = (d) => new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
</script>

<template>
  <div class="profile-layout">
    <main class="profile-main">
      <div v-if="loading" class="status">불러오는 중...</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <template v-else>
        <!-- 프로필 헤더 -->
        <div class="profile-header">
          <div class="avatar">{{ profile.username[0].toUpperCase() }}</div>
          <div>
            <p class="username">@{{ profile.username }}</p>
            <p class="joined">{{ formatDate(profile.createdAt) }} 가입</p>
          </div>
        </div>

        <!-- 방명록 섹션 -->
        <section class="guestbook-section">
          <h2>방명록</h2>

          <GuestbookForm
            v-if="showForm && !replyTargetId"
            @created="onGuestbookCreated"
            @cancel="showForm = false"
          />
          <button v-else-if="auth.isLoggedIn" class="write-btn" @click="showForm = true">
            + 방명록 남기기
          </button>

          <div v-if="!guestbook.length" class="status">아직 방명록이 없습니다.</div>

          <GuestbookItem
            v-for="entry in guestbook.filter(e => !e.parent_id)"
            :key="entry.id"
            :entry="entry"
            :profile-user-id="profileUserId"
            @delete="onDelete"
            @reply="id => { replyTargetId = id; showForm = true }"
          />
          <GuestbookForm
            v-if="showForm && replyTargetId"
            :parent-id="replyTargetId"
            placeholder="답글을 남겨보세요..."
            @created="onGuestbookCreated"
            @cancel="() => { showForm = false; replyTargetId = null }"
          />
        </section>
      </template>
    </main>

    <!-- 사이드 광고 -->
    <aside class="sidebar">
      <AdSlot min-height="250px" />
    </aside>
  </div>
</template>

<style scoped>
.profile-layout {
  display: flex;
  gap: 24px;
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px;
}
.profile-main { flex: 1; min-width: 0; }
.sidebar { width: 300px; flex-shrink: 0; }

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 24px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e8e8e8;
}
.avatar {
  width: 56px;
  height: 56px;
  background: #1a1a1a;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  flex-shrink: 0;
}
.username { font-size: 18px; font-weight: 700; }
.joined { font-size: 13px; color: #aaa; margin-top: 2px; }

.guestbook-section h2 { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
.write-btn {
  width: 100%;
  padding: 10px;
  border: 1px dashed #ddd;
  border-radius: 12px;
  background: none;
  font-size: 14px;
  color: #888;
  cursor: pointer;
  margin-bottom: 16px;
}
.write-btn:hover { border-color: #aaa; color: #555; }
.status { text-align: center; padding: 40px; color: #aaa; font-size: 14px; }
.error { text-align: center; padding: 40px; color: #e00; font-size: 14px; }

@media (max-width: 680px) { .sidebar { display: none; } }
</style>
