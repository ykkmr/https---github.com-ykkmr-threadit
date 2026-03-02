<script setup>
import { ref } from 'vue'
import { createThread } from '../../api/index.js'
import axios from 'axios'

const props = defineProps({
  parentId: { type: Number, default: null },
  placeholder: { type: String, default: '무슨 생각을 하고 계신가요?' },
})

const emit = defineEmits(['created'])

const content = ref('')
const loading = ref(false)
const mediaFile = ref(null)       // 선택된 File 객체
const mediaPreview = ref(null)    // 미리보기 URL
const mediaType = ref(null)       // 'IMAGE' | 'VIDEO'
const fileInput = ref(null)

// FEATURE_RULES.md §3: 용량 및 포맷 제한
const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_VIDEO = ['video/mp4', 'video/webm']
const MAX_IMAGE = 5 * 1024 * 1024
const MAX_VIDEO = 50 * 1024 * 1024

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return

  const isImage = ALLOWED_IMAGE.includes(file.type)
  const isVideo = ALLOWED_VIDEO.includes(file.type)

  if (!isImage && !isVideo) {
    alert('jpeg, png, webp, mp4, webm 파일만 업로드할 수 있습니다.')
    fileInput.value.value = ''
    return
  }
  if (isImage && file.size > MAX_IMAGE) {
    alert('이미지는 최대 5MB까지 허용됩니다.')
    fileInput.value.value = ''
    return
  }
  if (isVideo && file.size > MAX_VIDEO) {
    alert('동영상은 최대 50MB까지 허용됩니다.')
    fileInput.value.value = ''
    return
  }

  mediaFile.value = file
  mediaType.value = isImage ? 'IMAGE' : 'VIDEO'
  mediaPreview.value = URL.createObjectURL(file)
}

function removeMedia() {
  mediaFile.value = null
  mediaPreview.value = null
  mediaType.value = null
  if (fileInput.value) fileInput.value.value = ''
}

async function uploadMedia() {
  if (!mediaFile.value) return null

  const formData = new FormData()
  formData.append('file', mediaFile.value)
  const token = localStorage.getItem('token')
  const { data } = await axios.post('/api/v1/media/upload', formData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return { fileUrl: data.fileUrl, mediaType: data.mediaType }
}

async function submit() {
  if (!content.value.trim()) return
  loading.value = true
  try {
    const payload = { content: content.value.trim() }
    if (props.parentId) payload.parentId = props.parentId

    // 미디어 업로드 먼저 처리
    if (mediaFile.value) {
      const uploaded = await uploadMedia()
      if (uploaded) payload.mediaUrl = uploaded.fileUrl
    }

    const { data } = await createThread(payload)
    emit('created', { id: data.id, content: payload.content, mediaUrl: payload.mediaUrl ?? null })
    content.value = ''
    removeMedia()
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

    <!-- 미디어 미리보기 -->
    <div v-if="mediaPreview" class="media-preview">
      <img v-if="mediaType === 'IMAGE'" :src="mediaPreview" alt="미리보기" />
      <video v-else :src="mediaPreview" controls />
      <button type="button" class="remove-media" @click="removeMedia">✕</button>
    </div>

    <div class="form-footer">
      <!-- 파일 첨부 버튼 -->
      <label class="attach-btn" title="사진/동영상 첨부">
        <span>📎</span>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
          style="display: none"
          @change="onFileChange"
        />
      </label>

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

.media-preview {
  position: relative;
  margin: 8px 0;
  border-radius: 8px;
  overflow: hidden;
  max-height: 240px;
  background: #000;
}
.media-preview img, .media-preview video {
  width: 100%;
  max-height: 240px;
  object-fit: contain;
  display: block;
}
.remove-media {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.form-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.attach-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.15s;
}
.attach-btn:hover { background: #f0f0f0; }

.hint { font-size: 12px; color: #ccc; margin-left: auto; }

button[type="submit"] {
  padding: 6px 16px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
}
button[type="submit"]:disabled { opacity: 0.35; }
</style>
