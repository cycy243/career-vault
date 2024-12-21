import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import User from '@/modules/model/User';
import { auth } from '@/modules/configs/firebase';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { useUser } from '@/composables/useUser';

export const useAuthStore = defineStore('auth', () => {
  const authenticatedUser = ref<User>();
  const isAuthenticated = computed(() => authenticatedUser.value != undefined);

  const { getUserByEmail, addUser } = useUser();

  async function logout() {
    authenticatedUser.value = undefined;
    await signOut(auth);
  }

  async function loginWithCredentials(
    email: string,
    password: string
  ): Promise<string | undefined> {
    return setPersistence(auth, browserLocalPersistence)
      .then(async () => {
        await signInWithEmailAndPassword(auth, email, password);
        const user = await getUserByEmail(email);
        if (user) {
          authenticatedUser.value = user;
          return undefined;
        }
        return 'The user should connect but no data found for it';
      })
      .catch((err) => {
        if ((err as any)?.code === 'auth/invalid-credential') {
          return 'No user were found for the given credentials';
        } else if ((err as any)?.name === 'FirebaseError') {
          return 'An error occured with an external service';
        }
        return 'An unknow error occured';
      });
  }

  const register = async (user: User) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, user.email, user.password);
      authenticatedUser.value = await addUser(user, userCred.user.uid);
      return undefined;
    } catch (err) {
      if ((err as any)?.name === 'FirebaseError') {
        return 'An error occured with an external service';
      }
      console.log(err);

      return 'An unknow error occured';
    }
  };

  return {
    authenticatedUser,
    isAuthenticated,
    logout,
    register,
    loginWithCredentials
  };
});
