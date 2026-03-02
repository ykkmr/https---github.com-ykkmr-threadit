import { useAuthStore } from '../stores/auth.js'
import { login as apiLogin, register as apiRegister } from '../api/index.js'

export function useAuth() {
    const auth = useAuthStore()

    async function login(email, password) {
        const { data } = await apiLogin({ email, password })
        auth.setToken(data.token)
    }

    async function register(username, email, password) {
        await apiRegister({ username, email, password })
    }

    function logout() {
        auth.clear()
    }

    return { login, register, logout, auth }
}
