import { describe, expect, it, vi, assert, type Mocked } from 'vitest';

import { useJobApplication } from '../useJobApplication';
import JobApplication from '@/modules/model/jobApplication';
import { nextTick } from 'vue';
import { randomUUID } from 'crypto';
import { FirebaseError } from 'firebase/app';
import type { UploadResult } from 'firebase/storage';

vi.mock('../../modules/configs/firebase', async (importOriginal) => {
  const actualModule = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actualModule,
    jobApplicationsCollection: vi.fn()
  };
});

vi.mock('../../stores/auth', () => {
  return {
    useAuthStore: () => {
      return {
        authenticatedUser: {
          uid: '123456789-123456789'
        }
      };
    }
  };
});

const mockedFireStorage = vi.hoisted(() => ({
  getDownloadURL: vi.fn(),
  uploadBytes: vi.fn()
}));

vi.mock('firebase/storage', async (importOriginal) => {
  const actualModule = await importOriginal<typeof import('firebase/storage')>();
  return { ...actualModule, ...mockedFireStorage };
});

const mockedFirestore = vi.hoisted(() => ({
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  doc: vi.fn(() => {
    return {
      id: randomUUID()
    };
  }),
  query: vi.fn(),
  where: vi.fn()
}));

vi.mock('firebase/firestore', async () => {
  const actualModule = await vi.importActual('firebase/firestore');

  return { ...actualModule, ...mockedFirestore };
});

describe('useJobApplication Tests', () => {
  describe('add application', async () => {
    it('When application is valid then there is no error and the application is added', async () => {
      // Arrange
      const { error, addApplication, jobApplications } = useJobApplication();

      // Act
      const addResult = await addApplication(
        JobApplication.createJobApplication({
          societyName: 'Delomit IT'
        }),
        'dolomit-it.com'
      );

      await nextTick();

      // Assert
      expect(addResult).toBeTruthy();
      expect(error.value).toBeUndefined();
      expect(jobApplications.value).toHaveLength(1);
    });

    it('When application is valid file then there is no error and the file link has a uuid in it', async () => {
      // Arrange
      const { error, addApplication, jobApplications } = useJobApplication();
      let refPath = '';
      mockedFireStorage.uploadBytes.mockImplementationOnce((ref: any) => {
        refPath = ref.fullPath;
        return Promise.resolve({} as UploadResult);
      });

      // Act
      const addResult = await addApplication(
        JobApplication.createJobApplication({
          societyName: 'Delomit IT'
        }),
        new File([], 'test.pdf')
      );

      await nextTick();

      // Assert
      console.log(error.value);
      console.log('path: ' + refPath);

      expect(refPath).toBeDefined();
      assert.match(
        refPath.substring(refPath.indexOf('/') + 1),
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}.+$/i,
        'regex match'
      );
    });

    it('when error occurs, error is defined and function returns false', async () => {
      // Arrange
      mockedFirestore.setDoc.mockRejectedValue(new FirebaseError('', ''));
      const { error, addApplication, jobApplications } = useJobApplication();

      // Act
      const addResult = await addApplication(
        JobApplication.createJobApplication({
          societyName: 'Delomit IT'
        }),
        'dolomit-it.com'
      );

      await nextTick();

      // Assert
      expect(addResult).toBeFalsy();
      expect(error.value).toBeDefined();
      expect(jobApplications.value).toHaveLength(0);
    });
  });
});
