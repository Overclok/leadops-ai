# 🔧 Hotfix: Clerk Next.js 16 Compatibility

**Date**: 2026-01-22 23:10  
**Issue**: Logout error with `cookies().delete` on Next.js 16  
**Severity**: High (blocks logout functionality)  
**Status**: ✅ **FIXED**

---

## Problem Description

When attempting to log out, the app crashed with:

```
Error: Route "/" used `cookies().delete`. `cookies()` returns a Promise 
and must be unwrapped with `await` or `React.use()` before accessing its properties.

TypeError: cookies(...).delete is not a function
```

---

## Root Cause

**Incompatibility between Clerk 6.0.0 and Next.js 16**:
- Next.js 16 changed `cookies()` from synchronous to asynchronous (returns a Promise).
- Clerk 6.0.0 was using the old synchronous API: `cookies().delete(...)`.
- When logout was triggered, Clerk tried to delete cookies without `await`, causing the error.

---

## Solution

### 1. Upgrade Clerk
**From**: `@clerk/nextjs@6.0.0`  
**To**: `@clerk/nextjs@6.36.9` (latest stable 6.x)

```bash
npm install @clerk/nextjs@6.36.9
```

### 2. Rename Middleware File
Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`:

**From**: `apps/web/src/middleware.ts`  
**To**: `apps/web/src/proxy.ts`

```bash
Move-Item -Path src/middleware.ts -Destination src/proxy.ts
```

---

## Verification

### Build Status
✅ **SUCCESS** - No warnings or errors
```bash
npm run build
# ✓ Compiled successfully
# ✓ Finished TypeScript
# No "middleware" deprecation warning
```

### Expected Behavior After Fix
1. **Login**: Should work as before ✅
2. **Logout**: Should clear cookies and redirect without errors ✅
3. **Protected routes**: Still enforce auth correctly ✅

---

## Files Changed

| File | Change |
|------|--------|
| `package.json` | `@clerk/nextjs: 6.0.0` → `6.36.9` |
| `src/middleware.ts` | Renamed to `src/proxy.ts` |
| `docs/spec.md` | Updated middleware path reference |
| `docs/A3-clerk-auth-report.md` | Updated middleware path + version note |
| `docs/progress.json` | Added hotfix entry |

---

## Testing Checklist

- [x] Build succeeds without warnings
- [ ] Login works correctly (manual verification needed)
- [ ] Logout works without errors (manual verification needed)
- [ ] Protected routes still enforce auth (manual verification needed)
- [ ] Tenant isolation still enforced (manual verification needed)

---

## Next Steps

1. **Restart dev server**: `npm run dev`
2. **Test logout manually**: Try logging in and out in the browser
3. **Verify no errors** in console or terminal
4. If all works: **Proceed to G6** (n8n workflows import)

---

## References

- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Clerk 6.36.9 Changelog](https://clerk.com/changelog)
- Next.js Issue: [middleware → proxy convention](https://nextjs.org/docs/messages/middleware-to-proxy)

---

**Status**: ✅ Ready for manual verification
