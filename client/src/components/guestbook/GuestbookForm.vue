<!-- PERIPHERAL_FEATURES.md §3 — 방명록 작성 폼
     - 텍스트/이모지만 허용, 미디어 업로드 제한
     - is_secret 비밀글 체크박스
-->
<script setup>
import { ref } from 'vue'

const props = defineProps({
  parentId: { type: Number, default: null },
  placeholder: { type: String, default: '방명록을 남겨보세요 :)' },
})

const emit = defineEmits(['created', 'cancel'])

const content = ref('')
const isSecret = ref(false)
const loading = ref(false)

async function submit() {
  if (!content.value.trim()) return
  loading.value = true
  try {
    emit('created', { content: content.value.trim(), isSecret: isSecret.value, parentId: props.parentId })
    content.value = ''
    isSecret.value = false
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="gb-form" @submit.prevent="submit">
    <textarea
      v-model="content"
      :placeholder="placeholder"
      rows="2"
      maxlength="500"
    />
    <div class="form-footer">
      <label class="secret-label">
        <input v-model="isSecret" type="checkbox" />
        비밀글
      </label>
      <div class="btns">
        <button type="button" class="cancel-btn" @click="emit('cancel')">취소</button>
        <button type="submit" :disabled="loading || !content.trim()">
          {{ parentId ? '답글' : '등록' }}
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.gb-form { background: #f8f8f8; border-radius: 12px; padding: 12px; }
textarea { width: 100%; border: none; background: transparent; outline: none; resize: none; font-size: 14px; font-family: inherit; }
.form-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
.secret-label { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #666; cursor: pointer; }
.btns { display: flex; gap: 8px; }
.cancel-btn { padding: 5px 12px; background: none; border: 1px solid #ddd; border-radius: 20px; font-size: 13px; cursor: pointer; }
button[type="submit"] { padding: 5px 14px; background: #1a1a1a; color: #fff; border: none; border-radius: 20px; font-size: 13px; }
button:disabled { opacity: 0.4; }
</style>
