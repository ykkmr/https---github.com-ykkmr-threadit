<!-- 유저 프로필 페이지 + 방명록 (PERIPHERAL_FEATURES.md §3)
     URL: /profile/:userId
-->
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import GuestbookItem from '../components/guestbook/GuestbookItem.vue'
import GuestbookForm from '../components/guestbook/GuestbookForm.vue'
import AdSlot from '../components/common/AdSlot.vue'
import { useAuthStore } from '../stores/auth.js'
import { useUIStore } from '../stores/ui.js'

const route = useRoute()
const auth = useAuthStore()
const ui = useUIStore()

const profile = ref(null)
const guestbook = ref([])
const showForm = ref(false)
const replyTargetId = ref(null)
const loading = ref(true)

const profileUserId = Number(route.params.userId)

onMounted(async () => {
  // TODO: GET /api/v1/users/:userId 프로필 조회
  // TODO: GET /api/v1/users/:userId/guestbook 방명록 조회
  loading.value = false
})

async function onGuestbookCreated({ content, isSecret, parentId }) {
  try {
    // TODO: POST /api/v1/users/:userId/guestbook
    // 낙관적 업데이트 후 실패 시 롤백 + ui.showSyncError()
  } catch {
    ui.showSyncError()
  } finally {
    showForm.value = false
    replyTargetId.value = null
  }
}

async function onDelete(id) {
  try {
    // TODO: DELETE /api/v1/users/guestbook/:id
    guestbook.value = guestbook.value.filter(e => e.id !== id)
  } catch {
    ui.showSyncError()
  }
}
</script>

<template>
  <div class="profile-layout">
    <main class="profile-main">
      <!-- 프로필 헤더 -->
      <div v-if="profile" class="profile-header">
        <div class="avatar">{{ profile.username[0].toUpperCase() }}</div>
        <div>
          <p class="username">@{{ profile.username }}</p>
          <p class="joined">가입일: {{ profile.createdAt }}</p>
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
          방명록 남기기
        </button>

        <div v-if="loading" class="status">불러오는 중...</div>
        <template v-else>
          <GuestbookItem
            v-for="entry in guestbook"
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
        </template>
      </section>
    </main>

    <!-- 사이드 광고 (PERIPHERAL_FEATURES.md §1) -->
    <aside class="sidebar">
      <AdSlot min-height="250px" />
    </aside>
  </div>
</template>

<style scoped>
.profile-layout { display: flex; gap: 24px; max-width: 900px; margin: 0 auto; padding: 24px 16px; }
.profile-main { flex: 1; min-width: 0; }
.sidebar { width: 300px; flex-shrink: 0; }

.profile-header { display: flex; align-items: center; gap: 16px; padding: 20px 0; border-bottom: 1px solid #e8e8e8; margin-bottom: 24px; }
.avatar { width: 56px; height: 56px; background: #1a1a1a; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; flex-shrink: 0; }
.username { font-size: 18px; font-weight: 700; }
.joined { font-size: 13px; color: #aaa; margin-top: 2px; }

.guestbook-section h2 { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
.write-btn { width: 100%; padding: 10px; border: 1px dashed #ddd; border-radius: 12px; background: none; font-size: 14px; color: #888; cursor: pointer; margin-bottom: 16px; }
.status { text-align: center; padding: 40px; color: #aaa; font-size: 14px; }

@media (max-width: 680px) { .sidebar { display: none; } }
</style>
