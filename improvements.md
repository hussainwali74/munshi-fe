# Performance Improvement Potentials

This report outlines identified performance bottlenecks in the Munshi FE codebase and provides actionable recommendations to improve application speed, responsiveness, and efficiency.

## 1. Database & Server Actions Optimization

### Parallelize Independent Database Queries
**Location:** `src/app/dashboard/search-actions.ts` (`getDashboardStats`)

Currently, `getDashboardStats` awaits multiple database queries sequentially (Total Udhar, Total Payable, Low Stock, Active Customers, etc.). This causes a "waterfall" effect, significantly increasing the total response time.

**Recommendation:**
Use `Promise.all` to execute independent queries concurrently.

```typescript
// Before
const udharData = await getDb()...;
const payableData = await getDb()...;
const lowStockData = await getDb()...;

// After
const [udharResult, payableResult, lowStockResult] = await Promise.all([
  getDb()...,
  getDb()...,
  getDb()...
]);
```

### Optimize Data Aggregation
**Location:** `src/app/dashboard/search-actions.ts`

- **Issue:** The code fetches large datasets just to calculate sums or counts in JavaScript (e.g., `reduce`, `filter`).
  - Example: Fetching all inventory items to count low stock.
  - Example: Fetching all transactions to calculate sums.
- **Impact:** Increases memory usage and data transfer size.

**Recommendation:**
Perform aggregations directly in the database using SQL functions (e.g., `.select('balance.sum')` or using `.count()`).

```typescript
// Instead of this:
const items = await getInventory(); // Returns 1000 items
const lowStock = items.filter(i => i.qty < 5).length;

// Do this (using Supabase/PostgREST):
const { count } = await getDb()
  .from('inventory')
  .select('*', { count: 'exact', head: true })
  .lt('quantity', 5);
```

## 2. Rendering & Client-Side Optimization

### Shift to Server Components for Initial Data
**Location:** `src/app/dashboard/page.tsx`, `src/app/inventory/page.tsx`

**Issue:** These pages are marked as `'use client'` at the top level solely to handle state and effects. This forces the entire page bundle to be downloaded and hydrated, and data fetching starts only *after* the component mounts (causing layout shift and loading spinners).

**Recommendation:**
- Keep the page as a **Server Component**.
- Fetch initial data (stats, recent transactions, inventory list) directly in the server component.
- Pass this data as props to Client Components or use smaller Client Components for interactive parts (e.g., `<SearchSection />`, `<InventoryTable />`).

### Memoize Expensive Client-Side Operations
**Location:** `src/app/inventory/page.tsx`

**Issue:** The `filteredItems` array is recalculated on every render. If the inventory grows to hundreds or thousands of items, this filtering logic (looping through all items) will cause UI jank during typing or other state updates.

**Recommendation:**
Wrap the filtering logic in `useMemo`.

```typescript
const filteredItems = useMemo(() => {
  return items.filter(item => ...);
}, [items, searchQuery, selectedCategory, selectedSize, minPrice, maxPrice]);
```

### Debounce Search State Updates
**Location:** `src/app/dashboard/page.tsx`

**Issue:** While the API call is debounced, setting the `loading` state or local state might be triggering unnecessary re-renders of the entire dashboard tree.

**Recommendation:**
Ensure that state updates related to search are isolated to the search component or that the debounce logic prevents state updates until necessary.

## 3. General Architecture & UX

### Optimistic UI Updates
**Location:** `src/app/inventory/page.tsx`

**Issue:** When adding or deleting an item, the app waits for the server action to complete and then refetches the entire list. This feels sluggish.

**Recommendation:**
Implement optimistic updates: immediately update the local state to reflect the change (e.g., remove the item from the list) while the server action runs in the background. If it fails, revert the change.

### Bundle Size & Code Splitting
- **Lucide React:** Ensure tree-shaking is effective. The current imports are fine, but verify that the entire library isn't being bundled.
- **Modals:** Lazy load heavy modals (like `AddCustomerModal` or `EditInventoryModal`) using `next/dynamic` so they are only loaded when needed.

## 4. Image Optimization

**Location:** `src/app/inventory/page.tsx`

**Issue:**
- Usage of `unoptimized` prop on `Image` in preview.
- Ensure `next/image` is fully leveraged for inventory item images to serve optimized formats (WebP/AVIF) and appropriate sizes.

**Recommendation:**
- Configure `next.config.js` to allow the Supabase storage domain.
- Remove `unoptimized` unless strictly necessary for local blobs (for blobs, it's fine, but for remote URLs, use optimization).

---

### Summary of Priority Actions

1.  **Critical:** Parallelize queries in `search-actions.ts` - High impact on Dashboard load time.
2.  **High:** Move data fetching to Server Components for Dashboard and Inventory - Improves perceived performance and removes "loading..." flashes.
3.  **Medium:** Optimize SQL queries to return counts/sums instead of raw data.
4.  **Low:** Add `useMemo` for filtering and lazy load modals.
