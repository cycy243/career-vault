import { describe, expect, it, vi, Mocked } from 'vitest'

import { useUser } from '../../src/hooks/useUser'
import type User from '../../src/modules/model/User'
import { getDocs } from 'firebase/firestore'
import { beforeEach } from 'node:test'

vi.mock('../../src/modules/repository/implementation/firebase/firebase', () => {
  return {
    usersCollection: vi.fn()
  }
})

vi.mock('firebase/firestore', () => {
  return {
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn()
  }
})

describe('useUser hook test', () => {
  it('when getByEmail get existing email then return use', async () => {
    const { getUserByEmail } = useUser()
    const expected = { id: '1', data: () => ({ email: 'test@test.test', name: 'Test User' }) }

    ;(getDocs as Mocked<any>).mockImplementation(() => {
      return {
        docs: [expected]
      }
    })

    const foundedUser: User = await getUserByEmail('test@test.test')

    expect(foundedUser).not.toBeNull()
    expect(foundedUser.email).toEqual('test@test.test')
  })

  it("when getByEmail don't find user for the given email then return null", async () => {
    const { getUserByEmail } = useUser()

    ;(getDocs as Mocked<any>).mockImplementation(() => {
      return {
        docs: []
      }
    })

    const foundedUser: User = await getUserByEmail('unexisting_user@test.test')

    expect(foundedUser).toBeNull()
  })
})
