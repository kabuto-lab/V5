# V4 Grid Consistency Report

**Date:** 2026-03-03  
**Standard Grid Size:** 32×20 (640 cells)

---

## ✅ Fixed Issues

### 1. Sandbox Battle Not Working
**Problem:** Viruses didn't spread/expand when clicking "START BATTLE" in sandbox mode

**Root Causes:**
1. Grid size mismatch: Visual grid was 64×40, but battle logic used 32×20
2. Missing callback: `battleManager.setOnGridUpdate()` was never connected in sandbox mode
3. Wrong initialization order: `battleRenderer.initGrid()` was called after battle start

**Fix Applied:**
- Changed sandbox visual grid from 64×40 to 32×20
- Added `battleManager.setOnGridUpdate()` callback in sandbox mode
- Added `battleManager.setOnStateChange()` callback for win detection
- Added `battleRenderer.setVirusParams()` for defense visualization
- Fixed initialization order: `initGrid()` now called BEFORE `startBattle()`

**Files Modified:**
- `client/src/main.ts` (lines 520-700)

---

## 📊 Grid Dimension Audit

### Server-Side Files

| File | Status | Grid Size | Notes |
|------|--------|-----------|-------|
| `server/src/rooms/schema.ts` | ✅ Consistent | 32×20 | Comment: "32x20 landscape/horizontal" |
| `server/src/rooms/HoldingRoom.ts` | ✅ Consistent | 32×20 | Lines 498-531 |
| `server/src/systems/GridSystem.ts` | ✅ Consistent | Dynamic | Uses `state.gridWidth/Height` |

### Client-Side Files

| File | Status | Grid Size | Notes |
|------|--------|-----------|-------|
| `client/src/main.ts` | ✅ Fixed | 32×20 | Sandbox now uses standard size |
| `client/src/features/battle/BattleManager.ts` | ✅ Consistent | Dynamic | Accepts width/height params |
| `client/src/features/battle/BattleRenderer.ts` | ✅ Consistent | 32×20 default | Lines 64-65, dynamic init |
| `client/src/features/battle/BattleRendererOptimized.ts` | ⚠️ Experimental | 64×40 | NOT IN USE - legacy test file |

---

## 🔧 Hardcoded Values Found

### Acceptable Hardcoded Values (Intentional)

| File | Line | Value | Purpose |
|------|------|-------|---------|
| `HoldingRoom.ts` | 499 | `32 * 20` | Standard grid initialization |
| `HoldingRoom.ts` | 578-579 | `32`, `20` | Spread simulation dimensions |
| `BattleRenderer.ts` | 64-65 | `32`, `20` | Default renderer size |
| `main.ts` | 626-627 | `32`, `20` | Sandbox battle dimensions |

### Problematic Hardcoded Values (Fixed)

| File | Issue | Status |
|------|-------|--------|
| `main.ts` (sandbox) | Was 64×40, now 32×20 | ✅ Fixed |

---

## 📋 Grid Constants Reference

```typescript
// Standard V4 grid dimensions
export const GRID_WIDTH = 32;
export const GRID_HEIGHT = 20;
export const GRID_TOTAL_CELLS = 640;

// Battle timing
export const TICK_RATE_MS = 1000;     // Server tick (1/sec)
export const CLIENT_SPREAD_MS = 500;  // Client spread (2/sec)
export const MAX_TICKS = 1000;        // Max battle duration

// Win condition
export const WIN_THRESHOLD = 96;      // 96% territory control

// Starting positions
export const VIRUS_A_START = { x: 0, y: 10 };   // Left center
export const VIRUS_B_START = { x: 31, y: 10 };  // Right center
```

---

## 🎯 Battle Flow (Sandbox Mode)

```
1. User clicks "START BATTLE"
   ↓
2. Get virus params from VirusTubeManager
   ↓
3. Create 32×20 grid with starting positions
   ↓
4. Initialize BattleRenderer with 32×20
   ↓
5. Set virus params for defense visualization
   ↓
6. Setup onGridUpdate callback → BattleRenderer.updateGrid()
   ↓
7. Setup onStateChange callback → Win detection
   ↓
8. Call battleManager.startBattle()
   ↓
9. BattleManager.startSpreadCycle() runs every 500ms
   ↓
10. Each tick: spreadVirus() → onGridUpdate() → updateGrid()
   ↓
11. BattleRenderer.update() animates cells (lifecycle, pulsing)
   ↓
12. Check win condition → onStateChange('ended')
```

---

## ✅ Verification Steps

To verify the fix works:

1. **Start V4 dev server:**
   ```bash
   cd V4
   npm run dev
   ```

2. **Enter sandbox mode:**
   - Open browser to `http://localhost:3000`
   - Click "Sandbox" or navigate to sandbox view

3. **Randomize virus params:**
   - Click "RANDOMIZE" button in right sidebar
   - Adjust some parameters if desired

4. **Start battle:**
   - Click "START BATTLE" button
   - Should see:
     - Debug panel: "Grid: 32x20, Red=9, Blue=9"
     - BattleRenderer shows 32×20 grid
     - Red virus (left) and Blue virus (right) visible
     - Viruses spread every 500ms (2× per second)
     - Territory updates in real-time
     - Winner declared when one reaches 96%

5. **Watch the battle:**
   - Red and Blue should expand from their starting positions
   - Cells should pulse with lifecycle animation
   - Defense rings should appear (based on defense param)
   - Battle should end in 10-30 seconds typically

---

## 🚨 Known Limitations

1. **BattleRendererOptimized.ts** - Uses 64×40 but is NOT imported/used anywhere
   - This is an experimental optimization file
   - Can be updated or deleted in future cleanup

2. **Sandbox uses client-side battle only** - No server simulation
   - Uses BattleManager.spreadTick() for client-side prediction
   - Real multiplayer battles use HoldingRoom server logic

---

## 📝 Recommendations

### Short-Term (Now)
- ✅ Sandbox battle fixed
- ✅ Grid size standardized to 32×20
- ✅ All active files consistent

### Medium-Term (Next Sprint)
- [ ] Create `GridConfig.ts` with constants
- [ ] Replace hardcoded `32` and `20` with constants
- [ ] Add grid size validation in BattleManager
- [ ] Add unit tests for spread mechanics

### Long-Term (Future)
- [ ] Consider configurable grid sizes (Small/Medium/Large)
- [ ] Add grid size selection in room creation
- [ ] Balance virus params for different grid sizes
- [ ] Performance test with 64×40 for "pro mode"

---

## 🎯 Conclusion

**All active game files now use 32×20 consistently.**

The sandbox battle issue was caused by:
1. Grid size mismatch (64×40 visual vs 32×20 logic)
2. Missing grid update callback

Both issues are now fixed. Sandbox battles should work correctly with viruses spreading and expanding according to the mechanics.
