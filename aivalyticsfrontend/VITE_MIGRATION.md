# Vite Migration Guide

## ⚠️ ACTION REQUIRED: Update Environment Variables

Your frontend uses `process.env.REACT_APP_*` which was for Create React App.
Vite uses `import.meta.env.VITE_*` instead.

### Files that need updating:

1. **src/services/api.ts** - Line 3
2. **src/services/mcqApi.ts** - Lines 189, 517
3. **src/services/departmentApi.ts** - Line 12
4. **src/services/dashboardApi.js** - Line 2
5. **src/services/courseApi.ts** - Line 14
6. **src/features/api.ts** - Line 3
7. **src/features/mcqApi.ts** - Lines 189, 517
8. **src/features/departmentApi.ts** - Line 12
9. **src/features/dashboardApi.js** - Line 2
10. **src/features/courseApi.ts** - Line 14
11. **src/pages/Unauthorized.tsx** - Line 79 (use import.meta.env.DEV)
12. **src/contexts/AuthContext.tsx** - Line 155 (use import.meta.env.DEV)

### Migration Example:

**Before (Create React App):**
```typescript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const isDev = process.env.NODE_ENV === 'development';
```

**After (Vite):**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const isDev = import.meta.env.DEV;
```

### Setup:

1. Create a `.env` file in the root directory:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

2. Update all files listed above with the new `import.meta.env` syntax

3. Test with `npm run dev`

## Vite Setup Summary

✅ **Created/Updated:**
- vite.config.ts
- index.html (moved to root with proper script tag)
- vite-env.d.ts
- tsconfig.json (updated to ES2020)
- tsconfig.node.json

✅ **Can be removed (optional):**
- craco.config.js (not needed for Vite)

✅ **Still valid:**
- postcss.config.js
- tailwind.config.js
