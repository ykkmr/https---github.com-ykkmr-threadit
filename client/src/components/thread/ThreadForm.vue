<script setup>
import { ref } from 'vue'
import { createThread } from '../api/index.js'

const props = defineProps({
  parentId: { type: Number, default: null },
  placeholder: { type: String, default: '무슨 생각을 하고 계신가요?' },
})

const emit = defineEmits(['created'])

const content = ref('')
const loading = ref(false)

async function submit() {
  if (!content.value.trim()) return
  loading.value = true
  try {
    const payload = { content: content.value.trim() }
    if (props.parentId) payload.parentId = props.parentId
    const { data } = await createThread(payload)
    emit('created', { id: data.id, content: payload.content })
    content.value = ''
  } catch (e) {
    alert(e.response?.data?.error || '작성에 실패했습니다.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="thread-form" @submit.prevent="submit">
    <textarea
      v-model="content"
      :placeholder="placeholder"
      rows="3"
      @keydown.meta.enter="submit"
    />
    <div class="form-footer">
      <span class="hint">⌘ Enter</span>
      <button type="submit" :disabled="loading || !content.trim()">
        {{ loading ? '작성 중...' : parentId ? '답글 달기' : '게시' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.thread-form {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 14px 16px;
}

textarea {
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  font-size: 15px;
  font-family: inherit;
  line-height: 1.6;
  color: #1a1a1a;
  background: transparent;
}

textarea::placeholder { color: #aaa; }

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.hint { font-size: 12px; color: #ccc; }

button {
  padding: 6px 16px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
}

button:disabled { opacity: 0.35; }
</style>
