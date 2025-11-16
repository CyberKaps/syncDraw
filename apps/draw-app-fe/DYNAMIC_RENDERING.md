# Next.js Dynamic Rendering Configuration

## 🎯 Problem

By default, Next.js uses Static Site Generation (SSG) to pre-render pages at **build time**. This means:

- Pages are generated once during `pnpm build`
- Data is fetched at build time, not at runtime
- For a collaborative canvas app, this doesn't work because:
  - ❌ Shapes drawn by users won't appear immediately
  - ❌ Real-time updates won't work
  - ❌ Database changes won't be reflected until rebuild

## ✅ Solution

Force **dynamic rendering** for pages that need real-time data:

### Configuration Applied

**File:** `apps/draw-app-fe/app/canvas/[roomId]/page.tsx`

```tsx
// Force dynamic rendering - don't pre-generate this page at build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

### What These Do:

1. **`export const dynamic = 'force-dynamic'`**
   - Forces the page to render on each request
   - Prevents static generation at build time
   - Ensures fresh data from database on every page load

2. **`export const revalidate = 0`**
   - Disables any caching
   - Ensures data is always fresh
   - Perfect for real-time collaborative features

## 🔧 Next.js Rendering Modes

| Mode | When to Use | Data Freshness |
|------|-------------|----------------|
| **Static (SSG)** | Landing pages, blogs, marketing | Build time only |
| **Dynamic (SSR)** | Dashboards, canvas, real-time apps | Every request |
| **ISR** | Product pages, news | Periodic updates |

## 📦 Docker Build Impact

### Before (Static):
```bash
# Build generates static HTML
pnpm build → .next/server/app/canvas/[roomId].html
# Same HTML served to all users
```

### After (Dynamic):
```bash
# Build prepares server-side code
pnpm build → .next/server/app/canvas/[roomId].js
# HTML generated per request with fresh DB data
```

## 🚀 When to Use Dynamic vs Static

### ✅ Use Dynamic (`force-dynamic`) for:
- Canvas/drawing pages (real-time collaboration)
- User dashboards (personalized data)
- Chat/messaging (live updates)
- Admin panels (latest database state)
- Any page with WebSocket connections
- Pages requiring authentication state

### ✅ Use Static (default) for:
- Home/landing page
- About/contact pages
- Documentation
- Marketing pages
- Blog posts (with ISR)

## 🔍 How to Verify

### Check if Page is Dynamic:

```bash
# After build, check the output
pnpm build

# Look for:
# ○ Static - Generated at build time
# ƒ Dynamic - Server-rendered on demand
```

### Example Output:
```
Route (app)                              Size     First Load JS
┌ ○ /                                   5.2 kB          95 kB
├ ƒ /canvas/[roomId]                    1.8 kB          92 kB  ← Dynamic!
├ ○ /signin                             2.1 kB          93 kB
└ ○ /signup                             2.2 kB          94 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

## 🐳 Docker Considerations

The `standalone` output in `next.config.ts` works perfectly with dynamic routes:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',  // ✅ Works with dynamic pages
  transpilePackages: ['@repo/ui'],
};
```

- Standalone bundles everything needed
- Includes Node.js server for dynamic rendering
- Optimized for Docker containers
- Smaller image size than full Next.js

## 📝 Summary

Your canvas page now:
- ✅ Renders on every request (not at build time)
- ✅ Fetches fresh data from database
- ✅ Shows shapes immediately when users navigate
- ✅ Works perfectly with WebSocket real-time updates
- ✅ No caching issues in Docker deployment

The home page and auth pages remain static (faster), while the canvas uses dynamic rendering (real-time data).
