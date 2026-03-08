# ViRU5 V4 - Visual Effects Documentation

**Version:** 1.0  
**Last Updated:** 2026-03-03  
**Purpose:** Complete documentation of all visual effects, algorithms, and rendering mechanics

---

## 📊 VISUAL EFFECTS OVERVIEW

| Effect | Location | Trigger | Performance Cost |
|--------|----------|---------|------------------|
| Combat Sparks | Contested cells | Adjacent enemy | Low (6 spikes) |
| Pressure Arrows | Surrounded cells | 5+ enemies | Low (1-8 arrows) |
| Infestation Particles | Infested cells | Mutation attack | Medium (2-8 particles) |
| Conversion Ring | Capturing cells | Cell takeover | Low (1 arc) |
| Cell Growth | All virus cells | New spawn | None (lifecycle) |
| Glow Effects | All active cells | Always | Low |

---

## 🎨 CELL LIFECYCLE SYSTEM

### Growth Stages

Cells grow from 20% to **160%** max size over **7 seconds**:

```typescript
// File: client/src/features/battle/BattleRenderer.ts
// Lines: 52-56

NEWBORN_DURATION = 3000;   // 0-3s: 20% → 50% size
MATURING_DURATION = 4000;  // 3-7s: 50% → 100% size
MATURE_TIME = 7000;        // 7s+: 100% → 160% size
```

### Visual Progression

| Stage | Duration | Size | Opacity | Fill Ratio | Color Interpolation |
|-------|----------|------|---------|------------|---------------------|
| **Newborn** | 0-3s | 20% → 50% | 0.2 → 0.5 | 0 → 0.3 | Light → Base |
| **Maturing** | 3-7s | 50% → 100% | 0.5 → 1.0 | 0.3 → 1.0 | Blended |
| **Mature** | 7s+ | 100% → 160% | 1.0 (fixed) | 1.0 (fixed) | Base color |

### Algorithm

```typescript
private getCellAgeData(cellIndex: number, virusType: number): CellAgeData {
  const now = Date.now();
  let ageData = this.cellAges.get(cellIndex);

  // New cell - start at 20%
  if (!ageData || virusType === 0) {
    ageData = {
      birthTime: now,
      stage: 'newborn',
      sizeMultiplier: 0.2,
      opacity: 0.2,
      fillRatio: 0
    };
    this.cellAges.set(cellIndex, ageData);
  }

  const age = now - ageData.birthTime;

  if (age < NEWBORN_DURATION) {
    // Newborn: linear interpolation 0-3s
    const progress = age / NEWBORN_DURATION;
    ageData.sizeMultiplier = 0.2 + (0.3 * progress);
    ageData.opacity = 0.2 + (0.3 * progress);
    ageData.fillRatio = progress * 0.3;
  } else if (age < NEWBORN_DURATION + MATURING_DURATION) {
    // Maturing: 3-7s
    const progress = (age - NEWBORN_DURATION) / MATURING_DURATION;
    ageData.sizeMultiplier = 0.5 + (0.5 * progress);  // 0.5 → 1.0
    ageData.opacity = 0.5 + (0.5 * progress);         // 0.5 → 1.0
    ageData.fillRatio = 0.3 + (0.7 * progress);       // 0.3 → 1.0
  } else {
    // Mature: 7s+ (100% → 160%)
    const progress = Math.min(1, (age - MATURE_TIME) / 10000);
    ageData.sizeMultiplier = 1.0 + (0.6 * progress);  // 1.0 → 1.6
    ageData.opacity = 1.0;
    ageData.fillRatio = 1.0;
  }

  return ageData;
}
```

---

## ⚔️ COMBAT SPARKS (6-Spike System)

### Trigger Condition
- Cell is **contested** (adjacent to enemy virus)
- Cell is **NOT** being converted

### Visual Specification

```typescript
// File: client/src/features/battle/BattleRenderer.ts
// Lines: 1054-1074

sparkCount = 6;  // Hexagonal pattern
angles: 0°, 60°, 120°, 180°, 240°, 300°
distance: radius + 4px
color: 0xffffff (white)
alpha: 0.8
```

### Rendering Algorithm

```typescript
private drawCombatSparks(graphics: PIXI.Graphics, radius: number, now: number): void {
  const sparkCount = 6;

  for (let i = 0; i < sparkCount; i++) {
    // Fixed angles in hexagonal pattern
    const angle = (i * 60) * Math.PI / 180;
    const distance = radius + 4;

    // Draw spike (triangle pointing outward)
    graphics.beginFill(0xffffff, 0.8);
    graphics.moveTo(
      Math.cos(angle) * (radius + 2),
      Math.sin(angle) * (radius + 2)
    );
    graphics.lineTo(
      Math.cos(angle - 0.3) * (radius + 6),
      Math.sin(angle - 0.3) * (radius + 6)
    );
    graphics.lineTo(
      Math.cos(angle + 0.3) * (radius + 6),
      Math.sin(angle + 0.3) * (radius + 6)
    );
    graphics.closePath();
    graphics.endFill();
  }
}
```

### Performance
- **Cost:** 6 triangles per contested cell
- **Batching:** Automatic via PixiJS
- **Max cells:** ~100 contested = 600 triangles (acceptable)

---

## 🏹 PRESSURE ARROWS (Dynamic Count System)

### Trigger Condition
- Cell is **surrounded** by enemies (pressure > 0.5 = 4+ enemies)
- Cell is **NOT** being converted
- Cell is **NOT** infested

### Arrow Count Formula

```typescript
// File: client/src/features/battle/BattleRenderer.ts
// Lines: 974-976

const arrowCount = Math.floor(pressure * 8);

// pressure = enemyCount / 8
// 0 enemies = 0 arrows
// 4 enemies = 3 arrows (rounded down from 3.5)
// 8 enemies = 8 arrows (full surround)
```

### Arrow Distribution

| Enemies | Pressure | Arrows | Visual Pattern |
|---------|----------|--------|----------------|
| 0-3 | 0.0-0.375 | 0 | No arrows |
| 4 | 0.5 | 4 | Cardinal directions |
| 5 | 0.625 | 5 | +1 diagonal |
| 6 | 0.75 | 6 | Hexagonal |
| 7 | 0.875 | 7 | 7 of 8 directions |
| 8 | 1.0 | 8 | Full circle |

### Rendering Algorithm

```typescript
private drawPressureIndicators(
  graphics: PIXI.Graphics,
  radius: number,
  pressure: number,
  now: number
): void {
  const arrowCount = Math.floor(pressure * 8);

  for (let i = 0; i < arrowCount; i++) {
    // Evenly spaced angles
    const angle = (i / arrowCount) * Math.PI * 2;
    const distance = radius + 8;
    const arrowX = Math.cos(angle) * distance;
    const arrowY = Math.sin(angle) * distance;

    // Triangle arrow pointing toward center
    graphics.beginFill(0xff0000, 0.6);
    graphics.drawPolygon([
      arrowX, arrowY,  // Tip
      arrowX - Math.cos(angle - 0.3) * 4,
      arrowY - Math.sin(angle - 0.3) * 4,
      arrowX - Math.cos(angle + 0.3) * 4,
      arrowY - Math.sin(angle + 0.3) * 4
    ]);
    graphics.endFill();
  }
}
```

### Visual Properties
- **Color:** 0xff0000 (red)
- **Alpha:** 0.6
- **Size:** 4px wingspan
- **Direction:** Points inward toward cell center
- **Rotation:** Static (no animation)

---

## 🦠 INFESTATION PARTICLES (Parasitic Takeover)

### Trigger Condition
- Cell is **infested** (mutation-based parasitic attack)
- Progress: 0.1 → 1.0 (10% → 100%)

### Particle Count Formula

```typescript
// File: client/src/features/battle/BattleRenderer.ts
// Lines: 1015-1017

const particleCount = 2 + Math.floor(infestationData.progress * 6);

// 10% progress = 2 particles
// 50% progress = 5 particles
// 100% progress = 8 particles
```

### Particle Behavior

```typescript
// Orbital motion with wobble
const angle = ((i / particleCount) * Math.PI * 2) + (now / particleSpeed);
const wobble = Math.sin((now / 100) + i) * 3;
const distance = radius + 5 + wobble;
```

### Stage-Based Effects

| Stage | Progress | Visual Effects |
|-------|----------|----------------|
| **Hidden** | 0-30% | 2-3 particles, subtle |
| **Visible** | 30-70% | 4-6 particles, color mixing |
| **Critical** | 70-100% | 6-8 particles + 8 tendrils |

### Rendering Algorithm

```typescript
private drawInfestationParticles(
  graphics: PIXI.Graphics,
  radius: number,
  infestationData: { infestor: number; progress: number; stage: string },
  now: number
): void {
  const parasiteColor = infestationData.infestor === 1 
    ? 0xff3333  // Red infestor
    : 0x3333ff; // Blue infestor

  const particleCount = 2 + Math.floor(infestationData.progress * 6);
  const particleSpeed = 400 - (infestationData.progress * 200);

  // Orbiting particles
  for (let i = 0; i < particleCount; i++) {
    const angle = ((i / particleCount) * Math.PI * 2) + (now / particleSpeed);
    const wobble = Math.sin((now / 100) + i) * 3;
    const distance = radius + 5 + wobble;

    const pulse = 0.5 + 0.5 * Math.sin((now / 80) + i);
    const alpha = 0.4 + (infestationData.progress * 0.6) * pulse;

    graphics.beginFill(parasiteColor, alpha);
    graphics.drawCircle(
      Math.cos(angle) * distance,
      Math.sin(angle) * distance,
      2 + infestationData.progress * 2
    );
    graphics.endFill();
  }

  // Critical stage: spiky tendrils
  if (infestationData.stage === 'critical') {
    const tendrilCount = 8;
    for (let i = 0; i < tendrilCount; i++) {
      const angle = ((i / tendrilCount) * Math.PI * 2) + (now / 300);
      const tendrilLength = radius * 0.5 * Math.sin((now / 100) + i);

      graphics.lineStyle(2, parasiteColor, 0.7);
      graphics.moveTo(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      );
      graphics.lineTo(
        Math.cos(angle) * (radius + tendrilLength),
        Math.sin(angle) * (radius + tendrilLength)
      );
    }
  }
}
```

### Tendril Animation (Critical Stage)
- **Count:** 8 tendrils
- **Length:** 0% → 50% of cell radius (sine wave)
- **Speed:** 300ms per rotation
- **Color:** Infestor's team color
- **Alpha:** 0.7

---

## 🔄 CONVERSION RING (Capture Progress)

### Trigger Condition
- Cell is **being converted** from one owner to another
- Progress: 0.0 → 1.0 (0% → 100%)

### Visual Specification

```typescript
// File: client/src/features/battle/BattleRenderer.ts
// Lines: 960-968

ringRadius: cellRadius + 6px
color: 0x00ff00 (green)
alpha: 0.8
lineWidth: 3px
rotation: Static (no spin)
```

### Rendering Algorithm

```typescript
private drawConversionRing(
  graphics: PIXI.Graphics,
  radius: number,
  progress: number,
  now: number
): void {
  const ringRadius = radius + 6;
  const startAngle = 0;
  const endAngle = (Math.PI * 2) * progress;

  graphics.lineStyle(3, 0x00ff00, 0.8);
  graphics.arc(0, 0, ringRadius, startAngle, endAngle);
}
```

### Progress Visualization
- **0%:** No ring (empty arc)
- **25%:** Quarter circle
- **50%:** Half circle
- **75%:** Three-quarters
- **100%:** Full circle → Cell ownership changes

---

## ✨ GLOW EFFECTS (Universal)

### Applied To
- All virus cells (value 1-4)
- Intensity based on contestation state

### Glow Formula

```typescript
// File: client/src/features/battle/BattleRenderer.ts
// Lines: 858-860

const glowAlpha = isContested 
  ? lifecycle.opacity * 0.6  // Stronger glow when fighting
  : lifecycle.opacity * 0.3;  // Normal glow

const glowRadius = isContested 
  ? currentRadius + 8  // Larger glow
  : currentRadius + 5;  // Normal glow
```

### Glow Properties

| State | Alpha Multiplier | Radius Offset | Color |
|-------|------------------|---------------|-------|
| **Normal** | 0.3 × opacity | +5px | Cell color |
| **Contested** | 0.6 × opacity | +8px | Cell color |
| **Converting** | 0.3 × opacity | +5px | Mixed colors |

---

## 🎨 COLOR SYSTEM

### Virus Colors

**Matching VirusTubeManager tabs:**

| Virus | Tab Color | BattleRenderer | Hex (Base) | Hex (Light) | Position |
|-------|-----------|----------------|------------|-------------|----------|
| **1** | Red | ✅ Matches | 0xff0000 | 0xff9999 | Top-Left |
| **2** | Blue | ✅ Matches | 0x0000ff | 0x9999ff | Top-Right |
| **3** | Green | ✅ Matches | 0x00ff00 | 0x99ff99 | Bottom-Left |
| **4** | Yellow | ✅ Matches | 0xffff00 | 0xffff99 | Bottom-Right |

**Source:** `VirusTubeManager.virusColors = ['#ff0000', '#0000ff', '#00ff00', '#ffff00']`

### Color Interpolation (Growth)

```typescript
// File: client/src/features/battle/BattleRenderer.ts
// Lines: 618-635

private interpolateColor(
  color1: number,
  color2: number,
  factor: number
): number {
  factor = Math.max(0, Math.min(1, factor));

  const r1 = (color1 >> 16) & 0xff;
  const g1 = (color1 >> 8) & 0xff;
  const b1 = color1 & 0xff;

  const r2 = (color2 >> 16) & 0xff;
  const g2 = (color2 >> 8) & 0xff;
  const b2 = color2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return (r << 16) | (g << 8) | b;
}
```

### Usage
- **Newborn cells:** Interpolate from light → base color
- **Infestation:** Mix host color with infestor color
- **Conversion:** Transition old → white → new color

---

## 📐 GRID LAYOUT SYSTEM

### Grid Configuration

```typescript
// File: client/src/features/battle/BattleRenderer.ts
// Lines: 64-67

gridWidth = 32;   // Default (can be 64)
gridHeight = 20;  // Default (can be 40)
totalCells = 640; // 32×20 (or 2560 for 64×40)
```

### Responsive Sizing

```typescript
// File: client/src/features/battle/BattleRenderer.ts
// Lines: 267-289

private calculateResponsiveSizing(): void {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Fill screen EXACTLY
  this.currentCellDiameter = screenWidth / this.gridWidth;
  const cellHeight = screenHeight / this.gridHeight;

  this.currentCellGap = 0;  // Seamless grid
  this.scaleFactor = this.currentCellDiameter / this.baseCellDiameter;

  // Store for rectangular cells
  (this as any).cellHeight = cellHeight;
}
```

### Cell Positioning

```typescript
// Grid position calculation
const idx = y * width + x;
const step = cellDiameter + cellGap;

container.position.x = x * step + step / 2;
container.position.y = y * step + step / 2;
```

---

## 🎯 PERFORMANCE OPTIMIZATIONS

### Rendering Strategy

1. **Graphics Reuse:** Clear and redraw same Graphics objects
2. **Container Pooling:** Cell containers created once, updated per tick
3. **Culling:** Only visible cells rendered (future optimization)
4. **Batching:** PixiJS automatic batching for same-texture sprites

### Update Frequency

| Effect | Update Rate | Reason |
|--------|-------------|--------|
| Cell Growth | Every frame (ticker) | Smooth animation |
| Combat Sparks | Every frame | Contested state check |
| Pressure Arrows | Every frame | Pressure state check |
| Infestation | Every frame | Progress animation |
| Conversion Ring | Every frame | Progress animation |

### Memory Management

```typescript
// Cell age tracking - cleared on cell death
private clearCellAges(): void {
  this.cellAges.clear();
}

// Container cleanup on destroy
destroy(): void {
  this.cellContainers.forEach(container => {
    container.destroy({ children: true });
  });
  this.cellContainers.clear();
  this.linesContainer.destroy();
  this.container.destroy();
}
```

---

## 🔧 CONFIGURATION CONSTANTS

### Lifecycle Timing

```typescript
NEWBORN_DURATION = 3000;    // 3 seconds (20% → 50%)
MATURING_DURATION = 4000;   // 4 seconds (50% → 100%)
MATURE_TIME = 7000;         // 7 seconds total (100% → 160%)
MAX_SIZE_MULTIPLIER = 1.6;  // 160% max size
```

### Effect Parameters

```typescript
// Combat sparks
SPARK_COUNT = 6;
SPARK_ANGLE_STEP = 60;  // degrees
SPARK_DISTANCE_OFFSET = 4;  // px
SPARK_ALPHA = 0.8;

// Pressure arrows
ARROW_MAX_COUNT = 8;
ARROW_COLOR = 0xff0000;
ARROW_ALPHA = 0.6;
ARROW_WINGSPAN = 4;  // px

// Infestation particles
PARTICLE_MIN = 2;
PARTICLE_MAX = 8;
PARTICLE_SPEED_BASE = 400;
PARTICLE_SPEED_REDUCTION = 200;
TENDRIL_COUNT = 8;
TENDRIL_LENGTH_MAX = 0.5;  // × radius

// Conversion ring
RING_OFFSET = 6;  // px
RING_LINE_WIDTH = 3;  // px
RING_ALPHA = 0.8;
RING_COLOR = 0x00ff00;

// Glow
GLOW_ALPHA_NORMAL = 0.3;
GLOW_ALPHA_CONTESTED = 0.6;
GLOW_RADIUS_NORMAL = 5;  // px
GLOW_RADIUS_CONTESTED = 8;  // px
```

---

## 📝 CHANGELOG

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-03-03 | 1.2 | Fixed: Virus colors match VirusTubeManager tabs (R/B/G/Y) | ELYSIUM v2.0 |
| 2026-03-03 | 1.1 | Updated: Cell growth to 160%, virus colors match tabs | ELYSIUM v2.0 |
| 2026-03-03 | 1.0 | Initial documentation | ELYSIUM v2.0 |

---

## 📖 RELATED DOCUMENTS

- [`VFX_SPEC.md`](./VFX_SPEC.md) - Original VFX specification
- [`GAME_MECHANICS.md`](./GAME_MECHANICS.md) - Game mechanics
- [`BattleRenderer.ts`](./client/src/features/battle/BattleRenderer.ts) - Implementation

---

**Maintenance Rule:** Update this file whenever visual effects are added, modified, or removed. Include algorithm pseudocode, configuration constants, and performance characteristics.
