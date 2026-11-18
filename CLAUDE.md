# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Career Vault is a front-end-only Vue 3 + TypeScript (Vite) app for tracking job applications. Firebase provides the whole backend: Auth (email/password), Firestore (data), and Storage (uploaded offer files). Firebase config comes from `VITE_*` env vars in a git-ignored `.env` (`VITE_API_KEY`, `VITE_AUTH_DOMAIN`, `VITE_PROJECT_ID`, `VITE_STORAGE_BUCK`, `VITE_APP_ID`, `VITE_MESSAGING_SENDER_ID`). See README.md for setting up the Firebase project.

## Commands

```sh
npm run dev                 # Vite dev server
npm run build               # type-check (vue-tsc) + vite build, in parallel
npm run type-check
npm run lint                # eslint with --fix
npm run format              # prettier on src/
npm run test:unit           # vitest (watch mode)
npx vitest run path/to/file.spec.ts        # single test file, once
npx vitest run -t "test name"              # single test by name
npm run test:e2e            # build preview on :4173 + cypress run
npm run test:e2e:dev        # vite dev --mode test on :4173 + cypress open
npm run deploy:firebase     # build + firebase deploy
```

- Unit tests use jsdom and live both in `src/**/__tests__/` and in `tests/` (shared mocks in `tests/test-utils/mock/`).
- `vite build` writes `bundle-visualization.html` and tries to open it (rollup-plugin-visualizer).
- E2E tests hit the real Firebase project; the login password comes from Cypress env `test_connect_user_pwd` (git-ignored `cypress.env.json`).
- Prettier: single quotes, semicolons, 100 cols, no trailing commas. `@` aliases `src/`.

## Architecture

**Bootstrap (`src/main.ts`)** — the Vue app is created lazily inside the first `auth.onAuthStateChanged` callback, so Firebase auth state is known before mount. On each auth change, the Firestore user profile is loaded into the Pinia auth store. The router guard redirects routes with `meta.requiresAuth` to `home` if `useAuthStore().isAuthenticated` is false. When `MODE === 'test'`, `main.ts` deletes the `test@test.com` user on startup so the register E2E test can re-run.

**Dependency injection** — services are wired in `main.ts` via `app.provide` and consumed with `inject` (see `TrackingView.vue`). Injection keys are string literals: `'userAuthReposiroty'` (typo is the actual key), `'jobApplicationRepository'`, `'jobApplicationService'`, `'exportJobApplication'`.

**Layers under `src/modules/`**:
- `configs/firebase.ts` — initializes Firebase and exports `auth`, `db`, `storage` and the collection refs (`users`, `jobApplications`, `comments`).
- `repository/` — interfaces (`I*Repository`) plus Firebase implementations in `implementation/firebase/`. `FirebaseJobApplicationRepository` handles Firestore CRUD, uploads offer files to Storage under `offer-details/`, and converts Firestore timestamps / legacy flat fields (`societyName`) into `JobApplication` models.
- `services/` — interfaces + implementations; `JobApplicationService.saveApplication` adds or updates depending on whether `applicationId` is set. `services/files/` exports applications to PDF (jspdf) / Excel (xlsx-js-style).
- `model/` — `JobApplication`, `User`, company/contact info classes.

**Parallel older path** — there are two ways data access happens, and both are in use:
- `stores/auth.ts` (Pinia) and the `composables/` (`useUser`, `useJobApplication`) call the Firebase SDK directly through the shared collection refs instead of going through the injected repositories. Auth/login/register flows use the store; `TrackingView` uses the injected repository/service.
- Pick the right one when changing behavior, and keep both consistent if a change touches shared data.

**Testing Firebase code** — tests mock `firebase/auth`, `firebase/firestore`, `firebase/storage` and `@/modules/configs/firebase` with `vi.mock` + `vi.hoisted` (examples: `src/composables/__tests__/useJobApplication.spec.ts`, `tests/test-utils/mock/firebaseAuth.ts`).

## Deployment

Firebase Hosting (`firebase deploy`; `firebase.json`/`.firebaserc` are git-ignored). `vercel.json` also exists with an SPA rewrite.
