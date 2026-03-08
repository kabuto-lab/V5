# ViRU5 - VISUAL EFFECTS SPECIFICATION
**Version:** 2.0  
**Date:** 2026-03-04  
**Status:** PHASED IMPLEMENTATION

---

## 📋 IMPLEMENTATION PHASES

### Phase 1: Essential Cell Feedback (NOW) ✅
- Cell color changes for virus ownership
- Basic cell graphics (PIXI.Graphics rects)
- Victory screen overlay

### Phase 2: State Visualization (NEXT)
- DESPERATE: Red glow + shake
- LATENT: Dim opacity (0.3)
- HYPERMUTATING: Glitch effect
- SENESCENT: Grey zombie color

### Phase 3: Synergy & Chaos Effects
- Synergy auras (colored rings)
- Chaos event icons above cells
- Mutation flash (white pulse)

### Phase 4: Polish (OPTIONAL)
- CRT scanline overlay
- Bloom/glow post-processing
- Particle effects

---

## 🎯 PHASE 2: STATE VISUALIZATION (Implementation Guide)

### Priority 1: DESPERATE State (Last Stand)
**When:** Cell HP <10% with high Resilience  
**Visual:** Red glow + violent shake  
**Implementation:**
```typescript
// In BattleRenderer.updateSprite4Player()
if (state === BiologicalState.DESPERATE) {
  // Add red glow overlay
  const glow = this.getOrCreateGlow(cellGraphics);
  glow.clear();
  glow.beginFill(0xff0000, 0.5);
  glow.drawCircle(diameter/2, diameter/2, diameter);
  glow.endFill();
  
  // Shake effect (random offset each frame)
  const shake = 2 * (Math.random() - 0.5);
  cellGraphics.x += shake;
  cellGraphics.y += shake;
}
```

---

### Priority 2: LATENT State (Dormant)
**When:** Low energy, no nearby enemies  
**Visual:** Dim opacity, nearly invisible  
**Implementation:**
```typescript
if (state === BiologicalState.LATENT) {
  cellGraphics.alpha = 0.3;  // 70% transparent
}
```

---

### Priority 3: HYPERMUTATING State
**When:** Stress >90 + high Mutation  
**Visual:** RGB glitch effect  
**Implementation:**
```typescript
if (state === BiologicalState.HYPERMUTATING) {
  // Random color channel offset
  const glitchOffset = (Math.random() - 0.5) * 4;
  cellGraphics.x += glitchOffset;
  
  // Occasional white flash
  if (Math.random() < 0.1) {
    cellGraphics.tint = 0xffffff;
  }
}
```

---

### Priority 4: SENESCENT State (Zombie)
**When:** Death + high Virulence  
**Visual:** Grey color, undead look  
**Implementation:**
```typescript
if (state === BiologicalState.SENESCENT) {
  cellGraphics.tint = 0x888888;  // Grey
}
```

---

### Priority 5: CANNIBAL State
**When:** Energy <10 + high Aggression  
**Visual:** Red tint, consuming effect  
**Implementation:**
```typescript
if (state === BiologicalState.CANNIBAL) {
  // Dark red tint
  cellGraphics.tint = 0x660000;
  
  // Occasional particle when consuming
  if (consumedCellThisTick) {
    this.spawnParticle(x, y, 0xff0000);
  }
}
```

---

## 🔧 IMPLEMENTATION CHECKLIST

### For Each State Effect:
- [ ] Add state check in `updateSprite4Player()`
- [ ] Apply visual change (tint/alpha/position)
- [ ] Test in battle (trigger state naturally)
- [ ] Verify performance (no FPS drop)
- [ ] Balance intensity (not too distracting)

### Testing Strategy:
1. **DESPERATE:** Set virus HP low manually, watch for red glow
2. **LATENT:** Create low-energy virus, should go dim
3. **HYPERMUTATING:** Stack mutation + stress, watch for glitch
4. **SENESCENT:** Kill high-virulence cell, should turn grey
5. **CANNIBAL:** Drain energy + high aggression, watch for red tint

---

## 📊 CURRENT STATUS

| Effect | Status | Priority | Complexity |
|--------|--------|----------|------------|
| Cell ownership colors | ✅ Done | N/A | Low |
| Victory screen | ✅ Done | N/A | Low |
| DESPERATE glow | ❌ TODO | High | Low |
| LATENT dimming | ❌ TODO | High | Very Low |
| HYPERMUTATING glitch | ❌ TODO | Medium | Medium |
| SENESCENT grey | ❌ TODO | Medium | Very Low |
| CANNIBAL tint | ❌ TODO | Low | Low |
| Synergy auras | ❌ TODO | Low | Medium |
| Chaos icons | ❌ TODO | Low | High |
| CRT scanlines | ❌ TODO | Optional | High |
| Bloom post-process | ❌ TODO | Optional | Very High |

---

## 🎨 COLOR PALETTE

### Virus Colors:
- **Virus 1 (RED):** `0xff0000`
- **Virus 2 (BLUE):** `0x0000ff`
- **Virus 3 (GREEN):** `0x00ff00`
- **Virus 4 (YELLOW):** `0xffff00`

### State Effect Colors:
- **DESPERATE:** `0xff0000` (red glow)
- **LATENT:** Alpha `0.3` (dim)
- **HYPERMUTATING:** `0xffffff` (white flash)
- **SENESCENT:** `0x888888` (grey)
- **CANNIBAL:** `0x660000` (dark red)
- **SYMBIOTIC:** `0x00ff00` (green aura)
- **QUANTUM:** `0xff00ff` (magenta phase)

### UI Colors:
- **Victory text:** `0x00ffff` (cyan)
- **Restart button:** `0xff00ff` (magenta pulse)

---

## ⚠️ PERFORMANCE GUIDELINES

### Do:
- Use PIXI.Graphics for simple effects (glows, rings)
- Batch effects by type (single Graphics for all glows)
- Limit particle count (<50 active)
- Use alpha/tint changes (cheap)

### Don't:
- Create new Graphics objects every frame
- Use complex shaders on 800 cells
- Add more than 3 particle types
- Apply post-processing to entire screen

### Target:
- **60 FPS** sustained with all effects
- **<100MB** memory usage
- **<50** draw calls per frame

---

## 🚀 NEXT STEPS

1. **Start with LATENT** (easiest - just alpha change)
2. **Add DESPERATE** (red glow - high impact)
3. **Add SENESCENT** (grey tint - very easy)
4. **Test in battle** (verify states trigger naturally)
5. **Balance intensity** (not too distracting)
6. **Optional:** Add HYPERMUTATING glitch (medium complexity)

**Estimated Time:** 2-3 hours for Phase 2 complete

---

**Last Updated:** 2026-03-04  
**Next Phase:** State Visualization (Phase 2)  
**Status:** Ready for implementation

### 5.2 Victory
- **Slow motion**: Final 3 ticks at 0.2x speed
- **Victory text**: Glitch effect + scanlines
- **Stats**: Staggered slide-in

---

## 6. PERFORMANCE GUIDELELINES

- **Max particles per cell**: 8
- **Max concurrent effects**: 100
- **Use object pooling** for particles
- **Disable effects** if FPS < 30
- **Mobile**: Reduce bloom quality
