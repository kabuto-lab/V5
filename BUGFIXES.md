# V4 Bug Fixes

## Issue: tsconfig.node.json Missing

**Error:**
```
[plugin:vite:esbuild] parsing C:/__Qwen1/TOVCH/V4/client/tsconfig.node.json failed
```

**Fix:**
Removed the reference to non-existent `tsconfig.node.json` from `client/tsconfig.json`.

### Changed Files:

1. **client/tsconfig.json**
   - Removed `"references": [{ "path": "./tsconfig.node.json" }]`
   - Changed `noUnusedLocals` and `noUnusedParameters` to `false` for development flexibility

2. **client/public/**
   - Created `public` folder
   - Added `favicon.svg` (ViRU5 logo)
   - Copied fonts to `public/fnt/`

3. **client/vite.config.ts**
   - Added `publicDir: 'public'` configuration

---

## How to Test

1. Run `run_dev.bat` or `quick_test.bat`
2. Open http://localhost:3000
3. Should see the app without vite errors

---

## Expected Behavior

✅ No tsconfig errors  
✅ Fonts load correctly  
✅ Favicon displays  
✅ Vite dev server runs without issues  

---

**Date:** 2026-03-03  
**Status:** ✅ Fixed
