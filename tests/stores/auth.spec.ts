import { setActivePinia, createPinia } from 'pinia'
import { describe, vi, it, expect, beforeEach } from 'vitest'
import { setUpFirebaseAuthMock } from '../test-utils/mock/firebaseAuth'

import { useAuthStore } from '../../src/stores/auth'
import { FirebaseError } from 'firebase/app'
import { setUpUseUserMock } from '../test-utils/mock/useUser'

import User from '../../src/modules/model/User'
import { nextTick } from 'vue'
import { randomUUID } from 'crypto'

const mockAuth = setUpFirebaseAuthMock()

const mockUseUser = vi.hoisted(() => ({
  getUserByEmail: vi.fn(),
  addUser: vi.fn()
}))

vi.mock('@/composables/useUser', () => ({
  useUser: () => {
    return { ...mockUseUser }
  }
}))

vi.mock('@/modules/repository/implementation/firebase/firebase', () => {
  return {
    auth: vi.fn(() => ({}))
  }
})

describe('Auth store tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('on init store empty', () => {
    const store = useAuthStore()

    expect(store.authenticatedUser).toBeUndefined()
    expect(store.isAuthenticated).toBeFalsy()
  })

  describe('user login', () => {
    it('when firebase throw error on loginWithCredentials then return string', async () => {
      // Arrange
      const store = useAuthStore()
      mockAuth.signInWithEmailAndPassword.mockRejectedValueOnce(new FirebaseError('', ''))

      // Act
      const result = await store.loginWithCredentials('', '')

      // Assert
      expect(result).toBeDefined()
    })

    it('when an unexepected error is thrown on loginWithCredentials then return string', async () => {
      // Arrange
      const store = useAuthStore()
      mockAuth.signInWithEmailAndPassword.mockRejectedValueOnce(new Error(''))

      // Act
      const result = await store.loginWithCredentials('', '')

      // Assert
      expect(result).toBeDefined()
    })

    it('when login with firebase worked but no user found in database on loginWithCredentials then return string', async () => {
      // Arrange
      const store = useAuthStore()
      mockAuth.signInWithEmailAndPassword.mockResolvedValueOnce(vi.fn())
      mockUseUser.getUserByEmail.mockResolvedValueOnce(undefined)

      // Act
      const result = await store.loginWithCredentials('', '')

      // Assert
      expect(result).toBeDefined()
    })

    it('when no error are thrown on loginWithCredentials then return undifined', async () => {
      // Arrange
      mockUseUser.getUserByEmail.mockReset()
      const userEmail = 'Coucou'
      const newUser = new User('', '', '', userEmail, '')
      const store = useAuthStore()
      mockAuth.signInWithEmailAndPassword.mockResolvedValueOnce(vi.fn())
      mockUseUser.getUserByEmail.mockResolvedValueOnce(newUser)
      // Act
      const result = await store.loginWithCredentials(userEmail, '')

      // Assert
      expect(mockUseUser.getUserByEmail).toBeCalledWith(userEmail)
      expect(result).toBeUndefined()
      expect(store.authenticatedUser).toStrictEqual(newUser)
    })
  })

  describe('waitForAuthReady', () => {
    it('restores the persisted user once firebase reports the auth state', async () => {
      // Arrange
      const restoredUser = new User('', '', '', 'restored@test.com', '')
      mockUseUser.getUserByEmail.mockResolvedValueOnce(restoredUser)
      mockAuth.onAuthStateChanged.mockImplementationOnce((_auth: unknown, cb: Function) => {
        cb({ email: 'restored@test.com' })
      })
      const store = useAuthStore()

      // Act
      await store.waitForAuthReady()

      // Assert
      expect(mockUseUser.getUserByEmail).toBeCalledWith('restored@test.com')
      expect(store.isAuthenticated).toBeTruthy()
    })

    it('stays unauthenticated when firebase has no persisted session', async () => {
      // Arrange
      mockAuth.onAuthStateChanged.mockImplementationOnce((_auth: unknown, cb: Function) => {
        cb(null)
      })
      const store = useAuthStore()

      // Act
      await store.waitForAuthReady()

      // Assert
      expect(store.isAuthenticated).toBeFalsy()
    })

    it('subscribes to firebase only once', async () => {
      // Arrange
      mockAuth.onAuthStateChanged.mockClear()
      mockAuth.onAuthStateChanged.mockImplementation((_auth: unknown, cb: Function) => {
        cb(null)
      })
      const store = useAuthStore()

      // Act
      await store.waitForAuthReady()
      await store.waitForAuthReady()

      // Assert
      expect(mockAuth.onAuthStateChanged).toHaveBeenCalledTimes(1)
    })
  })

  describe('register user', () => {
    it('When an error occured with firebase then return a string', async () => {
      // Arrange
      const store = useAuthStore()
      mockAuth.createUserWithEmailAndPassword.mockRejectedValueOnce(new FirebaseError('', ''))

      // Act
      const result = await store.register(new User('', '', '', '', ''))

      // Assert
      expect(result).toBeDefined()
    })

    it('When an unexpected error is thrown then return a string', async () => {
      // Arrange
      const store = useAuthStore()
      mockAuth.createUserWithEmailAndPassword.mockRejectedValueOnce(new Error(''))

      // Act
      const result = await store.register(new User('', '', '', '', ''))

      // Assert
      expect(result).toBeDefined()
    })

    it('when no error are thrown on loginWithCredentials then return undifined', async () => {
      // Arrange
      const userUid = randomUUID()
      const newUser = new User('', '', '', 'Coucou', '')
      const store = useAuthStore()
      mockAuth.createUserWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: userUid } })
      mockUseUser.addUser.mockResolvedValueOnce(newUser)

      // Act
      const result = await store.register(newUser)

      // Assert
      expect(result).toBeUndefined()
      expect(store.authenticatedUser.email).toBe(newUser.email)
    })
  })
})
