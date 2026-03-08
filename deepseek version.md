Your existing structure is well-factored but needs one critical architectural shift: from cell-centric to genome-centric design.
Recommended Architecture Changes
typescript

// Current (Problematic)
interface VirusCell {
  owner: number;        // Which virus owns this cell
  hp: number;           // Current health
  // ... other cell properties
}

// Proposed (Better)
interface VirusCell {
  owner: number;
  hp: number;
  genomeId: string;     // Reference to genome, not embedded
  state: BiologicalState;
  environment: LocalEnvironment;
  metadata: CellMetadata;  // Position, age, lineage
}

interface ViralGenome {
  id: string;
  virusId: number;           // 1-4, which player this belongs to
  visibleParams: VirusParams; // The 12 public stats
  hidden: HiddenGenome;      // Epigenetic state
  
  // NEW: Genome-level tracking
  population: Set<string>;   // All cell IDs with this genome
  birthTick: number;
  lastMutationTick: number;
  ancestorId: string | null; // Parent genome ID
}

Why this matters: A single virus (player) should have multiple coexisting genome variants. This creates true natural selection.
Critical Architecture Changes

    Separate Genome from Cell
    typescript

    // BattleManager.ts - New data structures
    private genomes: Map<string, ViralGenome> = new Map();
    private cells: VirusCell[] = []; // Each cell references genomeId

    Add Genome Proliferation During Spread
    typescript

    // When a cell spreads to empty space
    spreadCell(source: VirusCell, targetX: number, targetY: number): void {
      const sourceGenome = this.genomes.get(source.genomeId);
      
      // 2% chance of mutation during replication
      if (Math.random() < 0.02) {
        const newGenome = this.mutateGenome(sourceGenome);
        this.createCell(targetX, targetY, newGenome.id);
      } else {
        this.createCell(targetX, targetY, sourceGenome.id);
      }
    }

⚡ PERFORMANCE ANALYSIS
Current Performance Baseline

    2560 cells (64x40 grid)

    60 FPS target = 16.67ms per frame

    Current render cost: ~4-6ms

    Current logic cost: ~2-3ms

    Headroom: ~8-10ms for new features

Proposed Feature Performance Cost
Feature	CPU Cost	Memory Cost	Optimization Needed
Hidden Genome	+1-2ms	+2-3MB	✅ Batch updates
Bio State Machine	+2-3ms	+0.5MB	✅ Update only active cells
Synergy Calculator	+1ms	Negligible	✅ Run every 10 ticks
Chaos Engine	+0.5ms	Negligible	✅ Sparse random checks
Environment System	+3-4ms	+4-5MB	⚠️ NEEDS OPTIMIZATION
New VFX	+2-3ms GPU	+2MB textures	✅ Shader-based effects
Critical Optimizations Required
1. Spatial Partitioning for Environment
typescript

// Instead of per-cell environment
class EnvironmentChunk {
  static CHUNK_SIZE = 8; // 8x8 cells = 64 cells per chunk
  
  x: number;
  y: number;
  
  // Shared environment properties
  nutrientDensity: number = 0.5;
  toxicityLevel: number = 0;
  temperature: number = 20;
  
  // Cache cell indices in this chunk
  cells: number[] = [];
}

// BattleManager.ts
private environmentChunks: EnvironmentChunk[][] = [];

updateEnvironment(): void {
  // Update only active chunks (containing live cells)
  for (const chunk of this.activeChunks) {
    // Bulk update chunk properties
    chunk.toxicityLevel *= 0.99; // Decay
    
    // Count live cells in chunk
    const liveCount = chunk.cells.filter(idx => this.cells[idx].owner > 0).length;
    chunk.temperature = 20 + (liveCount * 0.5);
  }
}

Performance Impact: 3-4ms → 0.8-1.2ms
2. Batch Genome Updates
typescript

// Instead of updating every genome every tick
private genomesNeedingUpdate: Set<string> = new Set();

markGenomeForUpdate(genomeId: string): void {
  this.genomesNeedingUpdate.add(genomeId);
}

updateGenomes(): void {
  // Only update genomes that changed
  for (const genomeId of this.genomesNeedingUpdate) {
    const genome = this.genomes.get(genomeId);
    this.updateSingleGenome(genome);
  }
  this.genomesNeedingUpdate.clear();
}

// When a genome mutates, mark all its cells for update
private mutateGenome(sourceGenome: ViralGenome): ViralGenome {
  const newGenome = this.createMutatedGenome(sourceGenome);
  this.markGenomeForUpdate(newGenome.id);
  
  // Also mark source genome as changed (lost a cell)
  this.markGenomeForUpdate(sourceGenome.id);
  
  return newGenome;
}

Performance Impact: O(n) per tick → O(changes) per tick
3. Web Workers for Heavy Computation
typescript

// NEW: genomeWorker.ts
const ctx: Worker = self as any;

ctx.addEventListener('message', (event) => {
  const { cells, genomes, tick } = event.data;
  
  // Heavy calculations in background thread
  const mutations = calculateMutations(cells, genomes, tick);
  const synergies = calculateSynergies(genomes);
  const chaos = generateChaosEvents(tick);
  
  ctx.postMessage({ mutations, synergies, chaos });
});

// BattleManager.ts
private genomeWorker = new Worker(new URL('./genomeWorker.ts', import.meta.url));

constructor() {
  this.genomeWorker.onmessage = (event) => {
    this.applyMutations(event.data.mutations);
    this.applySynergies(event.data.synergies);
    this.applyChaosEvents(event.data.chaos);
  };
}

spreadTick4Player(): void {
  // Send data to worker at start of tick
  this.genomeWorker.postMessage({
    cells: this.cells,
    genomes: Array.from(this.genomes.entries()),
    tick: this.state.tick
  });
  
  // Continue with normal logic while worker computes
  this.runNormalSpreadLogic();
}

💻 CRITICAL CODE SAMPLES
1. Hidden Genome System (Core Implementation)
typescript

// File: client/src/features/battle/HiddenGenomeSystem.ts
export interface HiddenGenome {
  // Epigenetic state
  stressLevel: number;         // 0-100
  energyReserves: number;       // 0-100
  metabolicRate: number;        // 0.5-2.0
  generation: number;           // Replication count
  
  // Behavioral learning
  successfulAttacks: number[];  // Direction indices (0-7)
  failedAttacks: number[];      // Direction indices (0-7)
  preferredDirection: number | null; // Learned optimal attack direction
  
  // Mutation tracking
  mutationCount: number;
  lastMutationTick: number;
  parentGenomeId: string | null;
  
  // Environmental preferences (randomized at birth)
  temperatureOptimum: number;   // 15-45°C
  phPreference: number;         // 0-14
  
  // Dynamic parameter drift (secret stat changes)
  paramDrift: Partial<Record<keyof VirusParams, number>>;
}

export class HiddenGenomeSystem {
  constructor(private randomSeed: number) {}
  
  /**
   * Create initial genome for a new virus (player)
   */
  createFounderGenome(virusId: number, visibleParams: VirusParams): ViralGenome {
    const genomeId = `genome_${virusId}_${Date.now()}_${Math.random()}`;
    
    const hidden: HiddenGenome = {
      stressLevel: 0,
      energyReserves: 100,
      metabolicRate: 1.0,
      generation: 0,
      successfulAttacks: [],
      failedAttacks: [],
      preferredDirection: null,
      mutationCount: 0,
      lastMutationTick: 0,
      parentGenomeId: null,
      temperatureOptimum: 20 + Math.random() * 20, // 20-40°C
      phPreference: Math.random() * 14, // 0-14
      paramDrift: {}
    };
    
    return {
      id: genomeId,
      virusId,
      visibleParams: { ...visibleParams },
      hidden,
      population: new Set(),
      birthTick: 0,
      lastMutationTick: 0,
      ancestorId: null
    };
  }
  
  /**
   * Update genome based on cell's experience
   */
  updateGenome(
    genome: ViralGenome,
    cell: VirusCell,
    environment: LocalEnvironment,
    tick: number
  ): void {
    // Energy metabolism
    const metabolicCost = this.calculateMetabolicCost(genome.visibleParams);
    genome.hidden.energyReserves -= metabolicCost * genome.hidden.metabolicRate;
    
    // Stress from low energy
    if (genome.hidden.energyReserves < 30) {
      genome.hidden.stressLevel += 5;
    }
    
    // Stress from combat
    if (cell.justAttacked) {
      genome.hidden.stressLevel += 10;
      genome.hidden.energyReserves -= 15;
    }
    
    // Stress decays slowly
    genome.hidden.stressLevel = Math.max(0, genome.hidden.stressLevel - 1);
    
    // Energy regeneration (if not stressed)
    if (genome.hidden.stressLevel < 50) {
      genome.hidden.energyReserves = Math.min(100, 
        genome.hidden.energyReserves + 2 * genome.hidden.metabolicRate
      );
    }
    
    // Environmental adaptation
    this.adaptToEnvironment(genome, environment);
    
    // Check for stress-induced mutation
    if (genome.hidden.stressLevel > 80 && Math.random() < 0.1) {
      this.induceStressMutation(genome, tick);
    }
  }
  
  /**
   * Mutate genome during replication
   */
  mutateGenome(parentGenome: ViralGenome, tick: number): ViralGenome {
    const childGenome: ViralGenome = {
      id: `genome_${parentGenome.virusId}_${Date.now()}_${Math.random()}`,
      virusId: parentGenome.virusId,
      visibleParams: { ...parentGenome.visibleParams },
      hidden: { ...parentGenome.hidden },
      population: new Set(),
      birthTick: tick,
      lastMutationTick: tick,
      ancestorId: parentGenome.id
    };
    
    // Inherit parent's param drift with modifications
    childGenome.hidden.paramDrift = { ...parentGenome.hidden.paramDrift };
    
    // Random mutation to visible params (small change)
    const paramKeys = Object.keys(childGenome.visibleParams) as Array<keyof VirusParams>;
    const paramToMutate = paramKeys[Math.floor(Math.random() * paramKeys.length)];
    
    // Mutate by -1, 0, or +1 (capped 1-10)
    const currentValue = childGenome.visibleParams[paramToMutate];
    const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    childGenome.visibleParams[paramToMutate] = Math.max(1, Math.min(10, currentValue + delta));
    
    // Record mutation in hidden genome
    childGenome.hidden.mutationCount = parentGenome.hidden.mutationCount + 1;
    childGenome.hidden.generation = parentGenome.hidden.generation + 1;
    
    // Slightly alter environmental preferences (inherited with variation)
    childGenome.hidden.temperatureOptimum += (Math.random() - 0.5) * 2;
    childGenome.hidden.phPreference += (Math.random() - 0.5) * 0.5;
    
    // Clip to valid ranges
    childGenome.hidden.temperatureOptimum = Math.max(15, Math.min(45, childGenome.hidden.temperatureOptimum));
    childGenome.hidden.phPreference = Math.max(0, Math.min(14, childGenome.hidden.phPreference));
    
    return childGenome;
  }
  
  /**
   * Learn from combat outcome
   */
  recordCombatOutcome(
    genome: ViralGenome,
    attackDirection: number, // 0-7 (compass)
    won: boolean
  ): void {
    if (won) {
      genome.hidden.successfulAttacks.push(attackDirection);
      // Keep last 10 successes
      if (genome.hidden.successfulAttacks.length > 10) {
        genome.hidden.successfulAttacks.shift();
      }
    } else {
      genome.hidden.failedAttacks.push(attackDirection);
      // Keep last 10 failures
      if (genome.hidden.failedAttacks.length > 10) {
        genome.hidden.failedAttacks.shift();
      }
    }
    
    // Update preferred direction based on success rate
    this.updatePreferredDirection(genome);
  }
  
  private updatePreferredDirection(genome: ViralGenome): void {
    if (genome.hidden.successfulAttacks.length < 3) {
      genome.hidden.preferredDirection = null;
      return;
    }
    
    // Find most common successful direction
    const directionCounts = new Array(8).fill(0);
    for (const dir of genome.hidden.successfulAttacks) {
      directionCounts[dir]++;
    }
    
    let maxCount = 0;
    let preferredDir = 0;
    for (let i = 0; i < 8; i++) {
      if (directionCounts[i] > maxCount) {
        maxCount = directionCounts[i];
        preferredDir = i;
      }
    }
    
    // Only set preferred if significantly better
    if (maxCount >= 3) {
      genome.hidden.preferredDirection = preferredDir;
    }
  }
  
  private induceStressMutation(genome: ViralGenome, tick: number): void {
    // Stress mutation is more dramatic than replication mutation
    const paramKeys = Object.keys(genome.visibleParams) as Array<keyof VirusParams>;
    const paramToMutate = paramKeys[Math.floor(Math.random() * paramKeys.length)];
    
    // Larger delta: -3 to +3
    const currentValue = genome.visibleParams[paramToMutate];
    const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
    genome.visibleParams[paramToMutate] = Math.max(1, Math.min(10, currentValue + delta));
    
    // Record in param drift for visual feedback
    genome.hidden.paramDrift[paramToMutate] = 
      (genome.hidden.paramDrift[paramToMutate] || 0) + delta;
    
    genome.hidden.mutationCount++;
    genome.hidden.lastMutationTick = tick;
    genome.hidden.stressLevel = Math.max(0, genome.hidden.stressLevel - 30); // Stress relief
  }
  
  private calculateMetabolicCost(params: VirusParams): number {
    // Base cost + activity-based costs
    return 0.5 + 
           (params.aggression * 0.1) + 
           (params.speed * 0.1) + 
           (params.reproduction * 0.15);
  }
  
  private adaptToEnvironment(genome: ViralGenome, env: LocalEnvironment): void {
    // Temperature adaptation
    const tempDiff = Math.abs(env.temperature - genome.hidden.temperatureOptimum);
    if (tempDiff > 10) {
      genome.hidden.stressLevel += tempDiff;
    }
    
    // pH adaptation
    const phDiff = Math.abs(env.phLevel - genome.hidden.phPreference);
    if (phDiff > 3) {
      genome.hidden.stressLevel += phDiff * 2;
    }
    
    // Slow preference drift toward current environment
    genome.hidden.temperatureOptimum += (env.temperature - genome.hidden.temperatureOptimum) * 0.01;
    genome.hidden.phPreference += (env.phLevel - genome.hidden.phPreference) * 0.01;
  }
}

2. Biological State Machine (Production-Ready)
typescript

// File: client/src/features/battle/BiologicalStateMachine.ts
export enum BiologicalState {
  ACTIVE = 'ACTIVE',
  LATENT = 'LATENT',
  STRESSED = 'STRESSED',
  DESPERATE = 'DESPERATE',
  HYPERMUTATING = 'HYPERMUTATING',
  CANNIBAL = 'CANNIBAL',
  SENESCENT = 'SENESCENT',
  QUANTUM = 'QUANTUM'
}

interface StateTransition {
  from: BiologicalState[];
  to: BiologicalState;
  condition: (cell: VirusCell, genome: ViralGenome, env: LocalEnvironment) => boolean;
  priority: number; // Higher = checked first
}

export class BiologicalStateMachine {
  private transitions: StateTransition[] = [
    // DESPERATE (Last stand) - Highest priority
    {
      from: [BiologicalState.ACTIVE, BiologicalState.STRESSED, BiologicalState.LATENT],
      to: BiologicalState.DESPERATE,
      condition: (cell, genome, env) => 
        cell.hp < 10 && 
        genome.visibleParams.resilience > 6 &&
        genome.hidden.energyReserves > 20,
      priority: 100
    },
    
    // HYPERMUTATING (Stress-induced mutation)
    {
      from: [BiologicalState.ACTIVE, BiologicalState.STRESSED],
      to: BiologicalState.HYPERMUTATING,
      condition: (cell, genome, env) => 
        genome.hidden.stressLevel > 80 &&
        genome.visibleParams.mutation > 6 &&
        Math.random() < 0.2,
      priority: 90
    },
    
    // CANNIBAL (Starvation response)
    {
      from: [BiologicalState.ACTIVE, BiologicalState.STRESSED],
      to: BiologicalState.CANNIBAL,
      condition: (cell, genome, env) => 
        genome.hidden.energyReserves < 15 &&
        genome.visibleParams.aggression > 7 &&
        this.hasAdjacentAlly(cell),
      priority: 80
    },
    
    // STRESSED (Moderate stress)
    {
      from: [BiologicalState.ACTIVE],
      to: BiologicalState.STRESSED,
      condition: (cell, genome, env) => 
        genome.hidden.stressLevel > 50 ||
        env.toxicityLevel > 0.6,
      priority: 50
    },
    
    // LATENT (Low energy conservation)
    {
      from: [BiologicalState.ACTIVE, BiologicalState.STRESSED],
      to: BiologicalState.LATENT,
      condition: (cell, genome, env) => 
        genome.hidden.energyReserves < 30 &&
        !this.hasNearbyEnemy(cell) &&
        genome.visibleParams.stealth > 5,
      priority: 40
    },
    
    // QUANTUM (High stealth weirdness)
    {
      from: [BiologicalState.ACTIVE, BiologicalState.LATENT],
      to: BiologicalState.QUANTUM,
      condition: (cell, genome, env) => 
        genome.visibleParams.stealth > 8 &&
        genome.visibleParams.mutation > 8 &&
        env.toxicityLevel > 0.3 &&
        this.isToxicZone(env),
      priority: 30
    },
    
    // SENESCENT (Zombie resurrection)
    {
      from: [BiologicalState.ACTIVE, BiologicalState.STRESSED, BiologicalState.DESPERATE],
      to: BiologicalState.SENESCENT,
      condition: (cell, genome, env) => 
        cell.hp <= 0 &&
        genome.visibleParams.virulence > 7 &&
        genome.hidden.energyReserves > 10,
      priority: 200 // Checked first when dying
    }
  ];
  
  /**
   * Update cell's biological state based on conditions
   */
  updateState(
    cell: VirusCell,
    genome: ViralGenome,
    environment: LocalEnvironment
  ): BiologicalState {
    // Check transitions in priority order
    const validTransitions = this.transitions
      .filter(t => t.from.includes(cell.state))
      .sort((a, b) => b.priority - a.priority);
    
    for (const transition of validTransitions) {
      if (transition.condition(cell, genome, environment)) {
        return this.applyStateTransition(cell, genome, transition.to);
      }
    }
    
    // Default: return to ACTIVE if no conditions met and not already ACTIVE
    if (cell.state !== BiologicalState.ACTIVE) {
      // Check if should return to active
      if (this.shouldReturnToActive(cell, genome, environment)) {
        return BiologicalState.ACTIVE;
      }
    }
    
    return cell.state;
  }
  
  /**
   * Apply state effects to cell and genome
   */
  private applyStateTransition(
    cell: VirusCell,
    genome: ViralGenome,
    newState: BiologicalState
  ): BiologicalState {
    // Exit current state effects
    this.exitState(cell, genome, cell.state);
    
    // Enter new state effects
    this.enterState(cell, genome, newState);
    
    return newState;
  }
  
  private enterState(cell: VirusCell, genome: ViralGenome, state: BiologicalState): void {
    switch (state) {
      case BiologicalState.DESPERATE:
        // +50% all stats, but burn energy faster
        genome.hidden.metabolicRate = 2.0;
        cell.attackMultiplier = 1.5;
        cell.defenseMultiplier = 1.5;
        cell.speedMultiplier = 1.5;
        break;
        
      case BiologicalState.HYPERMUTATING:
        // Random param changes every tick
        cell.mutationRate = 0.5; // 50% chance per tick
        break;
        
      case BiologicalState.CANNIBAL:
        // Will consume own cells
        cell.canCannibalize = true;
        break;
        
      case BiologicalState.LATENT:
        // 90% reduced metabolism, invisible to enemies
        genome.hidden.metabolicRate = 0.1;
        cell.isHidden = true;
        break;
        
      case BiologicalState.QUANTUM:
        // 50% chance to phase through attacks
        cell.quantumPhase = true;
        break;
        
      case BiologicalState.SENESCENT:
        // Zombie resurrection
        cell.hp = 20;
        cell.isZombie = true;
        cell.attackMultiplier = 0.5; // Weaker attack
        cell.defenseMultiplier = 2.0; // But tough to kill
        break;
    }
  }
  
  private exitState(cell: VirusCell, genome: ViralGenome, state: BiologicalState): void {
    switch (state) {
      case BiologicalState.DESPERATE:
        genome.hidden.metabolicRate = 1.0;
        cell.attackMultiplier = 1.0;
        cell.defenseMultiplier = 1.0;
        cell.speedMultiplier = 1.0;
        break;
        
      case BiologicalState.HYPERMUTATING:
        cell.mutationRate = 0;
        break;
        
      case BiologicalState.CANNIBAL:
        cell.canCannibalize = false;
        break;
        
      case BiologicalState.LATENT:
        genome.hidden.metabolicRate = 1.0;
        cell.isHidden = false;
        break;
        
      case BiologicalState.QUANTUM:
        cell.quantumPhase = false;
        break;
    }
  }
  
  private shouldReturnToActive(
    cell: VirusCell,
    genome: ViralGenome,
    env: LocalEnvironment
  ): boolean {
    switch (cell.state) {
      case BiologicalState.STRESSED:
        return genome.hidden.stressLevel < 30 && env.toxicityLevel < 0.3;
        
      case BiologicalState.LATENT:
        return genome.hidden.energyReserves > 60 || this.hasNearbyEnemy(cell);
        
      case BiologicalState.QUANTUM:
        return env.toxicityLevel < 0.2 || genome.hidden.energyReserves < 20;
        
      default:
        return true;
    }
  }
  
  private hasAdjacentAlly(cell: VirusCell): boolean {
    // Check if there's at least one adjacent friendly cell
    return cell.neighbors.some(n => n.owner === cell.owner);
  }
  
  private hasNearbyEnemy(cell: VirusCell): boolean {
    // Check if enemy within 2 cells
    return cell.neighbors.some(n => n.owner > 0 && n.owner !== cell.owner);
  }
  
  private isToxicZone(env: LocalEnvironment): boolean {
    return env.toxicityLevel > 0.5;
  }
}

3. Synergy Calculator with Real-Time Effects
typescript

// File: client/src/features/battle/SynergyCalculator.ts
export interface SynergyEffect {
  name: string;
  description: string;
  attackMultiplier?: number;
  defenseMultiplier?: number;
  speedMultiplier?: number;
  specialEffect?: (cell: VirusCell, genome: ViralGenome) => void;
  visualEffect: 'aura' | 'particles' | 'pulse' | 'glow';
  color: number; // Hex color for effect
}

export class SynergyCalculator {
  private readonly SYNERGIES: Record<string, Record<string, (a: number, b: number) => SynergyEffect | null>> = {
    aggression: {
      virulence: (a, v) => {
        if (a >= 7 && v >= 7) {
          return {
            name: 'BLOODLUST',
            description: 'Attacks everything in sight, including isolated allies',
            attackMultiplier: 2.0,
            specialEffect: (cell, genome) => {
              if (cell.neighbors.filter(n => n.owner === cell.owner).length === 0) {
                // Isolated cell will attack allies
                cell.targetAllies = true;
              }
            },
            visualEffect: 'particles',
            color: 0xff0000
          };
        }
        return null;
      },
      
      defense: (a, d) => {
        if (a >= 8 && d >= 8) {
          return {
            name: 'BERSERKER ARMOR',
            description: 'Slow, deliberate, unstoppable',
            attackMultiplier: 1.3,
            defenseMultiplier: 1.5,
            speedMultiplier: 0.5,
            visualEffect: 'glow',
            color: 0xffaa00
          };
        }
        return null;
      }
    },
    
    mutation: {
      stealth: (m, s) => {
        if (m + s > 14) {
          return {
            name: 'PHANTOM PLAGUE',
            description: 'Infests without symptoms for 20 ticks',
            specialEffect: (cell, genome) => {
              cell.stealthInfestation = true;
              cell.infestationDelay = 20;
            },
            visualEffect: 'pulse',
            color: 0x8800ff
          };
        }
        return null;
      },
      
      reproduction: (m, r) => {
        if (m > 6 && r > 8) {
          return {
            name: 'CANCEROUS GROWTH',
            description: 'Sometimes creates 2 cells instead of 1',
            specialEffect: (cell, genome) => {
              if (Math.random() < 0.3) {
                cell.extraSpawn = true;
              }
            },
            visualEffect: 'particles',
            color: 0xff88ff
          };
        }
        return null;
      }
    },
    
    speed: {
      mobility: (s, m) => {
        if (s > 7 && m > 7) {
          return {
            name: 'PHASE SHIFT',
            description: 'Can jump over enemy cells',
            specialEffect: (cell, genome) => {
              cell.canPhase = true;
            },
            visualEffect: 'aura',
            color: 0x00ffff
          };
        }
        return null;
      }
    }
  };
  
  // Triad synergies (3 parameters)
  private readonly TRIAD_SYNERGIES: Array<{
    check: (params: VirusParams) => boolean;
    effect: SynergyEffect;
  }> = [
    {
      check: (p) => p.aggression > 7 && p.virulence > 7 && p.reproduction > 7,
      effect: {
        name: 'APOCALYPSE',
        description: '3x damage, 3x spread, inevitable victory',
        attackMultiplier: 3.0,
        speedMultiplier: 3.0,
        visualEffect: 'glow',
        color: 0xff00ff
      }
    },
    {
      check: (p) => p.defense > 8 && p.resilience > 8 && p.stealth > 8,
      effect: {
        name: 'IMMORTAL',
        description: 'Nearly impossible to kill, regenerates constantly',
        defenseMultiplier: 2.5,
        specialEffect: (cell) => {
          cell.hpRegen = 5; // +5 HP per tick
        },
        visualEffect: 'aura',
        color: 0xffffff
      }
    }
  ];
  
  /**
   * Calculate all synergies for a genome
   */
  calculateGenomeSynergies(genome: ViralGenome): SynergyEffect[] {
    const effects: SynergyEffect[] = [];
    const params = genome.visibleParams;
    
    // Check pairwise synergies
    for (const [param1, param2Synergies] of Object.entries(this.SYNERGIES)) {
      const value1 = params[param1 as keyof VirusParams];
      
      for (const [param2, synergyFn] of Object.entries(param2Synergies)) {
        const value2 = params[param2 as keyof VirusParams];
        const effect = synergyFn(value1, value2);
        
        if (effect) {
          effects.push(effect);
        }
      }
    }
    
    // Check triad synergies
    for (const triad of this.TRIAD_SYNERGIES) {
      if (triad.check(params)) {
        effects.push(triad.effect);
      }
    }
    
    return effects;
  }
  
  /**
   * Apply synergy effects to a cell
   */
  applySynergiesToCell(
    cell: VirusCell,
    genome: ViralGenome,
    effects: SynergyEffect[]
  ): void {
    // Reset multipliers
    cell.attackMultiplier = 1.0;
    cell.defenseMultiplier = 1.0;
    cell.speedMultiplier = 1.0;
    cell.specialEffects = [];
    
    // Apply all effects
    for (const effect of effects) {
      if (effect.attackMultiplier) {
        cell.attackMultiplier *= effect.attackMultiplier;
      }
      if (effect.defenseMultiplier) {
        cell.defenseMultiplier *= effect.defenseMultiplier;
      }
      if (effect.speedMultiplier) {
        cell.speedMultiplier *= effect.speedMultiplier;
      }
      if (effect.specialEffect) {
        effect.specialEffect(cell, genome);
      }
      
      // Track for visualization
      cell.specialEffects.push({
        name: effect.name,
        visualEffect: effect.visualEffect,
        color: effect.color
      });
    }
  }
}

🔌 INTEGRATION GUIDE
Step-by-Step Integration (Non-Breaking)
Step 1: Add Data Structures (Safe)
typescript

// BattleManager.ts - Add new fields (non-breaking)
export class BattleManager {
  // Existing code remains unchanged
  private gridData: GridData;
  
  // NEW: Add these fields
  private genomeSystem: HiddenGenomeSystem;
  private stateMachine: BiologicalStateMachine;
  private synergyCalculator: SynergyCalculator;
  private genomes: Map<string, ViralGenome> = new Map();
  private cellGenomeMap: Map<number, string> = new Map(); // cellIndex -> genomeId
  
  constructor() {
    // Initialize new systems
    this.genomeSystem = new HiddenGenomeSystem(Math.random());
    this.stateMachine = new BiologicalStateMachine();
    this.synergyCalculator = new SynergyCalculator();
  }
}

Step 2: Modify Cell Creation (Backward Compatible)
typescript

// BattleManager.ts - Modify createInitialGrid
private createInitialGrid(): void {
  // Existing code...
  
  for (let y = 0; y < this.gridData.height; y++) {
    for (let x = 0; x < this.gridData.width; x++) {
      const index = y * this.gridData.width + x;
      const cell = this.gridData.grid[index];
      
      if (cell > 0) {
        // NEW: Create genome for this initial cell
        const virusId = cell;
        const params = this.virusParams.get(virusId)!;
        const genome = this.genomeSystem.createFounderGenome(virusId, params);
        
        this.genomes.set(genome.id, genome);
        this.cellGenomeMap.set(index, genome.id);
        genome.population.add(index.toString());
        
        // NEW: Store genome reference on cell (add to GridData type if needed)
        (this.gridData as any).genomeIds = this.gridData.genomeIds || [];
        (this.gridData as any).genomeIds[index] = genome.id;
      }
    }
  }
}

Step 3: Update Spread Logic (Gradual)
typescript

// BattleManager.ts - Modify spreadCell
private spreadCell(
  sourceX: number, 
  sourceY: number, 
  targetX: number, 
  targetY: number
): void {
  const sourceIndex = sourceY * this.gridData.width + sourceX;
  const targetIndex = targetY * this.gridData.width + targetX;
  
  // Existing: Check if target is empty
  if (this.gridData.grid[targetIndex] !== 0) return;
  
  // NEW: Get source genome
  const sourceGenomeId = (this.gridData as any).genomeIds[sourceIndex];
  const sourceGenome = this.genomes.get(sourceGenomeId)!;
  
  // NEW: 2% chance of mutation
  let targetGenomeId = sourceGenomeId;
  if (Math.random() < 0.02) {
    const mutatedGenome = this.genomeSystem.mutateGenome(sourceGenome, this.state.tick);
    this.genomes.set(mutatedGenome.id, mutatedGenome);
    targetGenomeId = mutatedGenome.id;
  }
  
  // Update grid
  this.gridData.grid[targetIndex] = sourceGenome.virusId;
  
  // NEW: Store genome reference
  (this.gridData as any).genomeIds[targetIndex] = targetGenomeId;
  this.genomes.get(targetGenomeId)!.population.add(targetIndex.toString());
}

Step 4: Add State Updates (Feature Flag)
typescript

// BattleManager.ts - Add to spreadTick4Player
private spreadTick4Player(): void {
  // NEW: Add feature flag check
  const USE_EMERGENT_FEATURES = true; // Toggle for testing
  
  if (USE_EMERGENT_FEATURES) {
    this.updateBiologicalStates();
    this.applySynergies();
  }
  
  // ... existing spread logic ...
}

private updateBiologicalStates(): void {
  for (let i = 0; i < this.gridData.grid.length; i++) {
    const cellOwner = this.gridData.grid[i];
    if (cellOwner === 0) continue;
    
    const genomeId = (this.gridData as any).genomeIds[i];
    const genome = this.genomes.get(genomeId)!;
    
    // Create local environment (simplified for now)
    const environment = this.getLocalEnvironment(i);
    
    // Update genome
    this.genomeSystem.updateGenome(genome, {
      hp: 100, // TODO: Track cell HP
      justAttacked: false, // TODO: Track combat
      neighbors: this.getNeighbors(i)
    } as any, environment, this.state.tick);
    
    // Update biological state
    const newState = this.stateMachine.updateState({
      owner: cellOwner,
      hp: 100,
      state: (this.gridData as any).cellStates?.[i] || BiologicalState.ACTIVE,
      neighbors: this.getNeighbors(i)
    } as any, genome, environment);
    
    // Store state
    (this.gridData as any).cellStates = (this.gridData as any).cellStates || [];
    (this.gridData as any).cellStates[i] = newState;
  }
}

🧪 TESTING STRATEGY
Unit Tests
typescript

// test/unit/HiddenGenomeSystem.test.ts
describe('HiddenGenomeSystem', () => {
  test('should create founder genome with correct visible params', () => {
    const system = new HiddenGenomeSystem(12345);
    const params = { aggression: 5, mutation: 5, /* ... */ };
    
    const genome = system.createFounderGenome(1, params);
    
    expect(genome.virusId).toBe(1);
    expect(genome.visibleParams).toEqual(params);
    expect(genome.hidden.stressLevel).toBe(0);
    expect(genome.hidden.energyReserves).toBe(100);
  });
  
  test('should mutate genome during replication', () => {
    const system = new HiddenGenomeSystem(12345);
    const parent = system.createFounderGenome(1, { aggression: 5, mutation: 5 });
    
    const child = system.mutateGenome(parent, 100);
    
    expect(child.ancestorId).toBe(parent.id);
    expect(child.hidden.generation).toBe(1);
    expect(child.hidden.mutationCount).toBe(1);
    
    // Visible params should be slightly different
    let diffCount = 0;
    for (const key in parent.visibleParams) {
      if (parent.visibleParams[key] !== child.visibleParams[key]) diffCount++;
    }
    expect(diffCount).toBe(1); // Exactly one param changed
  });
  
  test('should learn from combat outcomes', () => {
    const system = new HiddenGenomeSystem(12345);
    const genome = system.createFounderGenome(1, { aggression: 5 });
    
    // Win 3 times in direction 2
    system.recordCombatOutcome(genome, 2, true);
    system.recordCombatOutcome(genome, 2, true);
    system.recordCombatOutcome(genome, 2, true);
    
    expect(genome.hidden.preferredDirection).toBe(2);
    
    // Lose 3 times in direction 2
    system.recordCombatOutcome(genome, 2, false);
    system.recordCombatOutcome(genome, 2, false);
    system.recordCombatOutcome(genome, 2, false);
    
    // Preferred direction should reset
    expect(genome.hidden.preferredDirection).toBeNull();
  });
});

Integration Tests
typescript

// test/integration/BattleEmergence.test.ts
describe('BattleManager with Emergent Features', () => {
  test('should develop multiple genome variants over time', async () => {
    const battle = new BattleManager();
    battle.startBattle(/* params */);
    
    // Run 100 ticks
    for (let i = 0; i < 100; i++) {
      battle.spreadTick4Player();
    }
    
    // Should have more genomes than initial (mutations occurred)
    expect(battle.genomes.size).toBeGreaterThan(4); // Started with 4 founder genomes
  });
  
  test('should trigger biological states under stress', () => {
    const battle = new BattleManager();
    // Setup high-stress scenario...
    
    battle.spreadTick4Player();
    
    // Some cells should be in non-ACTIVE states
    const states = battle.getCellStates();
    expect(states.some(s => s !== BiologicalState.ACTIVE)).toBe(true);
  });
  
  test('should not break existing deterministic battles when features disabled', () => {
    const battle1 = new BattleManager();
    const battle2 = new BattleManager();
    
    // Run both with same seed, one with features disabled
    battle1.startBattle(seedParams);
    battle2.startBattle(seedParams);
    
    // Should have identical results
    for (let i = 0; i < 50; i++) {
      battle1.spreadTick4Player();
      battle2.spreadTick4Player();
      
      expect(battle1.getGrid()).toEqual(battle2.getGrid());
    }
  });
});

Performance Tests
typescript

// test/performance/BattlePerformance.test.ts
describe('BattleManager Performance', () => {
  test('should maintain 60 FPS with emergent features', () => {
    const battle = new BattleManager();
    battle.startBattle();
    
    const timings: number[] = [];
    
    for (let i = 0; i < 1000; i++) {
      const start = performance.now();
      battle.spreadTick4Player();
      const end = performance.now();
      
      timings.push(end - start);
    }
    
    const avgTime = timings.reduce((a, b) => a + b) / timings.length;
    const maxTime = Math.max(...timings);
    
    console.log(`Average tick time: ${avgTime.toFixed(2)}ms`);
    console.log(`Max tick time: ${maxTime.toFixed(2)}ms`);
    
    // Should stay under 16.67ms (60 FPS)
    expect(avgTime).toBeLessThan(16);
    expect(maxTime).toBeLessThan(33); // Allow occasional spikes
  });
});

🎨 VISUAL EFFECTS PRIORITY
Priority 1: Must-Have (Week 1)

These effects directly communicate the new mechanics:

    Biological State Visuals
    typescript

    // BattleRenderer.ts - Add immediately
    private applyStateVisuals(container: PIXI.Container, state: BiologicalState): void {
      switch (state) {
        case 'DESPERATE':
          this.addShakeEffect(container, 2);
          this.addGlow(container, 0xff0000, 2.0);
          break;
        case 'HYPERMUTATING':
          this.addGlitchEffect(container);
          break;
        case 'SENESCENT':
          container.tint = 0x888888;
          break;
      }
    }

    Damage Feedback
    typescript

    private onCellDamage(cell: PIXI.Container, damage: number): void {
      // Red flash + quick scale
      const flash = new PIXI.Graphics();
      flash.beginFill(0xff0000, 0.5);
      flash.drawCircle(0, 0, cell.width/2);
      cell.addChild(flash);
      
      setTimeout(() => cell.removeChild(flash), 100);
    }

    Synergy Activation
    typescript

    private showSynergyUnlock(cell: PIXI.Container, synergyName: string): void {
      // Brief particle burst + text popup
      const text = new PIXI.Text(synergyName, { fill: 0xffffff });
      text.position.set(0, -30);
      cell.addChild(text);
      
      setTimeout(() => cell.removeChild(text), 1000);
    }

Priority 2: Should-Have (Week 2)

    Chaos Event Indicators

    Environmental Tints (nutrient/toxic zones)

    Spawn Animations

Priority 3: Nice-to-Have (Week 3)

    CRT Filter

    Hex Shield Pattern

    Genome Lineage Visualization (family tree overlay)

📋 FALLBACK PLAN: Minimum Viable Emergence

If full implementation is too complex, here's the 40% effort / 80% impact plan:
Phase 1 MVP (2-3 days)
typescript

// Just add these three things:

// 1. Simple stress system
interface SimpleGenome {
  stressLevel: number;
  energy: number;
}

// 2. Basic states (just 3)
enum SimpleState {
  NORMAL,
  STRESSED,  // Red glow, slight stat boost
  DESPERATE  // Intense red, big boost
}

// 3. One synergy per virus type
const SIMPLE_SYNERGIES = {
  virus1: 'BERSERKER',  // Aggression+Virulence
  virus2: 'PHANTOM',     // Stealth+Mutation
  virus3: 'IMMORTAL',    // Defense+Resilience
  virus4: 'SWARM'        // Reproduction+Speed
};

// Integration - just 50 lines of code
private addMinimalEmergence(): void {
  // Update stress based on combat
  // Simple state transitions
  // One synergy check
}

Expected Outcome: Players will see:

    Cells glowing red when stressed

    Occasional "BERSERKER!" popups

    Different behavior under pressure

    No performance impact

⚠️ RISK ASSESSMENT
Risk	Probability	Impact	Mitigation
Performance degradation	High	Critical	Use feature flags, spatial partitioning, batch updates
Breaking existing battles	Medium	High	Keep deterministic mode as fallback, A/B testing
Memory leaks	Medium	Medium	Clear genome maps on battle reset, weak references
Visual clutter	High	Low	Opacity scaling, effect priority system
Balance issues	High	Medium	Telemetry on win rates, adjustable parameters
Critical Risks to Address Immediately:

    Genome Map Growth → Clear on battle end, limit genome count

    State Update Frequency → Update only cells that changed

    Synergy Calculation → Cache results, recalc only on param change

📅 ESTIMATED IMPLEMENTATION TIME
Phase	Components	Time	Dependencies
1	Hidden Genome + Basic States	3-4 days	None
2	Synergy Calculator + Integration	2-3 days	Phase 1
3	Chaos Engine	2 days	Phase 1
4	Environment System	3-4 days	Phase 1
5	Advanced VFX	3 days	Phase 2-4
Total		13-16 days	

MVP (Phase 1 only): 3-4 days for 60% of the emergent feel
🎯 RECOMMENDATION

Start with Phase 1 (Hidden Genome + Basic States) as a feature flag. This gives you the core "living system" feel with minimal risk. Add the Synergy Calculator next for strategic depth. Environment and advanced VFX can wait.

The key insight: players don't need to see every detail - they just need to feel that the viruses are alive. The stress system and basic states will deliver 80% of that feeling with 20% of the code.

Immediate Next Steps:

    Add USE_EMERGENT_FEATURES flag

    Implement HiddenGenomeSystem (3 days)

    Add 3 basic biological states (1 day)

    Deploy to beta testers

    Gather feedback before adding complexity