import { describe, vi, it, expect } from 'vitest'
import { useAuth } from '../useAuth'
import { FirebaseError } from 'firebase/app'

const mockUseUser = vi.hoisted(() => ({
  getUserByEmail: vi.fn(),
  addUser: vi.fn()
}))

const mockAuth = vi.hoisted(() => ({
  signInWithEmailAndPassword: vi.fn()
}))

vi.mock('@/modules/repository/implementation/firebase/firebase', () => {
  return {
    auth: vi.fn(() => ({}))
  }
})

vi.mock('firebase/auth', () => {
  return mockAuth
})

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => {
    return {
      login: vi.fn()
    }
  }
}))

vi.mock('@/composables/useUser', () => ({
  useUser: () => {
    return {
      getUserByEmail: mockUseUser.getUserByEmail,
      addUser: mockUseUser.addUser
    }
  }
}))

// Resolve issue with the "signInWithEmailAndPassword" method's call

describe('useAuth composable tests', () => {
  describe('onLogin tests', () => {
    it('when useUser getUserByEmail then result of onLogin is false', async () => {
      const { onLogin, error } = useAuth()

      mockUseUser.getUserByEmail.mockImplementationOnce(() => {
        null
      })

      const loginResult = await onLogin('login_test@test.test', 'TestPassword123$')

      expect(loginResult).toBeFalsy()
      expect(error.value).not.toBeUndefined()
    })

    it('when useUser throw error then return value of onLogin is false', async () => {
      const { onLogin, error } = useAuth()

      mockUseUser.getUserByEmail.mockImplementationOnce(() => {
        throw new Error('Test error')
      })

      const loginResult = await onLogin('login_test@test.test', 'TestPassword123$')

      expect(loginResult).toBeFalsy()
      expect(error.value).not.toBeUndefined()
    })

    it("when useUser doesn't throw any error and firebase auth too then return value of onlogin is true", async () => {
      const { onLogin, error } = useAuth()

      mockUseUser.getUserByEmail.mockImplementationOnce(() => vi.fn())

      const loginResult = await onLogin('login_test@test.test', 'TestPassword123$')

      expect(loginResult).toBeTruthy()
      expect(error.value).toBeUndefined()
    })

    it('when firebase auth fail then error is not undefined and onlogin return false', async () => {
      const { onLogin, error } = useAuth()

      mockAuth.signInWithEmailAndPassword.mockImplementationOnce(() => {
        throw new FirebaseError('error', 'Test error')
      })

      const loginResult = await onLogin('login_test@test.test', 'TestPassword123$')

      expect(loginResult).toBeFalsy()
      expect(error.value).not.toBeUndefined()
    })
  })
})
