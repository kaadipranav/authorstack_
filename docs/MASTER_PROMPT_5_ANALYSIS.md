# MASTER PROMPT 5 — Stabilization & Hardening Analysis

## Issues Identified

### 🔴 Critical Issues

1. **Build Prerendering Error**
   - Pages trying to prerender with missing Supabase env vars
   - Affects: `/dashboard/books`, `/dashboard/connections`, `/dashboard/sales`
   - Solution: Make dashboard pages dynamic (no prerendering)

2. **Missing Error Boundaries**
   - No error boundaries on dashboard pages
   - No fallback UI for failed data loads
   - Solution: Add error.tsx files to dashboard routes

3. **Missing Loading States**
   - Dashboard pages don't show loading UI
   - No skeleton screens or spinners
   - Solution: Add loading.tsx files

4. **Server/Client Boundary Issues**
   - Some server components might be trying to use client-only features
   - Solution: Add "use client" directives where needed

5. **Type Errors in Link Components**
   - Link href props have type mismatches (already partially fixed)
   - Remaining issues in some components

### 🟡 High Priority Issues

6. **Missing RLS Checks**
   - Dashboard queries don't verify user ownership
   - Could expose data across users
   - Solution: Add RLS policies and verify in queries

7. **Storage Access Issues**
   - Book covers and KDP uploads need proper access control
   - Missing signed URL generation for private files
   - Solution: Add signed URL helpers

8. **Webhook Validation**
   - Webhooks need signature verification
   - Already implemented for Whop, need for others
   - Solution: Verify all webhook signatures

9. **API Route Inconsistencies**
   - Some routes return different response formats
   - Missing error status codes
   - Solution: Standardize API responses

10. **Missing Auth Checks**
    - Some API routes don't verify authentication
    - Solution: Add requireAuth() to all protected routes

### 🟠 Medium Priority Issues

11. **Missing Error Pages**
    - 404 page exists but might not catch all cases
    - No 500 error page
    - Solution: Add comprehensive error pages

12. **Incomplete Error Handling**
    - Some async operations don't have try/catch
    - Missing error logging
    - Solution: Add error handling throughout

13. **Missing Data Validation**
    - API inputs not validated with Zod schemas
    - Solution: Add input validation

14. **Inconsistent Logging**
    - Some modules log, others don't
    - No structured logging
    - Solution: Add consistent logging

15. **Missing Type Safety**
    - Some database queries return `any`
    - Solution: Add proper types

## Files Needing Changes

### Dashboard Routes
- `app/(dashboard)/dashboard/page.tsx` - Add loading/error
- `app/(dashboard)/dashboard/books/page.tsx` - Add loading/error, fix prerender
- `app/(dashboard)/dashboard/connections/page.tsx` - Add loading/error
- `app/(dashboard)/dashboard/sales/page.tsx` - Add loading/error
- `app/(dashboard)/dashboard/settings/page.tsx` - Add loading/error

### API Routes
- `app/api/ingestion/cron/route.ts` - Add error handling
- `app/api/ingestion/manual/route.ts` - Add validation
- `app/api/ingestion/platform/[platform]/route.ts` - Add validation
- `app/api/ingestion/status/[jobId]/route.ts` - Add error handling
- `app/api/webhooks/whop/route.ts` - Verify signature
- `app/api/webhooks/platforms/[provider]/route.ts` - Add signature verification
- `app/api/platforms/oauth/[provider]/callback/route.ts` - Add error handling
- `app/api/platforms/oauth/[provider]/start/route.ts` - Add error handling

### Library Files
- `lib/supabase/server.ts` - Add RLS verification
- `lib/supabase/client.ts` - Add error handling
- `lib/auth/session.ts` - Add error handling
- `lib/books/service.ts` - Add error handling
- `lib/platforms/actions.ts` - Add validation

### Components
- `components/layout/dashboard-shell.tsx` - Add error boundary
- `components/navigation/navbar.tsx` - Add error handling

## Severity Breakdown

| Severity | Count | Impact |
|----------|-------|--------|
| Critical | 5 | Build fails, data exposed, no UX feedback |
| High | 5 | Security issues, data inconsistency |
| Medium | 5 | Poor UX, maintenance issues |
| **Total** | **15** | **MVP stability at risk** |

## Fix Priority Order

1. **Fix prerendering** - Build will fail otherwise
2. **Add error boundaries** - Prevent white screens
3. **Add loading states** - Improve UX
4. **Add RLS checks** - Prevent data leaks
5. **Add auth checks** - Prevent unauthorized access
6. **Standardize API responses** - Consistency
7. **Add input validation** - Security
8. **Add error pages** - UX
9. **Add logging** - Debugging
10. **Add type safety** - Maintainability

## Estimated Fix Time

- Prerendering: 10 min
- Error boundaries: 15 min
- Loading states: 15 min
- RLS checks: 20 min
- Auth checks: 15 min
- API standardization: 20 min
- Input validation: 15 min
- Error pages: 10 min
- Logging: 10 min
- Type safety: 15 min

**Total: ~2 hours**

---

**Status:** Ready for automated fixes
**Next:** Apply fixes in priority order
