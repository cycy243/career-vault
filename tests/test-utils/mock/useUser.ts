import { beforeAll, afterEach, vi } from 'vitest';

export const setUpUseUserMock = () => {
  const mockUseUser = vi.hoisted(() => ({
    getUserByEmail: vi.fn(),
    addUser: vi.fn()
  }));

  beforeAll(() => {
    vi.mock('@/composables/useUser', () => ({
      useUser: () => {
        return { ...mockUseUser };
      }
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  return mockUseUser;
};
