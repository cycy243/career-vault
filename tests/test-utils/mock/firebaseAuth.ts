import { afterEach } from 'node:test'
import { beforeAll, vi } from 'vitest'

export const setUpFirebaseAuthMock = () => {
  const mockAuth = vi.hoisted(() => ({
    signInWithEmailAndPassword: vi.fn(),
    getAuth: vi.fn(),
    createUserWithEmailAndPassword: vi.fn()
  }))

  beforeAll(() => {
    vi.mock('firebase/auth', () => {
      return mockAuth
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  return mockAuth
}
