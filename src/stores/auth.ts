import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import User from '@/modules/model/User'

export const useAuthStore = defineStore('auth', () => {
  const authenticatedUser = ref<User>()
  const isAuthenticated = computed(() => authenticatedUser.value != undefined)
  function login(user: User) {
    authenticatedUser.value = user
  }
  function logout() {
    authenticatedUser.value = undefined
  }

  return { authenticatedUser, isAuthenticated, login, logout }
})
