/**
 * HiddenGenomeSystem - Manages viral genome inheritance and mutation
 * Each virus cell has a hidden genome that evolves during battle
 */

import { HiddenGenome, VirusParams, BehavioralArchetype, NicheSpecialization } from '../BioTypes';

export interface ViralGenome {
  id: string;
  virusId: number;                    // 1-4 (player ID)
  visibleParams: VirusParams;         // The 10 public stats
  hidden: HiddenGenome;               // Epigenetic state
  population: Set<number>;            // Cell indices with this genome
  birthTick: number;
  ancestorId: string | null;          // Parent genome ID
}

export class HiddenGenomeSystem {
  private genomePool: Map<string, ViralGenome> = new Map();
  private nextGenomeId: number = 1;
  private currentTick: number = 0;

  /**
   * Create founder genome for each player at battle start
   */
  createFounderGenome(virusId: number, params: VirusParams, tick: number): ViralGenome {
    const id = `genome_${this.nextGenomeId++}`;
    
    const genome: ViralGenome = {
      id,
      virusId,
      visibleParams: { ...params },
      hidden: this.createInitialGenome(params),
      population: new Set(),
      birthTick: tick,
      ancestorId: null
    };

    this.genomePool.set(id, genome);
    return genome;
  }

  /**
   * Create initial hidden genome based on visible parameters
   */
  private createInitialGenome(params: VirusParams): HiddenGenome {
    // Determine behavioral archetype from parameters
    const archetype = this.determineArchetype(params);
    const niche = this.determineNiche(params);

    return {
      stressLevel: 0,
      generation: 0,
      parentLineage: [],
      behavioralArchetype: archetype,
      visibleParamDrift: {},
      accumulatedMutations: 0,
      successfulAttacks: [],
      failedAttacks: [],
      preferredDirections: [],
      metabolicRate: 1.0,
      energyReserves: 100,
      lastMeal: 0,
      temperatureOptimum: 20 + Math.random() * 20,  // 20-40°C
      pHPreference: 5 + Math.random() * 4,          // 5-9 pH
      nicheSpecialization: niche
    };
  }

  /**
   * Determine behavioral archetype from visible parameters
   */
  private determineArchetype(params: VirusParams): BehavioralArchetype {
    const scores = {
      HUNTER: params.aggression + params.virulence,
      BUILDER: params.defense + params.resilience,
      PARASITE: params.stealth + params.synergy,
      NOMAD: params.mobility + params.propagation,
      SWARM: params.replication + params.synergy,
      GHOST: params.stealth + params.mutation
    };

    // Find highest score
    let maxScore = 0;
    let archetype: BehavioralArchetype = 'HUNTER';
    
    for (const [key, value] of Object.entries(scores)) {
      if (value > maxScore) {
        maxScore = value;
        archetype = key as BehavioralArchetype;
      }
    }

    return archetype;
  }

  /**
   * Determine niche specialization from parameters
   */
  private determineNiche(params: VirusParams): NicheSpecialization {
    const scores = {
      Fast: params.propagation + params.mobility,
      Tank: params.defense + params.resilience,
      Ambush: params.stealth + params.mutation,
      Swarm: params.replication + params.synergy,
      Parasite: params.synergy + params.stealth
    };

    let maxScore = 0;
    let niche: NicheSpecialization = 'Fast';
    
    for (const [key, value] of Object.entries(scores)) {
      if (value > maxScore) {
        maxScore = value;
        niche = key as NicheSpecialization;
      }
    }

    return niche;
  }

  /**
   * Mutate genome during replication (2% base chance)
   */
  mutateGenome(parentGenome: ViralGenome, tick: number): ViralGenome {
    const id = `genome_${this.nextGenomeId++}`;
    const mutationRate = 0.02;  // 2% base mutation chance

    // Check if mutation occurs
    if (Math.random() > mutationRate) {
      // No mutation - exact copy
      return this.cloneGenome(parentGenome, tick);
    }

    // Mutation occurs - create new genome with changes
    const childGenome = this.cloneGenome(parentGenome, tick);
    
    // Apply mutation
    this.applyMutation(childGenome);

    return childGenome;
  }

  /**
   * Clone genome without mutation
   */
  private cloneGenome(parent: ViralGenome, tick: number): ViralGenome {
    const child: ViralGenome = {
      id: `genome_${this.nextGenomeId++}`,
      virusId: parent.virusId,
      visibleParams: { ...parent.visibleParams },
      hidden: {
        ...parent.hidden,
        generation: parent.hidden.generation + 1,
        parentLineage: [parent.id, ...parent.hidden.parentLineage].slice(0, 5),
        stressLevel: parent.hidden.stressLevel,
        energyReserves: parent.hidden.energyReserves,
        accumulatedMutations: parent.hidden.accumulatedMutations
      },
      population: new Set(),
      birthTick: tick,
      ancestorId: parent.id
    };

    this.genomePool.set(child.id, child);
    return child;
  }

  /**
   * Apply random mutation to genome
   */
  private applyMutation(genome: ViralGenome): void {
    genome.hidden.accumulatedMutations++;

    // Randomly drift one parameter by ±1
    const paramKeys = Object.keys(genome.visibleParams) as (keyof VirusParams)[];
    const randomParam = paramKeys[Math.floor(Math.random() * paramKeys.length)];

    const drift = Math.random() < 0.5 ? -1 : 1;
    const currentValue = genome.visibleParams[randomParam] || 0;
    const newValue = Math.max(0, Math.min(10, currentValue + drift));

    genome.visibleParams[randomParam] = newValue;
    genome.hidden.visibleParamDrift[randomParam] = drift;

    console.log(`[GenomeSystem] Mutation: ${randomParam} ${currentValue}→${newValue}`);
  }

  /**
   * Record combat outcome for genome learning
   */
  recordCombatOutcome(
    genome: ViralGenome,
    attackDirection: number,  // 0-7 (compass)
    won: boolean
  ): void {
    if (won) {
      genome.hidden.successfulAttacks.push(attackDirection);
      if (genome.hidden.successfulAttacks.length > 10) {
        genome.hidden.successfulAttacks.shift();
      }
    } else {
      genome.hidden.failedAttacks.push(attackDirection);
      if (genome.hidden.failedAttacks.length > 10) {
        genome.hidden.failedAttacks.shift();
      }
    }

    // Update preferred direction
    this.updatePreferredDirection(genome);
  }

  /**
   * Update preferred attack direction based on successful attacks
   */
  private updatePreferredDirection(genome: ViralGenome): void {
    if (genome.hidden.successfulAttacks.length < 3) {
      genome.hidden.preferredDirections = [];
      return;
    }

    // Count direction frequencies
    const directionCounts = new Array(8).fill(0);
    for (const dir of genome.hidden.successfulAttacks) {
      directionCounts[dir]++;
    }

    // Find most successful direction(s)
    const maxCount = Math.max(...directionCounts);
    if (maxCount >= 3) {
      genome.hidden.preferredDirections = directionCounts
        .map((count, dir) => count === maxCount ? dir : -1)
        .filter(dir => dir !== -1);
    }
  }

  /**
   * Update genome state (stress, energy, metabolism)
   */
  updateGenomeState(
    genome: ViralGenome,
    combatOccurred: boolean,
    spreadOccurred: boolean
  ): void {
    // Stress increases with combat
    if (combatOccurred) {
      genome.hidden.stressLevel = Math.min(100, genome.hidden.stressLevel + 5);
    } else {
      genome.hidden.stressLevel = Math.max(0, genome.hidden.stressLevel - 1);
    }

    // Energy consumption based on metabolic rate
    const metabolicCost = this.calculateMetabolicCost(genome);
    genome.hidden.energyReserves = Math.max(0, genome.hidden.energyReserves - metabolicCost);

    // Energy recovery
    if (!combatOccurred && !spreadOccurred) {
      genome.hidden.energyReserves = Math.min(100, genome.hidden.energyReserves + 2);
    }

    // Update metabolic rate based on state
    if (genome.hidden.energyReserves < 20) {
      genome.hidden.metabolicRate = 0.5;  // Energy conservation
    } else if (genome.hidden.stressLevel > 80) {
      genome.hidden.metabolicRate = 2.0;  // Stress response
    } else {
      genome.hidden.metabolicRate = 1.0;  // Normal
    }
  }

  /**
   * Calculate metabolic cost based on parameters
   */
  private calculateMetabolicCost(genome: ViralGenome): number {
    let cost = 1;  // Base cost

    // Aggression increases cost (combat is expensive)
    cost += genome.visibleParams.aggression * 0.3;

    // Replication increases cost (cell division is expensive)
    cost += genome.visibleParams.replication * 0.4;

    // Mobility increases cost (movement is expensive)
    cost += genome.visibleParams.mobility * 0.2;

    return cost * genome.hidden.metabolicRate;
  }

  /**
   * Get genome by ID
   */
  getGenome(id: string): ViralGenome | undefined {
    return this.genomePool.get(id);
  }

  /**
   * Get all genomes for a virus ID
   */
  getGenomesForVirus(virusId: number): ViralGenome[] {
    return Array.from(this.genomePool.values()).filter(g => g.virusId === virusId);
  }

  /**
   * Get genome count
   */
  getGenomeCount(): number {
    return this.genomePool.size;
  }

  /**
   * Clear all genomes (for battle restart)
   */
  clear(): void {
    this.genomePool.clear();
    this.nextGenomeId = 1;
  }

  /**
   * Set current tick
   */
  setCurrentTick(tick: number): void {
    this.currentTick = tick;
  }
}
