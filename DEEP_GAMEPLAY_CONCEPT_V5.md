# ViRU5 V4 - DEEP GAMEPLAY ENHANCEMENT CONCEPT
## Version: 5.0 "Emergent Artificial Life"
## Date: 2026-03-04
## Target: Transform from deterministic strategy to living ecosystem simulation

---

## 🎯 EXECUTIVE SUMMARY

**Current State:** ViRU5 is a competitive 2-player (or 4-virus sandbox) virus battle game where players configure 10 genetic parameters and watch autonomous viruses fight for dominance.

**Problem:** Battles are **too predictable**. Same parameters = same outcome every time. No emergence, no surprise, no "artificial life" feeling.

**Goal:** Transform ViRU5 into a **living ecosystem** where viruses exhibit emergent behaviors, unpredictable mutations, and complex biological interactions - while keeping the core 10-parameter system intact.

**Core Innovation:** Every virus cell has an **invisible "genome"** that evolves during battle, creating true artificial life that surprises even its creator.

---

## 📊 CURRENT ARCHITECTURE (What Exists)

### 1. Virus Parameter System (10 Stats, 12 Points Budget)

```typescript
// File: client/src/features/battle/BattleManager.ts
export interface VirusParams {
  aggression: number;      // ⚔️ Attack power & combat priority
  mutation: number;        // 🧬 Infestation chance & adaptation
  speed: number;           // ⚡ Spread range & speed
  defense: number;         // 🛡️ Damage reduction & shield strength
  reproduction: number;    // 🦠 Resource efficiency & spawn rate
  stealth: number;         // 👻 Shield piercing & detection avoidance
  virulence: number;       // ☣️ Infection speed & conversion rate
  resilience: number;      // 💪 HP regeneration & recovery
  mobility: number;        // 🚶 Emergency jump range
  intellect: number;       // 🧠 Strategy (resistance to conversion)
  contagiousness: number;  // 🫁 Number of targets for infestation
  lethality: number;       // 💀 Damage multiplier
}
```

**Current Mechanics:**
- **Spread Phase:** Viruses expand to adjacent empty cells (500ms tick)
- **Combat Phase:** Adjacent enemies fight (attack vs defense)
- **Infestation Phase:** Mutation-based parasitic takeover
- **Victory:** First to control 90%+ of occupied cells

### 2. Visual Effects (Working)

| Effect | Description | Status |
|--------|-------------|--------|
| **Cell Growth** | 20% → 200% size over 7 seconds | ✅ Working |
| **Defense Rings** | 0-12 concentric rings (1 per defense point) | ✅ Working |
| **Combat Sparks** | 6 virus-colored spikes on contested cells | ✅ Working |
| **Pressure Arrows** | Even number (0,2,4,6,8) pointing inward | ✅ Working |
| **Infestation Particles** | Orbiting dots + critical stage tendrils | ✅ Working |
| **Conversion Ring** | Green progress arc during capture | ✅ Working |
| **Glow Effects** | Virus-colored glow (stronger when contested) | ✅ Working |

**Code Sample - Current Color System:**
```typescript
// File: client/src/features/battle/BattleRenderer.ts
private readonly COLORS = {
  virus1: 0xff0000,   // RED (tab 1)
  virus2: 0x0000ff,   // BLUE (tab 2)
  virus3: 0x00ff00,   // GREEN (tab 3)
  virus4: 0xffff00,   // YELLOW (tab 4)
};

// All VFX use virus-specific colors now
const sparkColor = virusType ? this.COLORS[`virus${virusType}`] : 0xffffff;
const arrowColor = virusType ? this.COLORS[`virus${virusType}`] : 0xff0000;
```

### 3. File Structure (What's Already in Place)

```
V4/client/src/features/battle/
├── BattleManager.ts           ✅ Core battle logic
├── BattleRenderer.ts          ✅ Visualization (Graphics-based)
├── BattleRendererOptimized.ts ⚠️ Alternative (Sprite-based, not used)
├── VirusTubeManager.ts        ✅ Parameter UI (4 viruses)
├── VirusParamsUI.ts           ❌ Empty stub
├── BioTypes.ts                ✅ Type definitions (NOT connected)
├── SynergyCalculator.ts       ✅ Calculator (NOT connected)
├── BiologicalStateMachine.ts  ✅ State machine (NOT connected)
├── ChaosEngine.ts             ✅ Chaos events (NOT connected)
└── AIArchetypes.ts            ✅ AI personalities (NOT connected)

V4/client/src/features/lab/
├── LaboratoryManager.ts       ❌ Stub only
└── index.ts                   ✅ Lazy loading
```

---

## 🚨 WHAT'S MISSING (The Gap)

### Problem 1: No Emergent Behavior

**Current:** Virus with Aggression=10 always behaves the same way.

**Needed:** Virus with Aggression=10 might:
- Become "Berserker" (attacks everything, including allies) if stressed
- Enter "Bloodlust" state (2.5x damage) when combined with high Virulence
- Develop "Combat Memory" (learns from successful attacks)

### Problem 2: No Biological Depth

**Current:** Cells are either alive (owned) or dead (empty/enemy).

**Needed:** Cells have **biological states**:
```typescript
enum BiologicalState {
  ACTIVE,        // Normal operation
  LATENT,        // Dormant, invisible, 90% reduced metabolism
  STRESSED,      // Low energy, reduced effectiveness
  DESPERATE,     // <10% HP, all stats +50% ("adrenaline")
  HYPERMUTATING, // Rapid genome changes every tick
  CANNIBAL,      // Consumes own cells for energy
  SENESCENT,     // "Zombie" - dead but still spreads slowly
  QUANTUM        // Exists in superposition (Stealth=10 weirdness)
}
```

### Problem 3: No Unpredictability

**Current:** Same params + same starting position = identical battle.

**Needed:** **Chaos Engine** with biological "errors":
```typescript
// File: client/src/features/battle/ChaosEngine.ts (exists but not used)
const chaosEvents = [
  {
    name: 'REVERSE_POLARITY',
    effect: 'Spreads in opposite direction intended',
    duration: 5,
    visual: 'Color inversion'
  },
  {
    name: 'MITOSIS_ERROR',
    effect: 'Creates 3 cells instead of 1 (cancerous)',
    duration: 1,
    visual: 'Cell splits into cluster'
  },
  {
    name: 'SYMBIOSIS_BREAKDOWN',
    effect: 'Nearby allies become enemies temporarily',
    duration: 15,
    visual: 'Allies flash red'
  }
];
```

### Problem 4: No Parameter Synergies

**Current:** Parameters are additive. Aggression=5 + Virulence=5 = 10 "attack power".

**Needed:** **Non-linear synergies**:
```typescript
// File: client/src/features/battle/SynergyCalculator.ts (exists but not used)
const EPIC_SYNERGY_MATRIX = {
  'Aggression': {
    'Virulence': {
      multiplier: (a, v) => (a * v > 50) ? 2.5 : 1.0,
      name: 'BLOODLUST',
      effect: 'Attacks everything, including own cells if isolated',
      weirdness: 'Occasionally enters berserker rage'
    },
    'Defense': {
      multiplier: (a, d) => (a > 7 && d > 7) ? 0.5 : 1.0,
      name: 'BERSERKER ARMOR',
      effect: 'High offense + defense = slow, deliberate attacks',
      weirdness: 'Becomes "juggernaut" - moves slowly but unstoppably'
    }
  },
  'Mutation': {
    'Stealth': {
      multiplier: (m, s) => (m + s > 12) ? 1.6 : 1.0,
      name: 'PHANTOM PLAGUE',
      effect: 'Invisible infestation that spreads undetected',
      weirdness: 'Infested cells show no symptoms for 20 ticks'
    }
  }
};
```

### Problem 5: No Environmental Feedback

**Current:** Grid is static. Cells don't affect their environment.

**Needed:** **Living Grid** with chemical gradients:
```typescript
interface CellEnvironment {
  // Chemical gradients (0-1)
  nutrientDensity: number;      // Consumed by viruses, regenerates slowly
  toxicityLevel: number;        // Increases with combat, decreases over time
  pHLevel: number;              // 0-14, affects different viruses differently
  
  // Physical properties
  temperature: number;          // 20-40°C, changes with virus density
  pressure: number;             // Increases with overcrowding
  
  // Biological memory
  previousOwners: number[];     // Last 5 owners, affects "haunting"
  mutationHotspot: boolean;     // Random 5% of cells, double mutation rate
  
  update(): void {
    // Nutrient depletion
    if (this.currentOwner > 0) {
      this.nutrientDensity -= 0.02;
    }
    
    // Metabolic heat
    const nearbyViruses = this.countNearbyViruses();
    this.temperature = 20 + (nearbyViruses * 2);
    
    // Toxicity from combat
    if (this.recentCombat) {
      this.toxicityLevel += 0.1;
    }
  }
}
```

---

## 🎮 WHAT WE NEED TO BUILD (The Upgrade Path)

### Phase 1: Hidden Genome System (Priority: HIGH)

**Goal:** Add invisible genome that evolves during battle.

**What to Add:**
```typescript
// File: client/src/features/battle/BioTypes.ts (already exists, extend it)
interface HiddenGenome {
  // Epigenetic markers (change based on environment)
  stressLevel: number;         // Increases with combat, decreases with rest
  generation: number;          // How many times this cell divided
  parentLineage: string[];     // Last 5 ancestor cell IDs
  
  // Behavioral genes (emerge from visible parameters)
  behavioralArchetype: 'HUNTER' | 'BUILDER' | 'PARASITE' | 'NOMAD' | 'SWARM' | 'GHOST';
  
  // Mutation tracking
  visibleParamDrift: Partial<VirusParams>; // Secretly alters parameters
  accumulatedMutations: number;  // Total mutations this lineage
  
  // Memory (learns from experience)
  successfulAttacks: number[];   // Cell indices where this virus won
  failedAttacks: number[];      // Cell indices where this virus lost
  preferredDirections: number[]; // Compass directions (0-7) that worked
  
  // Metabolic state
  metabolicRate: number;         // 0.5 (slow) to 2.0 (fast)
  energyReserves: number;       // 0-100, consumed by actions
  
  // Environmental adaptation
  temperatureOptimum: number;    // 20-40°C, randomized at birth
  pHPreference: number;         // 0-14, affects combat effectiveness
}
```

**Integration Point:** BattleManager.spreadTick4Player()

---

### Phase 2: Biological State Machine (Priority: HIGH)

**Goal:** Cells transition between biological states based on conditions.

**What to Add:**
```typescript
// File: client/src/features/battle/BiologicalStateMachine.ts (already exists, extend it)
class BiologicalStateMachine {
  update(cell: VirusCell, environment: CellEnvironment): BiologicalState {
    const genome = cell.hiddenGenome;
    const params = cell.visibleParams;
    
    // Energy metabolism
    genome.energyReserves -= this.calculateMetabolicCost(params);
    
    // STARVATION → CANNIBAL
    if (genome.energyReserves < 10 && params.Aggression > 7) {
      this.enterState(BiologicalState.CANNIBAL);
      // Will consume adjacent friendly cells for energy
      this.consumeOwnCell();
    }
    
    // EXTREME STRESS → HYPERMUTATION
    if (genome.stressLevel > 90 && params.Mutation > 6) {
      this.enterState(BiologicalState.HYPERMUTATING);
      // Randomly alter visible parameters temporarily
      this.induceChaosMutation();
    }
    
    // LOW HP + HIGH RESILIENCE → DESPERATE (Last Stand)
    if (cell.hp < 10 && params.Resilience > 8) {
      this.enterState(BiologicalState.DESPERATE);
      // "Will to live" - all stats +50%, but burns energy fast
      genome.metabolicRate = 2.0;
    }
    
    // DEATH + HIGH VIRULENCE → SENESCENT (Zombie)
    if (cell.hp <= 0 && params.Virulence > 7) {
      this.enterState(BiologicalState.SENESCENT);
      cell.hp = 20; // Resurrects as zombie
      cell.isZombie = true;
      // Zombie cells: spread 50% slower, immune to infestation, attack both sides
    }
    
    return this.currentState;
  }
}
```

**Integration Point:** BattleManager.spreadTick4Player() - call before spread logic

**Visual Feedback Needed:**
- LATENT cells: Dim, gray, no glow
- DESPERATE cells: Violent shaking, red glow, +50% size
- HYPERMUTATING cells: Glitch effect, rapid color cycling
- SENESCENT (Zombie) cells: Gray, decayed look, slow pulse

---

### Phase 3: Synergy Calculator Integration (Priority: MEDIUM)

**Goal:** Non-linear parameter interactions create emergent builds.

**What to Add:**
```typescript
// File: client/src/features/battle/SynergyCalculator.ts (already exists, extend it)
class SynergyCalculator {
  recalculate(state: BattleState): void {
    for (const cell of state.grid) {
      if (cell.owner === 0) continue;
      
      const params = state.virusParams.get(cell.owner);
      const synergyMultipliers = this.calculateSynergies(params);
      
      // Apply multipliers to cell stats
      cell.attackMultiplier = synergyMultipliers.attack;
      cell.defenseMultiplier = synergyMultipliers.defense;
      cell.speedMultiplier = synergyMultipliers.speed;
      
      // Log epic synergies
      if (synergyMultipliers.epic) {
        console.log(`[Synergy] ${cell.owner} unlocked: ${synergyMultipliers.epic.name}`);
        // Add visual effect
        state.renderer.showSynergyEffect(cell, synergyMultipliers.epic);
      }
    }
  }
  
  private calculateSynergies(params: VirusParams): SynergyResult {
    const result = { attack: 1.0, defense: 1.0, speed: 1.0, epic: null };
    
    // Check all parameter pairs
    for (const [param1, param2] of this.getParamPairs(params)) {
      const synergy = EPIC_SYNERGY_MATRIX[param1]?.[param2];
      if (synergy) {
        const multiplier = synergy.multiplier(params[param1], params[param2]);
        result.attack *= multiplier;
        
        if (multiplier > 1.5) {
          result.epic = { name: synergy.name, effect: synergy.effect };
        }
      }
    }
    
    // Check triad synergies (3 parameters)
    if (params.Aggression > 6 && params.Virulence > 6 && params.Propagation > 6) {
      result.epic = { name: 'APOCALYPSE', effect: '3x damage, 3x spread' };
      result.attack *= 3;
      result.speed *= 3;
    }
    
    return result;
  }
}
```

**Integration Point:** BattleManager.spreadTick4Player() - call every 10 ticks

**Visual Feedback Needed:**
- Epic synergy unlock: Flash of light, text popup, color shift
- Ongoing synergy: Subtle aura/glow matching synergy type

---

### Phase 4: Chaos Engine (Priority: MEDIUM)

**Goal:** Unpredictable biological "errors" make each battle unique.

**What to Add:**
```typescript
// File: client/src/features/battle/ChaosEngine.ts (already exists, extend it)
class ChaosEngine {
  private entropyPool: number = 0;  // Accumulates randomness
  
  injectRandomness(state: BattleState): void {
    // Base chaos rate: 1-5% depending on Mutation
    const baseRate = 0.01 + (state.averageMutation * 0.004);
    
    // Stress increases chaos
    const stressBonus = state.averageStress * 0.001;
    
    // Replication introduces copying errors
    const replicationError = state.averageReplication * 0.002;
    
    const totalChaosRate = baseRate + stressBonus + replicationError;
    
    // Roll for chaos events
    for (const cell of state.grid) {
      if (cell.owner === 0) continue;
      if (Math.random() < totalChaosRate) {
        this.triggerChaosEvent(cell, state);
      }
    }
    
    // Roll for weird events (every 100 ticks)
    if (state.tick % 100 === 0) {
      this.rollWeirdEvent(state);
    }
  }
  
  private triggerChaosEvent(cell: VirusCell, state: BattleState): void {
    const events = [
      {
        name: 'REVERSE_POLARITY',
        effect: () => { cell.spreadDirection *= -1; },
        duration: 5,
        visual: () => { cell.color = invertColor(cell.color); }
      },
      {
        name: 'MITOSIS_ERROR',
        effect: () => { this.spawnExtraCells(cell, 3); },
        duration: 1,
        visual: () => { cell.scale = 1.5; }
      },
      {
        name: 'FRIENDLY_FIRE',
        effect: () => { cell.targetAllies = true; },
        duration: 10,
        visual: () => { cell.border = 'red-pulse'; }
      }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    event.effect();
    event.visual();
    
    // Remove effect after duration
    setTimeout(() => {
      // Revert changes
    }, event.duration * 500);
  }
  
  private rollWeirdEvent(state: BattleState): void {
    const roll = Math.random() * 100;
    
    if (roll < 5) {
      // THE BLOOM - All Replication +5, then crash
      state.allViruses.forEach(v => v.Replication += 5);
      setTimeout(() => {
        state.allViruses.forEach(v => v.Replication -= 10);
      }, 15000); // 30 ticks
      state.renderer.showWeirdEvent('THE BLOOM');
    }
    else if (roll < 10) {
      // THE SILENCE - No combat for 25 ticks
      state.combatDisabled = true;
      setTimeout(() => { state.combatDisabled = false; }, 12500);
      state.renderer.showWeirdEvent('THE SILENCE');
    }
    // ... 18 more weird events
  }
}
```

**Integration Point:** BattleManager.spreadTick4Player() - call at end of tick

**Visual Feedback Needed:**
- Chaos event: Icon above cell, color effect, particle burst
- Weird event: Full-screen overlay, text announcement, sound effect

---

### Phase 5: Environmental System (Priority: LOW)

**Goal:** Grid becomes a living ecosystem with feedback loops.

**What to Add:**
```typescript
// File: NEW - client/src/features/battle/CellEnvironment.ts
class CellEnvironment {
  private grid: CellData[][];
  
  update(): void {
    for (const cell of this.grid) {
      // Nutrient depletion
      if (cell.currentOwner > 0) {
        cell.nutrientDensity = Math.max(0, cell.nutrientDensity - 0.02);
      }
      
      // Metabolic heat from virus activity
      const nearbyViruses = this.countNearbyViruses(cell);
      cell.temperature = 20 + (nearbyViruses * 2);
      
      // Toxicity from recent combat
      if (cell.recentCombat) {
        cell.toxicityLevel = Math.min(1, cell.toxicityLevel + 0.1);
      }
      
      // Natural recovery
      cell.nutrientDensity = Math.min(1, cell.nutrientDensity + 0.01);
      cell.toxicityLevel = Math.max(0, cell.toxicityLevel - 0.005);
    }
  }
  
  // Environmental feedback loops
  applyEnvironmentalEffects(state: BattleState): void {
    for (const cell of state.grid) {
      const env = this.grid[cell.x][cell.y];
      
      // High temperature reduces Propagation
      if (env.temperature > 35) {
        cell.propagationMultiplier *= 0.5;
      }
      
      // High toxicity damages all viruses
      if (env.toxicityLevel > 0.7) {
        cell.hp -= 5;
      }
      
      // Low nutrients trigger starvation
      if (env.nutrientDensity < 0.2) {
        cell.isStarving = true;
        // Starving viruses may attack own cells
        if (cell.params.Aggression > 7) {
          this.cannibalizeNearbyAlly(cell);
        }
      }
      
      // Mutation hotspots
      if (env.mutationHotspot) {
        cell.mutationRate *= 2;
      }
    }
  }
}
```

**Integration Point:** BattleManager.spreadTick4Player() - call before spread logic

**Visual Feedback Needed:**
- Nutrient density: Green tint (rich) → Brown tint (depleted)
- Toxicity: Purple haze overlay
- Temperature: Heat shimmer effect (red/orange for hot)
- Mutation hotspots: Subtle glow/pulse

---

## 🎨 VISUAL EFFECTS TO ADD

### 1. Shield Hex Pattern (Defense Visualization)

**Current:** Concentric circles

**Needed:** Hexagonal grid overlay when defense > 6
```typescript
private drawHexShield(cell: PIXI.Container, defenseValue: number): void {
  if (defenseValue < 6) return;
  
  const hexGraphics = new PIXI.Graphics();
  const hexCount = Math.floor(defenseValue / 2);  // Up to 6 hexagons
  
  for (let i = 0; i < hexCount; i++) {
    const radius = cell.radius + (i * 4);
    hexGraphics.lineStyle(2, cell.virusColor, 0.6);
    hexGraphics.drawRegularPolygon(6, radius);  // 6 sides = hexagon
  }
  
  cell.addChild(hexGraphics);
}
```

### 2. Damage Flash & Shake

**Current:** No visual feedback on damage

**Needed:** Red flash + screen shake when cell takes damage
```typescript
private onCellDamage(cell: VirusCell, damage: number): void {
  // Red flash overlay
  const flash = new PIXI.Graphics();
  flash.beginFill(0xff0000, 0.5);
  flash.drawCircle(0, 0, cell.radius);
  flash.endFill();
  cell.addChild(flash);
  
  // Fade out
  setTimeout(() => { cell.removeChild(flash); }, 100);
  
  // Shake effect
  const originalX = cell.x;
  const originalY = cell.y;
  let shakeFrame = 0;
  const shakeInterval = setInterval(() => {
    cell.x = originalX + (Math.random() - 0.5) * 4;
    cell.y = originalY + (Math.random() - 0.5) * 4;
    shakeFrame++;
    if (shakeFrame > 5) {
      clearInterval(shakeInterval);
      cell.x = originalX;
      cell.y = originalY;
    }
  }, 16);  // ~60fps
}
```

### 3. Spawn Effect (Birth Animation)

**Current:** Cells appear at 20% size

**Needed:** Scale bounce + color flash on spawn
```typescript
private onCellSpawn(cell: VirusCell): void {
  // Start at 0% scale
  cell.scale = 0;
  
  // Animate to 120% then settle at 100%
  const startTime = Date.now();
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / 300);  // 300ms animation
    
    // Elastic out easing: overshoot to 1.2 then settle
    const scale = this.elasticOut(progress) * 1.2;
    cell.scale = scale;
    
    // Flash from white to virus color
    const colorAlpha = 1 - progress;
    cell.overlayColor = `rgba(255,255,255,${colorAlpha})`;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
}
```

### 4. Post-Processing (CRT + Bloom)

**Current:** No post-processing

**Needed:** Retro-futuristic CRT monitor effect
```typescript
// File: NEW - client/src/vfx/CRTFilter.ts
class CRTFilter extends PIXI.Filter {
  constructor() {
    super(
      // Vertex shader
      `attribute vec2 aVertexPosition;
       attribute vec2 aTextureCoord;
       uniform mat3 projectionMatrix;
       varying vec2 vTextureCoord;
       void main(void) {
         vTextureCoord = aTextureCoord;
         gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
       }`,
      // Fragment shader
      `varying vec2 vTextureCoord;
       uniform sampler2D uSampler;
       uniform float time;
       void main(void) {
         // Scanlines
         float scanline = sin(vTextureCoord.y * 800.0 + time) * 0.04;
         
         // Slight curve
         vec2 curved = vTextureCoord;
         curved.x += (curved.y - 0.5) * 0.03;
         
         // Chromatic aberration (edges only)
         float edgeDist = distance(vTextureCoord, vec2(0.5));
         vec2 aberration = vec2(edgeDist * 0.002, 0.0);
         
         // Sample texture
         vec4 color = texture2D(uSampler, curved + aberration);
         
         // Apply scanlines
         color.rgb -= scanline;
         
         gl_FragColor = color;
       }`
    );
  }
}

// Usage in BattleRenderer
this.app.stage.filters = [new CRTFilter()];
```

---

## 📋 INTEGRATION CHECKLIST

### What Needs to Change (File by File)

#### 1. BattleManager.ts
- [ ] Import HiddenGenome, BiologicalStateMachine, SynergyCalculator, ChaosEngine, CellEnvironment
- [ ] Add `hiddenGenomes: Map<number, HiddenGenome>` to track each cell's genome
- [ ] Add `bioState: BiologicalStateMachine` instance
- [ ] Add `synergyCalc: SynergyCalculator` instance
- [ ] Add `chaosEngine: ChaosEngine` instance
- [ ] Add `environment: CellEnvironment` instance
- [ ] Modify `spreadTick4Player()`:
  ```typescript
  private spreadTick4Player(): void {
    // Phase 1: Update biological states
    this.bioState.updateAll(this.gridData, this.hiddenGenomes);
    
    // Phase 2: Update environment
    this.environment.update();
    this.environment.applyEnvironmentalEffects(this.gridData);
    
    // Phase 3: Calculate synergies (every 10 ticks)
    if (this.state.tick % 10 === 0) {
      this.synergyCalc.recalculate(this.state);
    }
    
    // Phase 4: Normal spread logic (existing code)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // ... existing spread logic ...
      }
    }
    
    // Phase 5: Inject chaos
    this.chaosEngine.injectRandomness(this.state);
    
    // Phase 6: Update grid and notify
    this.gridData.grid = newGrid;
    if (this.onGridUpdateCallback) {
      this.onGridUpdateCallback(this.gridData.grid);
    }
  }
  ```

#### 2. BattleRenderer.ts
- [ ] Import new visual effect classes
- [ ] Add `showSynergyEffect(cell, synergy)` method
- [ ] Add `showWeirdEvent(eventName)` method
- [ ] Add `drawHexShield()` method
- [ ] Add `onCellDamage()` method
- [ ] Add `onCellSpawn()` method
- [ ] Modify `updateCell()` to visualize biological states:
  ```typescript
  private updateCell(container: PIXI.Container, value: number, cellIndex: number): void {
    const cell = container.cellGraphics;
    const genome = this.hiddenGenomes.get(cellIndex);
    const bioState = this.bioStates.get(cellIndex);
    
    // Visualize biological state
    switch (bioState) {
      case 'LATENT':
        this.addPulseEffect(cell, 0.2, 0x444444);  // Dim, slow pulse
        break;
      case 'DESPERATE':
        this.addShakeEffect(cell, 2);  // Violent shaking
        this.addGlow(cell, 0xff0000, 2.0);  // Red intense glow
        break;
      case 'HYPERMUTATING':
        this.addGlitchEffect(cell);  // Digital glitch
        this.addColorShift(cell);  // Rapid color cycling
        break;
      case 'SENESCENT':
        this.addZombieEffect(cell);  // Grey, decayed look
        break;
    }
    
    // Visualize synergy strength
    if (genome.synergyMultiplier > 1.5) {
      this.addSynergyAura(cell, genome.synergyMultiplier);
    }
    
    // Visualize chaos effects
    if (genome.activeChaosEffect) {
      this.addChaosIndicator(cell, genome.activeChaosEffect);
    }
    
    // ... existing cell rendering ...
  }
  ```

#### 3. main.ts
- [ ] Initialize new systems when battle starts:
  ```typescript
  this.battleManager.bioState = new BiologicalStateMachine();
  this.battleManager.synergyCalc = new SynergyCalculator();
  this.battleManager.chaosEngine = new ChaosEngine();
  this.battleManager.environment = new CellEnvironment();
  ```

---

## 🎯 EXPECTED OUTCOMES (What Players Will Experience)

### Before (Current)
- Same params = same outcome every time
- No surprise, no emergence
- Battles feel deterministic, robotic
- Visual feedback is basic (growth, rings, sparks)

### After (With Enhancements)
- **Emergent Behavior:** Same params can produce different outcomes
- **Unpredictability:** Chaos events create "wait, what?!" moments
- **Biological Depth:** Cells feel alive (states, metabolism, stress)
- **Strategic Variety:** Synergies reward creative parameter builds
- **Environmental Storytelling:** Grid tells a story (toxic zones, heat maps, nutrient depletion)
- **Visual Richness:** Every mechanic has visual feedback

### Example Battle Narrative (After)

> "Player 1's high-Aggression virus started strong, but after 50 ticks, the cells became **STRESSED** from constant combat. The **Chaos Engine** triggered a **MITOSIS_ERROR**, creating cancerous triplets that burned through energy reserves. Player 2's high-Mutation virus capitalized on this, unlocking the **PHANTOM PLAGUE** synergy (Mutation+Stealth >12) and infesting cells invisibly. At tick 100, the **THE SWAP** weird event randomly exchanged 15% of cells between players, completely shifting the battle. Player 1's cells in the **mutation hotspot** (top-right corner) began **HYPERMUTATING**, randomly changing parameters every tick. The grid's **toxicity level** from all the combat created a "no man's land" in the center where neither virus could spread. Finally, Player 2's virus entered **DESPERATE** state (<10% HP, high Resilience), gaining +50% stats and mounting a last-stand comeback. The battle ended at tick 180 with Player 2 winning 52%-48%, but both players said 'That was insane! Let's go again!'"

---

## 📞 NEXT STEPS (For AI Coder)

**Your Task:** Provide an **in-depth implementation recommendation** that includes:

1. **Architecture Review:** Is the proposed structure sound? What would you change?
2. **Performance Analysis:** Will this run at 60 FPS with 2560 cells? What optimizations are needed?
3. **Code Samples:** Provide working code for the **most critical** systems (Hidden Genome, Biological State Machine, Synergy Calculator).
4. **Integration Guide:** Step-by-step instructions for integrating these systems without breaking existing functionality.
5. **Testing Strategy:** How do we test emergent behavior? What unit tests are needed?
6. **Visual Effects Priority:** Which VFX should be implemented first for maximum impact?
7. **Fallback Plan:** If full implementation is too complex, what's the "minimum viable emergence" we can add?

**Deliverable Format:**
- Markdown document with code samples
- Priority-ordered task list
- Estimated implementation time for each phase
- Risk assessment (what could break)

**DO NOT** just provide code dumps. We need **conceptual guidance** on how to adapt our existing architecture to support emergent gameplay without rewriting everything from scratch.

---

**Current Project State:**
- ✅ Working: Basic 4-virus battle, parameter UI, cell lifecycle VFX
- ⚠️ Defined but Not Connected: BioTypes, SynergyCalculator, BiologicalStateMachine, ChaosEngine
- ❌ Missing: Hidden genome tracking, environmental system, post-processing VFX

**Repository:** https://github.com/kabuto-lab/ViRU5-V4.git
**Tech Stack:** TypeScript 5.0+, PixiJS v8.16, Colyseus 0.15, Vite 5.0
**Target Performance:** 60 FPS, <100MB memory, <500KB initial bundle

---

**Last Updated:** 2026-03-04
**Author:** ELYSIUM v2.0 (Senior TypeScript Architect)
**Status:** Ready for AI Coder Review
