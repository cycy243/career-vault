import { describe, expect, it, vi, type Mocked } from 'vitest'

import { useUser } from '../useUser'
import User from '../../modules/model/User'
import { collection, getDocs, getFirestore } from 'firebase/firestore'

vi.mock('../../src/modules/repository/implementation/firebase/firebase', () => {
  return {
    usersCollection: vi.fn()
  }
})

vi.mock('firebase/firestore', () => {
  return {
    initializeFirestore: vi.fn(),
    getFirestore: vi.fn(),
    collection: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    doc: vi.fn(),
    query: vi.fn(),
    where: vi.fn()
  }
})

describe('useUser hook test', () => {
  describe('getUserByEmail tests', () => {
    it('when getByEmail get existing email then return use', async () => {
      const { getUserByEmail } = useUser()
      const expected = { id: '1', data: () => ({ email: 'test@test.test', name: 'Test User' }) }

      ;(getDocs as Mocked<any>).mockImplementation(() => {
        return {
          docs: [expected]
        }
      })

      const foundedUser: User | null = await getUserByEmail('test@test.test')

      expect(foundedUser).not.toBeNull()
      expect(foundedUser?.email).toEqual('test@test.test')
    })

    it("when getByEmail don't find user for the given email then return null", async () => {
      const { getUserByEmail } = useUser()

      ;(getDocs as Mocked<any>).mockImplementation(() => {
        return {
          docs: []
        }
      })

      const foundedUser: User | null = await getUserByEmail('unexisting_user@test.test')

      expect(foundedUser).toBeNull()
    })
  })

  describe('addUser tests', async () => {
    it('when add user is successfull then return a user', async () => {
      const { addUser } = useUser()
      const userToAdd = new User(
        'add_test_name',
        'add_test_firstname',
        'add_test_pseudo',
        'add_test@test.com',
        'TestPassword123$'
      )
      const addedUserUid = '123456'

      const result: User = await addUser(userToAdd, addedUserUid)

      expect(result.lastname).toEqual(userToAdd.lastname)
      expect(result.uid).toBeDefined()
      expect(result.uid).toEqual(addedUserUid)
    })
  })
})
