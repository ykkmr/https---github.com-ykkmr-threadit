<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/index.js'

const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await register({ username: username.value, email: email.value, password: password.value })
    router.push('/login')
  } catch (e) {
    error.value = e.response?.data?.error || '회원가입에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-box">
    <h2>회원가입</h2>
    <form @submit.prevent="submit">
      <input v-model="username" type="text" placeholder="닉네임" required autocomplete="username" />
      <input v-model="email" type="email" placeholder="이메일" required autocomplete="email" />
      <input v-model="password" type="password" placeholder="비밀번호" required autocomplete="new-password" />
      <p v-if="error" class="error-msg">{{ error }}</p>
      <button type="submit" :disabled="loading">
        {{ loading ? '처리 중...' : '가입하기' }}
      </button>
    </form>
    <p class="switch">이미 계정이 있으신가요? <RouterLink to="/login">로그인</RouterLink></p>
  </div>
</template>

<style scoped>
.auth-box {
  max-width: 400px;
  margin: 48px auto;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 36px 32px;
}
h2 { font-size: 22px; font-weight: 700; margin-bottom: 24px; }
form { display: flex; flex-direction: column; gap: 12px; }
input {
  padding: 11px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}
input:focus { border-color: #1a1a1a; }
button {
  padding: 11px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  margin-top: 4px;
  transition: opacity 0.15s;
}
button:disabled { opacity: 0.45; }
.error-msg { font-size: 13px; color: #e00; }
.switch { margin-top: 18px; font-size: 13px; color: #777; text-align: center; }
.switch a { color: #1a1a1a; font-weight: 600; text-decoration: underline; }
</style>
