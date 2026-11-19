# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Career Vault is a front-end-only Vue 3 + TypeScript (Vite) app for tracking job applications. Firebase provides the whole backend: Auth (email/password), Firestore (data), and Storage (uploaded offer files). Firebase config comes from `VITE_*` env vars in a git-ignored `.env` (`VITE_API_KEY`, `VITE_AUTH_DOMAIN`, `VITE_PROJECT_ID`, `VITE_STORAGE_BUCK`, `VITE_APP_ID`, `VITE_MESSAGING_SENDER_ID`), plus `VITE_PRIME_UI_LICENCE` for PrimeVue. See README.md for setting up the Firebase project.

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

**Data access = composables** — Firebase access goes through composables in `src/composables/` (no repository/service classes):
- `useJobApplication()` — per-call reactive state plus `loadCurrentUserJobApplication`, `addApplication`, `updateApplication`, `saveApplication` (adds or updates depending on whether `applicationId` is set), `deleteApplication`. Uploads offer files to Storage under `offer-details/<uuid>-<name>`, converts Firestore timestamps / legacy flat fields (`societyName`, `societyWebsite`) into `JobApplication` models, and reads the current uid from `useAuthStore()`. Used by `TrackingView`.
  - **Paging and sorting are done in Firestore**, one page per query: `jobApplications` holds only the current page; `totalRecords` (from `getCountFromServer`), `currentPage` (0-based), `rows`, `sortField`, `ascending` describe it; `changePage(page, rows)` / `sortBy(field)` load another page; `fetchAllApplications()` loads everything (used for exports). Pages are reached through cached document cursors (`startAfter` previous page end / `endBefore` next page start / `limitToLast` for the last page, else a forward read from the closest known page). Any write recounts and reloads the current page.
  - Sortable columns and page sizes live in `src/modules/model/jobApplicationPagination.ts`. Each sortable column needs a `userId` + field composite index in both directions (`firestore.indexes.json`).
  - Firestore `orderBy` skips documents missing the field, so sortable fields are written as `null` rather than left undefined. The first time a column is sorted, if the sorted count is lower than the total, `backfillSortFields` adds the missing fields to the user's old documents.
  - `JobApplicationTable` is presentational: it renders the page it is given and emits `page` / `sort`.
- `useUser()` — user profile lookup/creation; used by `stores/auth.ts` (Pinia), which handles login/register/logout.
- `useExportJobApplication(source)` — `exportToPdf` (jspdf) / `exportToExcel` (xlsx-js-style); `source` is a `MaybeRefOrGetter<JobApplication[]>` read at export time. Throws `ServiceError` on failure; the view shows the toasts.

No `provide`/`inject` is used for services.

**`src/modules/`**:
- `configs/firebase.ts` — initializes Firebase and exports `auth`, `db`, `storage` and the collection refs (`users`, `jobApplications`, `comments`).
- `services/errors/` — `ServiceError`.
- `model/` — `JobApplication`, `User`, company/contact info classes.

**UI components = PrimeVue** — PrimeVue 5 is the UI component library (Aura preset, `darkModeSelector: false`, registered in `src/main.ts` together with `ConfirmationService`). When a UI need is covered by a PrimeVue component (dialog, confirm dialog, toggle, paginator, select…), use it instead of hand-rolling one. Examples: `ConfirmDialog` in `TrackingView`, `ToggleSwitch` in `FormToggle`, `Paginator` in `JobApplicationTable`.
- Import per component: `import Paginator from 'primevue/paginator'`.
- Restyle to the app look with the `pt` prop and scoped `:deep()` / `:global()` rules (for teleported overlays) using the `--cv-*` CSS tokens from `src/assets/main.css`.
- Tests that `mount` PrimeVue components need `global: { plugins: [PrimeVue] }` (`import { PrimeVue } from '@primevue/core'`). Components using `Select` (e.g. the paginator's rows-per-page dropdown) also need a `window.matchMedia` stub under jsdom (see `src/components/__tests__/table/jobApplicationTable.spec.ts`).

**Testing Firebase code** — tests mock `firebase/auth`, `firebase/firestore`, `firebase/storage` and `@/modules/configs/firebase` with `vi.mock` + `vi.hoisted` (examples: `src/composables/__tests__/useJobApplication.spec.ts`, `tests/test-utils/mock/firebaseAuth.ts`).

## Deployment

Firebase Hosting (`firebase deploy`; `firebase.json`/`.firebaserc` are git-ignored). `vercel.json` also exists with an SPA rewrite.
