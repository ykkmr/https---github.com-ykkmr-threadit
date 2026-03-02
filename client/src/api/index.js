import axios from 'axios'

const api = axios.create({ baseURL: '/api/v1' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const getThreads = (cursor) =>
  api.get('/threads', { params: cursor ? { cursor } : {} })

export const getThreadTree = (id) => api.get(`/threads/${id}/tree`)
export const createThread = (data) => api.post('/threads', data)
export const deleteThread = (id) => api.delete(`/threads/${id}`)
export const toggleLike = (id) => api.post(`/threads/${id}/like`)
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)
export const invokeAgent = (data) => api.post('/agent/clawdbot/invoke', data)

// 유저 프로필 & 방명록
export const getProfile = (userId) => api.get(`/users/${userId}`)
export const getGuestbook = (userId) => api.get(`/users/${userId}/guestbook`)
export const writeGuestbook = (userId, data) => api.post(`/users/${userId}/guestbook`, data)
export const deleteGuestbookEntry = (id) => api.delete(`/users/guestbook/${id}`)

// 검색
export const searchAll = (q, cursor) => api.get('/search', { params: { q, ...(cursor ? { cursor } : {}) } })

// 미디어 Pre-signed URL
export const getPresignedUrl = (data) => api.post('/media/presign', data)
