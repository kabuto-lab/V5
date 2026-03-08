/**
 * ChaosEngine - Biological unpredictability and weird events
 * Injects "errors" that feel like natural mutations
 */

import { VirusParams, ChaosEvent, WeirdEvent, BioCell, BioBattleState } from './BioTypes';

export class ChaosEngine {
  private entropyPool: number = 0;
  private weirdEventRoll: number = 0;

  /**
   * Determine if a chaos event should trigger
   */
  shouldTriggerChaos(params: VirusParams, stress: number): boolean {
    // Base chaos rate: 1-5% depending on Mutation
    const baseRate = 0.01 + (params.mutation * 0.004);
    // Stress increases chaos
    const stressBonus = stress * 0.001;
    // Replication introduces copying errors
    const replicationError = params.replication * 0.002;

    this.entropyPool += baseRate + stressBonus + replicationError;

    if (Math.random() < this.entropyPool) {
      this.entropyPool = 0;
      return true;
    }

    return false;
  }

  /**
   * Get a random chaos event
   */
  getRandomChaosEvent(): ChaosEvent {
    const events: ChaosEvent[] = [
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
        name: 'FRIENDLY_FIRE',
        effect: 'Attacks own cells for 10 ticks',
        duration: 10,
        visual: 'Red outline pulse'
      },
      {
        name: 'SLEEPER_AGENT',
        effect: 'Becomes dormant, wakes as enemy virus',
        duration: 50,
        visual: 'Grey, then flashes enemy color'
      },
      {
        name: 'QUANTUM_TUNNEL',
        effect: 'Teleports to random location',
        duration: 1,
        visual: 'Fade out, fade in elsewhere'
      },
      {
        name: 'GENETIC_MEMORY_LOSS',
        effect: 'Forgets successful strategies, reverts to random',
        duration: 20,
        visual: 'Static noise overlay'
      },
      {
        name: 'SYMBIOSIS_BREAKDOWN',
        effect: 'Nearby allies become enemies temporarily',
        duration: 15,
        visual: 'Allies flash red'
      },
      {
        name: 'PARAMETER_FLUX',
        effect: 'All visible parameters shift ±2 temporarily',
        duration: 30,
        visual: 'Numbers flicker above cell'
      },
      {
        name: 'ECHO_LOCATION',
        effect: 'Can only spread to cells that recently changed',
        duration: 25,
        visual: 'Ripples from recent changes'
      },
      {
        name: 'TIME_DILATION',
        effect: 'Moves at 2x speed but ages 2x faster',
        duration: 40,
        visual: 'Motion blur trail'
      }
    ];

    return events[Math.floor(Math.random() * events.length)];
  }

  /**
   * Apply chaos event to a cell
   */
  applyChaosEvent(cell: BioCell, event: ChaosEvent): void {
    cell.hasChaosEffect = true;
    cell.chaosEffectType = event.name;

    // Add to active effects
    cell.activeEffects.set(event.name, {
      duration: event.duration,
      value: event.effect
    });

    console.log(`[ChaosEngine] ${event.name} applied to cell ${cell.index}: ${event.effect}`);
  }

  /**
   * Roll for weird event (every 100 ticks)
   */
  rollWeirdEvent(state: BioBattleState): WeirdEvent | null {
    this.weirdEventRoll = Math.floor(Math.random() * 100);

    const weirdEvents: WeirdEvent[] = [
      {
        rollRange: [0, 4],
        name: 'THE BLOOM',
        duration: 30,
        effect: 'All Replication +5, then crash (-50% for 50 ticks)'
      },
      {
        rollRange: [5, 9],
        name: 'THE SILENCE',
        duration: 25,
        effect: 'No combat possible, peaceful spread only'
      },
      {
        rollRange: [10, 14],
        name: 'THE SWAP',
        duration: 0,
        effect: '15% of cells swap owners randomly'
      },
      {
        rollRange: [15, 19],
        name: 'THE MIRROR',
        duration: 40,
        effect: 'Both viruses copy each other\'s highest parameter'
      },
      {
        rollRange: [20, 24],
        name: 'THE HUNGER',
        duration: 50,
        effect: 'Nutrients deplete 3x faster, cannibalism rises'
      },
      {
        rollRange: [25, 29],
        name: 'THE FLOOD',
        duration: 35,
        effect: 'Edges become toxic, all viruses pushed to center'
      },
      {
        rollRange: [30, 34],
        name: 'THE GHOST',
        duration: 60,
        effect: 'Dead cells become haunted (block all spread)'
      },
      {
        rollRange: [35, 39],
        name: 'THE CATALYST',
        duration: 20,
        effect: 'One random cell becomes "super cell" (5x stats)'
      },
      {
        rollRange: [40, 44],
        name: 'THE FORGETTING',
        duration: 0,
        effect: 'All viruses lose their "memory" (genetic reset)'
      },
      {
        rollRange: [45, 49],
        name: 'THE AWAKENING',
        duration: 50,
        effect: 'Neutral cells become aggressive, attack everyone'
      },
      {
        rollRange: [50, 54],
        name: 'THE COMPRESSION',
        duration: 30,
        effect: 'Grid shrinks by 20% (outer ring becomes void)'
      },
      {
        rollRange: [55, 59],
        name: 'THE EXPANSION',
        duration: 30,
        effect: 'Grid grows by 20% (new cells are nutrient-rich)'
      },
      {
        rollRange: [60, 64],
        name: 'THE INVERSION',
        duration: 25,
        effect: 'High stats become low, low become high'
      },
      {
        rollRange: [65, 69],
        name: 'THE SYMBIOSIS',
        duration: 40,
        effect: 'Viruses cannot harm each other, must cooperate'
      },
      {
        rollRange: [70, 74],
        name: 'THE SINGULARITY',
        duration: 15,
        effect: 'All viruses pulled to center, massive battle'
      },
      {
        rollRange: [75, 79],
        name: 'THE SCHISM',
        duration: 50,
        effect: 'Each virus splits into 2 weaker copies'
      },
      {
        rollRange: [80, 84],
        name: 'THE CONVERGENCE',
        duration: 30,
        effect: 'All parameters average between both viruses'
      },
      {
        rollRange: [85, 89],
        name: 'THE ECLIPSE',
        duration: 20,
        effect: 'Stealth becomes 10 for all, invisible battle'
      },
      {
        rollRange: [90, 94],
        name: 'THE REBIRTH',
        duration: 0,
        effect: 'All cells reset, viruses keep params, restart'
      },
      {
        rollRange: [95, 99],
        name: 'THE APOCALYPSE',
        duration: 10,
        effect: '10x damage, 10x spread, winner takes all'
      }
    ];

    const event = weirdEvents.find(e => 
      this.weirdEventRoll >= e.rollRange[0] && 
      this.weirdEventRoll <= e.rollRange[1]
    );

    if (event) {
      state.activeWeirdEvents.push(event);
      state.recentEvents.push(`[${state.tick}] ${event.name}: ${event.effect}`);
      console.log(`[ChaosEngine] WEIRD EVENT #${this.weirdEventRoll}: ${event.name}`);
    }

    return event || null;
  }

  /**
   * Apply weird event effects to battle state
   */
  applyWeirdEvent(event: WeirdEvent, state: BioBattleState): void {
    switch (event.name) {
      case 'THE SWAP':
        this.applyCellSwap(state);
        break;
      case 'THE CATALYST':
        this.applySuperCell(state);
        break;
      case 'THE FORGETTING':
        this.applyGeneticReset(state);
        break;
      // Add more as needed
    }
  }

  private applyCellSwap(state: BioBattleState): void {
    const cellsToSwap = Math.floor(state.grid.length * 0.15);
    for (let i = 0; i < cellsToSwap; i++) {
      const idx1 = Math.floor(Math.random() * state.grid.length);
      const idx2 = Math.floor(Math.random() * state.grid.length);
      const cell1 = state.grid[idx1];
      const cell2 = state.grid[idx2];

      // Swap owners
      const temp = cell1.owner;
      cell1.owner = cell2.owner;
      cell2.owner = temp;
    }
    console.log(`[ChaosEngine] THE SWAP: ${cellsToSwap} cells swapped owners`);
  }

  private applySuperCell(state: BioBattleState): void {
    const randomIdx = Math.floor(Math.random() * state.grid.length);
    const cell = state.grid[randomIdx];
    cell.hp = cell.maxHp * 5;
    console.log(`[ChaosEngine] THE CATALYST: Cell ${randomIdx} became super cell`);
  }

  private applyGeneticReset(state: BioBattleState): void {
    state.grid.forEach(cell => {
      if (cell.hiddenGenome) {
        cell.hiddenGenome.stressLevel = 0;
        cell.hiddenGenome.accumulatedMutations = 0;
        cell.hiddenGenome.successfulAttacks = [];
        cell.hiddenGenome.failedAttacks = [];
      }
    });
    console.log(`[ChaosEngine] THE FORGETTING: All genetic memory cleared`);
  }

  /**
   * Update active chaos effects (decrement duration)
   */
  updateActiveEffects(cell: BioCell): void {
    cell.activeEffects.forEach((effect, key) => {
      effect.duration--;
      if (effect.duration <= 0) {
        cell.activeEffects.delete(key);
        if (cell.activeEffects.size === 0) {
          cell.hasChaosEffect = false;
          cell.chaosEffectType = null;
        }
      }
    });
  }

  /**
   * Get current entropy level (for debugging)
   */
  getEntropyLevel(): number {
    return this.entropyPool;
  }

  /**
   * Get last weird event roll (for debugging)
   */
  getLastWeirdRoll(): number {
    return this.weirdEventRoll;
  }
}
