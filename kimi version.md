Based on my analysis of your comprehensive ViRU5 V5 concept document and current research on emergent gameplay systems, ECS architecture, and PixiJS v8 performance optimization, here is my in-depth implementation recommendation:
🏗️ 1. Architecture Review: The Hybrid ECS Approach
Current State Analysis
Your existing architecture uses a traditional OOP approach with BattleManager orchestrating everything. The document mentions several "exists but not connected" systems (BioTypes.ts, SynergyCalculator.ts, etc.), which suggests a partial ECS implementation attempt that was abandoned.
Recommended Architecture: Sparse ECS with Data-Oriented Design
Given your constraints (2,560 cells, 60 FPS target, existing PixiJS v8 renderer), I recommend a hybrid approach rather than a pure ECS rewrite:
plain
Copy

┌─────────────────────────────────────────────────────────────┐
│                    BATTLE MANAGER (Orchestrator)            │
├─────────────────────────────────────────────────────────────┤
│  Data Layer (Flat Arrays)        Systems Layer (Processors) │
│  ├─ positions: Float32Array      ├─ BiologicalStateSystem  │
│  ├─ owners: Uint8Array           ├─ SynergySystem          │
│  ├─ hp: Float32Array             ├─ ChaosSystem            │
│  ├─ genome: Genome[]             ├─ EnvironmentSystem      │
│  ├─ environment: CellEnv[]       └─ SpreadSystem           │
│  └─ visualState: VisualState[]                              │
└─────────────────────────────────────────────────────────────┘

Why not pure ECS?

    Pure ECS with archetypes requires component migration when adding/removing states (expensive for frequent state changes like DESPERATE ↔ ACTIVE) 
    Your 2,560 entities are relatively small; object pooling + flat arrays will outperform complex ECS overhead 
    You need to maintain existing PixiJS Graphics objects (not easily ECS-compatible)

The "Genome" as a Flyweight Pattern
Your HiddenGenome concept should use structural sharing to avoid 2,560 duplicate objects:
TypeScript
Copy

// Genome is immutable, shared between related cells
interface Genome {
  id: string;                    // Unique lineage ID
  generation: number;
  behavioralArchetype: Archetype;
  stressThreshold: number;       // Determined by params
  mutationRate: number;
  parentGenomeId: string | null;
}

// Cell-specific mutable state (separate from genome)
interface CellState {
  genomeId: string;              // Reference to shared genome
  stressLevel: number;           // Current stress (0-100)
  energyReserves: number;        // Metabolic energy
  currentState: BiologicalState;
  activeEffects: EffectInstance[];
  // ... other ephemeral state
}

⚡ 2. Performance Analysis: 60 FPS with 2,560 Cells
Critical Bottlenecks Identified
Table
System	Cost	Mitigation
Biological State Updates	O(n) per tick	Batch updates, skip dormant cells
Synergy Recalculation	O(n × m²)	Cache results, recalculate only on param change
Chaos Events	O(n) random checks	Spatial hashing, event queue
Visual Effects	GPU-bound	ParticleContainer for effects, not cells
PixiJS v8 Optimization Strategy
Based on PixiJS v8 benchmarks , you can render 1 million particles at 60 FPS, but your current Graphics-based approach will choke at 2,560 cells if each has complex visual states.
Recommended Rendering Architecture:
TypeScript
Copy

// LAYER 1: Static Grid (Cached Bitmap)
// Base grid lines, nutrient density heatmap
const gridLayer = new PIXI.Container();
gridLayer.cacheAsBitmap = true;  // Update only when environment changes

// LAYER 2: Cell Bodies (ParticleContainer)
// 2,560 cells as tinted sprites, not Graphics
const cellLayer = new PIXI.ParticleContainer({
  dynamicProperties: {
    position: true,    // Cells move rarely (only in mobility events)
    scale: true,       // Growth animation
    color: true,       // State changes (white→red→blue)
    alpha: true        // Latent states
  }
});

// LAYER 3: Dynamic Effects (Standard Container)
// Combat sparks, infestation particles, synergy auras
// These are temporary and need standard container flexibility
const fxLayer = new PIXI.Container();

// LAYER 4: UI Overlay (Standard Container)
// Text popups, chaos event announcements
const uiLayer = new PIXI.Container();

Cell Rendering Optimization:
TypeScript
Copy

// Use 1x1 white texture, tint for color (avoids texture swaps)
const baseTexture = PIXI.Texture.WHITE;

class CellRenderer {
  private sprites: PIXI.Sprite[] = [];
  
  init() {
    for (let i = 0; i < 2560; i++) {
      const sprite = new PIXI.Sprite(baseTexture);
      sprite.width = CELL_SIZE;
      sprite.height = CELL_SIZE;
      // Position based on grid index
      sprite.x = (i % GRID_WIDTH) * CELL_SIZE;
      sprite.y = Math.floor(i / GRID_WIDTH) * CELL_SIZE;
      this.cellLayer.addChild(sprite);
      this.sprites.push(sprite);
    }
  }
  
  updateCell(index: number, state: CellRenderState) {
    const sprite = this.sprites[index];
    
    // Color mapping: Use tint instead of recreating graphics
    sprite.tint = this.getStateColor(state);
    sprite.alpha = state.isLatent ? 0.3 : 1.0;
    sprite.scale.set(state.isDesperate ? 1.5 : 1.0);
    
    // Defense visualization: Use overlay sprite, not redraw
    if (state.defense > 6) {
      this.updateDefenseOverlay(index, state.defense);
    }
  }
}

Memory Budget Estimate
Table
Component	Memory	Notes
Genome Pool	~500 KB	100 unique genomes × 5 KB
Cell States	~200 KB	2,560 × 80 bytes
Environment	~100 KB	2,560 × 40 bytes
Visual State	~150 KB	2,560 × 60 bytes
PixiJS Sprites	~2 MB	ParticleContainer overhead
Total	~3 MB	Well under 100 MB target
💻 3. Critical System Implementations
A. Hidden Genome System (Phase 1 Priority)
TypeScript
Copy

// File: client/src/features/battle/GenomeSystem.ts

export class GenomeSystem {
  private genomes: Map<string, Genome> = new Map();
  private cellStates: CellState[] = [];
  private nextGenomeId = 0;
  
  // Flyweight pattern: Reuse genomes for clones
  private genomePool: Genome[] = [];
  
  initialize(gridSize: number, playerParams: VirusParams[]) {
    // Create root genomes for each player
    for (let playerId = 1; playerId <= playerParams.length; playerId++) {
      const rootGenome = this.createRootGenome(playerParams[playerId - 1]);
      this.genomes.set(rootGenome.id, rootGenome);
    }
    
    // Initialize cell states
    this.cellStates = new Array(gridSize).fill(null).map((_, i) => ({
      genomeId: '',  // Empty initially
      stressLevel: 0,
      energyReserves: 100,
      currentState: BiologicalState.INACTIVE,
      activeEffects: [],
      divisionCount: 0,
      lastCombatTick: 0
    }));
  }
  
  private createRootGenome(params: VirusParams): Genome {
    return {
      id: `gen-${this.nextGenomeId++}`,
      generation: 0,
      behavioralArchetype: this.determineArchetype(params),
      stressThreshold: 50 + (params.Resilience * 4), // 50-98 range
      mutationRate: 0.01 + (params.Mutation * 0.005), // 1-7% base
      parentGenomeId: null,
      paramSignature: this.hashParams(params)
    };
  }
  
  // Called when cell divides
  onCellDivision(parentIndex: number, childIndex: number): void {
    const parentState = this.cellStates[parentIndex];
    const parentGenome = this.genomes.get(parentState.genomeId)!;
    
    // Inherit with possible mutation
    const childGenome = this.mutateGenome(parentGenome);
    this.genomes.set(childGenome.id, childGenome);
    
    this.cellStates[childIndex] = {
      ...parentState,
      genomeId: childGenome.id,
      stressLevel: parentState.stressLevel * 0.5, // Reset stress
      divisionCount: 0,
      generation: parentGenome.generation + 1
    };
    
    parentState.divisionCount++;
    parentState.energyReserves -= 20; // Division cost
  }
  
  private mutateGenome(parent: Genome): Genome {
    // 90% chance to inherit exactly, 10% chance to mutate
    if (Math.random() > 0.1) {
      return { ...parent, id: `gen-${this.nextGenomeId++}` };
    }
    
    // Epigenetic mutation: Slight drift in thresholds
    return {
      ...parent,
      id: `gen-${this.nextGenomeId++}`,
      generation: parent.generation + 1,
      parentGenomeId: parent.id,
      stressThreshold: Math.max(10, Math.min(100, 
        parent.stressThreshold + (Math.random() - 0.5) * 10
      )),
      mutationRate: Math.max(0.001, 
        parent.mutationRate * (0.9 + Math.random() * 0.2)
      )
    };
  }
  
  // Batch update for performance
  updateAll(tick: number, combatEvents: CombatEvent[]): void {
    // Process stress accumulation from combat
    for (const event of combatEvents) {
      const state = this.cellStates[event.cellIndex];
      state.stressLevel = Math.min(100, state.stressLevel + 15);
      state.lastCombatTick = tick;
    }
    
    // Decay stress over time (every 5 ticks)
    if (tick % 5 === 0) {
      for (const state of this.cellStates) {
        if (state.stressLevel > 0) {
          state.stressLevel = Math.max(0, state.stressLevel - 2);
        }
        // Metabolism
        state.energyReserves = Math.max(0, state.energyReserves - 0.5);
      }
    }
  }
  
  getArchetype(cellIndex: number): Archetype {
    const state = this.cellStates[cellIndex];
    if (!state.genomeId) return 'NOMAD';
    return this.genomes.get(state.genomeId)!.behavioralArchetype;
  }
}

B. Biological State Machine (Phase 1 Priority)
TypeScript
Copy

// File: client/src/features/battle/BiologicalStateMachine.ts

export class BiologicalStateMachine {
  private transitions: Map<BiologicalState, StateTransition[]>;
  
  constructor() {
    this.transitions = new Map([
      [BiologicalState.ACTIVE, [
        { to: BiologicalState.STRESSED, condition: (s, e) => s.stressLevel > 70 },
        { to: BiologicalState.DESPERATE, condition: (s, e) => e.hp < 10 && e.resilience > 8 },
        { to: BiologicalState.HYPERMUTATING, condition: (s, e) => s.stressLevel > 90 && e.mutation > 6 }
      ]],
      [BiologicalState.STRESSED, [
        { to: BiologicalState.ACTIVE, condition: (s, e) => s.stressLevel < 30 },
        { to: BiologicalState.DESPERATE, condition: (s, e) => s.energyReserves < 10 },
        { to: BiologicalState.CANNIBAL, condition: (s, e) => s.energyReserves < 5 && e.aggression > 7 }
      ]],
      // ... other states
    ]);
  }
  
  updateCell(index: number, state: CellState, env: CellEnvironment, params: VirusParams): BiologicalState {
    const current = state.currentState;
    const possible = this.transitions.get(current) || [];
    
    for (const transition of possible) {
      if (transition.condition(state, { hp: env.hp, resilience: params.Resilience, mutation: params.Mutation, aggression: params.Aggression })) {
        if (transition.to !== current) {
          this.onStateEnter(index, state, transition.to);
          return transition.to;
        }
      }
    }
    
    return current;
  }
  
  private onStateEnter(index: number, state: CellState, newState: BiologicalState): void {
    state.currentState = newState;
    
    // Immediate state effects
    switch (newState) {
      case BiologicalState.DESPERATE:
        state.energyReserves -= 30; // Adrenaline cost
        // Emit event for visual feedback
        this.emitStateChange(index, 'DESPERATE', { statBoost: 1.5 });
        break;
        
      case BiologicalState.CANNIBAL:
        this.emitStateChange(index, 'CANNIBAL', { target: 'ally' });
        break;
        
      case BiologicalState.SENESCENT:
        state.energyReserves = 50; // Zombie resurrection
        this.emitStateChange(index, 'ZOMBIE', { immune: true });
        break;
    }
  }
  
  // Batch processing for performance
  updateAll(indices: number[], states: CellState[], environments: CellEnvironment[], params: VirusParams[]): BiologicalState[] {
    return indices.map(i => this.updateCell(i, states[i], environments[i], params[Math.floor(i / (2560 / 4))]));
  }
}

C. Synergy Calculator (Phase 2 Priority)
TypeScript
Copy

// File: client/src/features/battle/SynergySystem.ts

interface SynergyResult {
  attackMult: number;
  defenseMult: number;
  speedMult: number;
  special: string | null;
  visualAura: string | null;
}

export class SynergySystem {
  // Pre-computed synergy matrix for O(1) lookup
  private synergyCache: Map<string, SynergyResult> = new Map();
  
  calculate(params: VirusParams): SynergyResult {
    const key = this.paramKey(params);
    if (this.synergyCache.has(key)) {
      return this.synergyCache.get(key)!;
    }
    
    const result: SynergyResult = {
      attackMult: 1.0,
      defenseMult: 1.0,
      speedMult: 1.0,
      special: null,
      visualAura: null
    };
    
    // Check all parameter pairs
    const pairs = [
      ['Aggression', 'Virulence', this.checkBloodlust],
      ['Aggression', 'Defense', this.checkBerserkerArmor],
      ['Mutation', 'Stealth', this.checkPhantomPlague],
      ['Reproduction', 'Resilience', this.checkCancerousGrowth],
      ['Speed', 'Mobility', this.checkSwarmTactics],
    ];
    
    for (const [p1, p2, checker] of pairs) {
      const synergy = checker(params[p1 as keyof VirusParams], params[p2 as keyof VirusParams]);
      if (synergy) {
        result.attackMult *= synergy.attack || 1;
        result.defenseMult *= synergy.defense || 1;
        result.speedMult *= synergy.speed || 1;
        if (synergy.special) result.special = synergy.special;
        if (synergy.aura) result.visualAura = synergy.aura;
      }
    }
    
    // Triad synergies
    if (params.Aggression > 6 && params.Virulence > 6 && params.Reproduction > 6) {
      result.special = 'APOCALYPSE';
      result.attackMult *= 3;
      result.speedMult *= 3;
      result.visualAura = 'apocalypse-red';
    }
    
    this.synergyCache.set(key, result);
    return result;
  }
  
  private checkBloodlust(a: number, v: number) {
    if (a * v > 50) {
      return {
        attack: 2.5,
        special: 'BLOODLUST',
        aura: 'blood-red-pulse'
      };
    }
    return null;
  }
  
  private checkPhantomPlague(m: number, s: number) {
    if (m + s > 12) {
      return {
        attack: 1.6,
        special: 'PHANTOM_PLAGUE',
        aura: 'ghostly-white'
      };
    }
    return null;
  }
  
  private paramKey(params: VirusParams): string {
    // Quantize params to reduce cache size (0-12 → 0-6)
    return Object.values(params).map(v => Math.floor(v / 2)).join(',');
  }
}

D. Chaos Engine (Phase 2 Priority)
TypeScript
Copy

// File: client/src/features/battle/ChaosSystem.ts

export class ChaosSystem {
  private entropyPool = 0;
  private activeEvents: Map<number, ChaosEventInstance> = new Map(); // cellIndex -> event
  
  inject(gridState: GridState, tick: number): ChaosEvent[] {
    const events: ChaosEvent[] = [];
    const chaosRate = this.calculateChaosRate(gridState);
    
    // Spatial hashing: Only check 10% of cells per tick (round-robin)
    const checkStart = (tick % 10) * Math.floor(gridState.cells.length / 10);
    const checkEnd = Math.min(checkStart + Math.floor(gridState.cells.length / 10), gridState.cells.length);
    
    for (let i = checkStart; i < checkEnd; i++) {
      if (gridState.cells[i].owner === 0) continue;
      
      if (Math.random() < chaosRate) {
        const event = this.rollEvent(gridState.cells[i]);
        if (event) {
          this.activeEvents.set(i, { event, startTick: tick, duration: event.duration });
          events.push({ cellIndex: i, type: event.name });
        }
      }
    }
    
    // Weird events (every 100 ticks)
    if (tick % 100 === 0 && Math.random() < 0.2) {
      const weird = this.rollWeirdEvent(gridState);
      if (weird) events.push(weird);
    }
    
    return events;
  }
  
  private calculateChaosRate(state: GridState): number {
    const base = 0.005; // 0.5% base
    const mutationBonus = state.avgMutation * 0.002;
    const stressBonus = state.avgStress * 0.001;
    return Math.min(0.05, base + mutationBonus + stressBonus); // Cap at 5%
  }
  
  private rollEvent(cell: CellData): ChaosEventDefinition | null {
    const roll = Math.random();
    const events = [
      { name: 'REVERSE_POLARITY', weight: 0.3, duration: 5, effect: this.reversePolarity },
      { name: 'MITOSIS_ERROR', weight: 0.2, duration: 1, effect: this.mitosisError },
      { name: 'FRIENDLY_FIRE', weight: 0.15, duration: 10, effect: this.friendlyFire },
      { name: 'ENERGY_SPIKE', weight: 0.25, duration: 3, effect: this.energySpike },
      { name: 'GENOME_DRIFT', weight: 0.1, duration: 20, effect: this.genomeDrift }
    ];
    
    const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
    let cumulative = 0;
    
    for (const event of events) {
      cumulative += event.weight / totalWeight;
      if (roll < cumulative) return event;
    }
    return null;
  }
  
  private reversePolarity = (cell: CellData) => {
    cell.spreadDirection = (cell.spreadDirection + 4) % 8; // Reverse
  };
  
  private mitosisError = (cell: CellData, state: GridState) => {
    // Spawn 2 extra cells nearby (cancerous growth)
    // Implementation depends on grid topology
  };
  
  private rollWeirdEvent(state: GridState): ChaosEvent | null {
    const events = [
      { name: 'THE_BLOOM', weight: 5, setup: () => { state.globalReplicationBoost = 5; setTimeout(() => state.globalReplicationBoost = -5, 15000); }},
      { name: 'THE_SILENCE', weight: 5, setup: () => { state.combatEnabled = false; setTimeout(() => state.combatEnabled = true, 12500); }},
      { name: 'THE_SWAP', weight: 3, setup: () => this.randomSwap(state) },
      { name: 'THE_FLOOD', weight: 2, setup: () => { state.nutrientBoost = 2.0; }}
    ];
    
    const roll = Math.random() * 100;
    let cumulative = 0;
    
    for (const event of events) {
      cumulative += event.weight;
      if (roll < cumulative) {
        event.setup();
        return { type: 'WEIRD', name: event.name, global: true };
      }
    }
    return null;
  }
}

🔧 4. Integration Guide: Step-by-Step
Phase 0: Refactoring (Week 1)
Goal: Prepare architecture without changing gameplay

    Flatten Grid Data Structure
    TypeScript
    Copy

    // BEFORE: Array of objects
    grid: { owner: number, hp: number, ... }[]

    // AFTER: Structure of Arrays (SoA)
    owners: Uint8Array(2560)
    hps: Float32Array(2560)
    genomeIds: Uint16Array(2560)  // Reference to genome pool
    states: Uint8Array(2560)      // BiologicalState enum

    Extract BattleManager into Systems
        Move spread logic → SpreadSystem
        Move combat logic → CombatSystem
        Keep BattleManager as coordinator only

Phase 1: Genome & States (Week 2-3)
Goal: Add biological depth without breaking existing mechanics

    Integrate GenomeSystem
        Hook into cell division (existing spreadTick4Player)
        Add stress tracking to combat events
        Fallback: If performance drops, reduce genome diversity (max 50 unique genomes)
    Add Biological States
        Start with 3 states: ACTIVE, STRESSED, DESPERATE
        Visual feedback only (no gameplay effect yet)
        Test: Ensure 60 FPS with state updates

Phase 2: Synergies & Chaos (Week 4-5)
Goal: Introduce unpredictability

    Synergy Calculator
        Calculate on game start, cache results
        Update only when virus params change
        Visual auras using ParticleContainer
    Chaos Engine
        Start with 3 chaos events
        1 weird event per 200 ticks (reduced frequency for testing)
        Fallback: Disable if RNG feels unfair

Phase 3: Environment (Week 6)
Goal: Living grid (if performance allows)

    Cell Environment
        Nutrient depletion/regeneration
        Temperature based on virus density
        Visual: Heatmap overlay (cached bitmap, updated every 30 ticks)

🧪 5. Testing Strategy
Unit Tests for Emergent Systems
TypeScript
Copy

// Example: Test that BLOODLUST synergy triggers correctly
describe('SynergySystem', () => {
  it('should trigger BLOODLUST when Aggression * Virulence > 50', () => {
    const params = { Aggression: 8, Virulence: 7, /* ... */ };
    const result = synergySystem.calculate(params);
    expect(result.special).toBe('BLOODLUST');
    expect(result.attackMult).toBe(2.5);
  });
});

// Example: Test state transitions
describe('BiologicalStateMachine', () => {
  it('should transition to DESPERATE when HP < 10 and Resilience > 8', () => {
    const state = createCellState({ hp: 5, stress: 20 });
    const newState = stateMachine.updateCell(0, state, 
      { hp: 5, resilience: 9, mutation: 5, aggression: 5 }
    );
    expect(newState).toBe(BiologicalState.DESPERATE);
  });
});

Integration Tests for Emergence
TypeScript
Copy

// Run 100 battles with identical params, verify different outcomes
describe('Emergent Behavior', () => {
  it('should produce different results with same initial conditions', () => {
    const results = new Set();
    for (let i = 0; i < 100; i++) {
      const battle = runBattle(seedParams);
      results.add(battle.winner + '-' + battle.duration + '-' + battle.finalScore);
    }
    // Expect at least 10 unique outcomes
    expect(results.size).toBeGreaterThan(10);
  });
});

Performance Profiling
TypeScript
Copy

// Measure tick processing time
const start = performance.now();
battleManager.spreadTick4Player();
const duration = performance.now() - start;

// Assert < 16ms (60 FPS budget)
expect(duration).toBeLessThan(16);

🎨 6. Visual Effects Priority
Tier 1: Critical for Gameplay Understanding (Implement First)

    State Visuals
        DESPERATE: Red glow + 50% size increase
        STRESSED: Slight desaturation
        HYPERMUTATING: Glitch shader (simple RGB shift)
    Synergy Auras
        Simple colored rings (reuse defense ring logic)
        Different color per synergy type

Tier 2: Polish (Phase 2)

    Chaos Event Indicators
        Icon particles above affected cells
        Screen flash for weird events
    Environmental Feedback
        Nutrient density: Green → Brown tint
        Temperature: Heat shimmer (shader)

Tier 3: Deluxe (Phase 3)

    CRT Post-Processing
        Scanlines, slight curve, chromatic aberration
        Warning: Test performance impact on low-end devices
    Advanced Spawn Effects
        Scale bounce using tweening
        Particle burst on division

🛡️ 7. Fallback Plan: Minimum Viable Emergence
If full implementation threatens timeline or performance, implement this "Emergence Lite" version:
Core Features (Cannot Cut)

    3 Biological States: ACTIVE, STRESSED, DESPERATE
        Only affect stats (no complex behaviors)
        Simple visual feedback (color/scale)
    3 Synergy Bonuses:
        BLOODLUST (Aggression + Virulence)
        PHANTOM_PLAGUE (Mutation + Stealth)
        JUGGERNAUT (Aggression + Defense)
    1 Chaos Event: MITOSIS_ERROR (10% chance to spawn extra cell)

Cut Features (In Order)

    Environmental System (Phase 5) - Complex, least gameplay impact
    Genome Lineage Tracking - Keep stress/energy, remove parent tracking
    Chaos Weird Events - Keep only cell-level chaos
    Zombie/Senescent State - Edge case, complex to balance

Performance Emergency Measures
If FPS drops below 60:

    Reduce grid to 40×40 (1,600 cells)
    Update biological states every 2nd tick
    Disable synergy recalculation after battle start
    Use simpler sprites (no shaders)

⏱️ 8. Implementation Timeline
Table
Phase	Duration	Deliverable	Risk Level
0. Refactoring	1 week	Flat data structure, system separation	Low
1. Genome & States	2 weeks	Living cells with stress/metabolism	Medium
2. Synergies	1 week	Non-linear parameter interactions	Low
3. Chaos	1 week	Unpredictable events	Medium
4. Environment	1 week	Living grid (optional)	High
5. Polish	1 week	VFX, balance, bug fixes	Low
Total	6-7 weeks	Full ecosystem simulation	
Critical Path: Phase 0 → Phase 1 → Phase 2. Phases 3-4 can be cut if needed.
🎯 Final Recommendations

    Start with Data-Oriented Design: Flat arrays and struct-of-arrays will give you better performance than ECS for 2,560 entities 
    Use ParticleContainer for Cells: PixiJS v8's ParticleContainer handles 1M+ particles at 60 FPS . Use this for cells, not just effects.
    Cache Synergies: Pre-calculate at battle start. The 12-point budget means only ~1,000 unique combinations.
    Batch State Updates: Don't update all 2,560 cells every tick. Use round-robin or spatial partitioning.
    Test Emergence Early: Run 100 identical battles after Phase 1. If outcomes are too similar, increase chaos rate.
    Profile on Target Hardware: Test on your minimum spec device after each phase. It's easier to optimize early than refactor late.

This architecture gives you the emergent, living ecosystem feel while maintaining the deterministic performance characteristics needed for competitive gameplay. The key is layered complexity: simple rules that interact to create unpredictable outcomes, not complex rules that are hard to debug.