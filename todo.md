# Test Suite Plan for Digital Dukan

This document outlines the requirements and implementation details for creating a comprehensive, best-practice test suite for the project.

## 1. Testing Stack & Configuration

-   **Framework**: Jest (already configured)
-   **React Testing**: `@testing-library/react`, `@testing-library/jest-dom`
-   **Environment**: `jest-environment-jsdom`

### Key Configuration Notes

-   Mock `next/navigation` (`redirect`, `useRouter`, etc.)
-   Mock `next/headers` (`cookies()`)
-   Mock `@/lib/db` (Supabase client)
-   Mock `@/lib/auth` (session functions) for component/action tests

---

## 2. Unit Tests - Lib Utilities

### `src/lib/auth.ts`
| Function          | Test Cases                                                                                          |
| :---------------- | :-------------------------------------------------------------------------------------------------- |
| `hashPassword`    | Returns a string different from input; output is a valid bcrypt hash.                               |
| `verifyPassword`  | Returns `true` for correct password; `false` for incorrect.                                         |
| `createSession`   | Correctly signs a JWT and sets an `httpOnly` cookie.                                                |
| `getSession`      | Returns payload for valid token; `null` for invalid/missing token.                                  |
| `deleteSession`   | Removes the session cookie.                                                                         |

### `src/lib/translations.ts` (Existing tests: `translations.test.ts`)
- Verify `t()` function returns correct string for `en` and `ur` locales.

### `src/lib/r2.ts` (Existing tests: `r2.test.ts`)
- Verify `uploadImageToR2` returns a valid URL; handles upload failures gracefully.

---

## 3. Server Action Tests

**Mocking Strategy**: Mock `getDb()` from `@/lib/db` to return controlled responses. Mock `getSession()` for authenticated state.

### `src/app/login/actions.ts`
| Action   | Test Cases                                                                                                       |
| :------- | :--------------------------------------------------------------------------------------------------------------- |
| `login`  | 1. Returns error for invalid credentials. 2. Returns error if user not found. 3. Redirects to `/dashboard` on success. |
| `signup` | 1. Returns error if user already exists. 2. Returns error on DB insert failure. 3. Redirects to `/dashboard` on success. |
| `signOut`| 1. Calls `deleteSession()`. 2. Redirects to `/login`.                                                            |

### `src/app/khata/actions.ts`
| Action           | Test Cases                                                                                               |
| :--------------- | :------------------------------------------------------------------------------------------------------- |
| `addCustomer`    | 1. Throws if not authenticated. 2. Inserts correct data. 3. Throws on DB error. 4. Calls `revalidatePath`. |
| `addTransaction` | 1. Throws if not authenticated. 2. Parses items JSON correctly. 3. Updates customer balance via RPC.     |

### `src/app/inventory/actions.ts` (Existing tests: `inventory.test.ts`)
| Action                 | Test Cases                                                                 |
| :--------------------- | :------------------------------------------------------------------------- |
| `getInventoryItems`    | Returns empty array if not authenticated; returns data for valid user.    |
| `addInventoryItem`     | Handles image upload; inserts data; throws on DB error.                   |
| `updateInventoryItem`  | Handles image deletion/update; throws if item not found/unauthorized.     |
| `deleteInventoryItem`  | Deletes item; verifies user ownership; throws on error.                   |

---

## 4. Context Provider Tests

### `src/context/LanguageContext.tsx` (Existing: `LanguageContext.test.tsx`)
- Provides default language (`en`).
- `setLanguage` updates context and `localStorage`.

### `src/context/ThemeContext.tsx` (Existing: `ThemeContext.test.tsx`)
- Provides default theme (`light`).
- `toggleTheme` switches between `light` and `dark`.
- Persists theme to `localStorage`.

---

## 5. Component Tests

### `src/components/Sidebar.tsx`
| Test Case                              | Details                                                              |
| :------------------------------------- | :------------------------------------------------------------------- |
| Renders all navigation links           | Verify presence of Dashboard, Khata, Inventory, Employees, Settings. |
| Highlights active link based on route  | Mock `usePathname` and verify active state styling.                  |
| Sign out button calls `signOut` action | Click button and assert action is invoked.                           |

### `src/components/LanguageToggle.tsx` (Existing: `LanguageToggle.test.tsx`)
- Toggles language on click.

### `src/components/ThemeToggle.tsx` (Existing: `ThemeToggle.test.tsx`)
- Toggles theme on click.

### `src/components/AddCustomerModal.tsx`
- Renders form fields (name, phone, address).
- Calls `addCustomer` action on submit.
- Closes modal on cancel.

### `src/components/EditInventoryModal.tsx`
- Renders with pre-filled values.
- Handles image preview and deletion.
- Calls `updateInventoryItem` on save.

---

## 6. Middleware Tests

### `src/middleware.ts`
| Test Case                                        | Details                                               |
| :----------------------------------------------- | :---------------------------------------------------- |
| Allows access to public paths (`/login`, `/`)    | No redirect.                                          |
| Redirects unauthenticated users to `/login`      | Protected path without session.                       |
| Redirects authenticated users from `/login` to `/dashboard` | Valid session on login page.              |
| Allows static files (`.svg`, `.js`, etc.)        | No redirect for asset requests.                       |

---

## 7. Implementation Priorities (Recommended Order)

1.  **Lib Utilities** (`auth.ts`) - Foundational; unblock other mocks.
2.  **Server Actions** (`login/actions.ts`) - Core business logic.
3.  **Middleware** - Authorization logic.
4.  **Remaining Server Actions** (`khata`, `inventory`).
5.  **Components** (Modals, Sidebar).

---

## 8. Test File Naming Convention

-   Unit/Action tests: `<filename>.test.ts` (e.g., `auth.test.ts`)
-   Component tests: `<FileName>.test.tsx` (e.g., `Sidebar.test.tsx`)
-   Placed in the same directory as the file being tested.