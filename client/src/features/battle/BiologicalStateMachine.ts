/**
 * BiologicalStateMachine - Manages viral life states
 * Transitions between states based on conditions
 */

import { BiologicalState, VirusParams, HiddenGenome, CellEnvironment } from './BioTypes';

export interface StateEffects {
  spreadMultiplier: number;  // 1.0 = normal, 2.0 = 2x spread
  attackMultiplier: number;  // 1.0 = normal, 1.5 = 50% stronger attacks
  defenseMultiplier: number; // 1.0 = normal, 2.0 = 2x defense
  mutationChance: number;    // 0.02 = 2% base, 0.5 = 50% hypermutation
  visible: boolean;          // false = invisible to enemies
  canSpread: boolean;        // false = dormant
  canAttack: boolean;        // false = peaceful
  hpRegen: number;           // HP recovered per tick
}

export class BiologicalStateMachine {
  private currentState: BiologicalState = BiologicalState.ACTIVE;
  private stateEnterTick: number = 0;

  /**
   * Get state effects for gameplay
   */
  getStateEffects(): StateEffects {
    switch (this.currentState) {
      case BiologicalState.ACTIVE:
        return {
          spreadMultiplier: 1.0,
          attackMultiplier: 1.0,
          defenseMultiplier: 1.0,
          mutationChance: 0.02,
          visible: true,
          canSpread: true,
          canAttack: true,
          hpRegen: 0
        };

      case BiologicalState.DESPERATE: // Last stand - boost everything
        return {
          spreadMultiplier: 1.5,
          attackMultiplier: 1.5,
          defenseMultiplier: 1.5,
          mutationChance: 0.02,
          visible: true,
          canSpread: true,
          canAttack: true,
          hpRegen: 0
        };

      case BiologicalState.STRESSED: // Reduced effectiveness
        return {
          spreadMultiplier: 0.7,
          attackMultiplier: 0.8,
          defenseMultiplier: 0.8,
          mutationChance: 0.02,
          visible: true,
          canSpread: true,
          canAttack: true,
          hpRegen: 0
        };

      case BiologicalState.LATENT: // Dormant, invisible
        return {
          spreadMultiplier: 0.1,
          attackMultiplier: 0.0,
          defenseMultiplier: 2.0,
          mutationChance: 0.02,
          visible: false,
          canSpread: false,
          canAttack: false,
          hpRegen: 5
        };

      case BiologicalState.HYPERMUTATING: // Rapid mutation
        return {
          spreadMultiplier: 1.0,
          attackMultiplier: 1.0,
          defenseMultiplier: 0.5,
          mutationChance: 0.5,  // 50% mutation chance!
          visible: true,
          canSpread: true,
          canAttack: true,
          hpRegen: 0
        };

      case BiologicalState.CANNIBAL: // Consume own cells
        return {
          spreadMultiplier: 1.2,
          attackMultiplier: 1.3,
          defenseMultiplier: 1.0,
          mutationChance: 0.02,
          visible: true,
          canSpread: true,
          canAttack: true,
          hpRegen: 10  // Regen from consuming
        };

      case BiologicalState.SENESCENT: // Zombie - undead
        return {
          spreadMultiplier: 0.5,
          attackMultiplier: 0.5,
          defenseMultiplier: 2.0,
          mutationChance: 0.02,
          visible: true,
          canSpread: true,
          canAttack: true,
          hpRegen: 0
        };

      case BiologicalState.STARVING: // Desperate for energy
        return {
          spreadMultiplier: 0.5,
          attackMultiplier: 0.5,
          defenseMultiplier: 0.5,
          mutationChance: 0.02,
          visible: true,
          canSpread: true,
          canAttack: true,
          hpRegen: 0
        };

      case BiologicalState.SYMBIOTIC: // Cooperative
        return {
          spreadMultiplier: 1.2,
          attackMultiplier: 0.0,
          defenseMultiplier: 1.5,
          mutationChance: 0.02,
          visible: true,
          canSpread: true,
          canAttack: false,
          hpRegen: 2
        };

      case BiologicalState.REPLICATING: // Focused on reproduction
        return {
          spreadMultiplier: 2.0,
          attackMultiplier: 0.5,
          defenseMultiplier: 0.5,
          mutationChance: 0.02,
          visible: true,
          canSpread: true,
          canAttack: false,
          hpRegen: 0
        };

      case BiologicalState.QUANTUM: // Phase through attacks
        return {
          spreadMultiplier: 1.0,
          attackMultiplier: 1.0,
          defenseMultiplier: 3.0,  // 50% chance to phase through
          mutationChance: 0.02,
          visible: true,
          canSpread: true,
          canAttack: true,
          hpRegen: 0
        };

      case BiologicalState.DYING: // Final moments
        return {
          spreadMultiplier: 0.2,
          attackMultiplier: 0.2,
          defenseMultiplier: 0.2,
          mutationChance: 0.02,
          visible: true,
          canSpread: false,
          canAttack: false,
          hpRegen: 0
        };

      default:
        return {
          spreadMultiplier: 1.0,
          attackMultiplier: 1.0,
          defenseMultiplier: 1.0,
          mutationChance: 0.02,
          visible: true,
          canSpread: true,
          canAttack: true,
          hpRegen: 0
        };
    }
  }

  /**
   * Update biological state based on conditions
   */
  update(
    hp: number,
    maxHp: number,
    params: VirusParams,
    genome: HiddenGenome,
    environment: CellEnvironment,
    tick: number
  ): BiologicalState {
    const previousState = this.currentState;

    // Calculate stress from combat
    genome.stressLevel = Math.min(100, genome.stressLevel + (environment.recentCombat ? 5 : -1));

    // Energy metabolism
    genome.energyReserves -= this.calculateMetabolicCost(params);
    genome.energyReserves = Math.max(0, Math.min(100, genome.energyReserves));

    // STATE TRANSITIONS

    // CANNIBAL: Energy < 10 + High Aggression
    if (genome.energyReserves < 10 && params.aggression > 7) {
      this.enterState(BiologicalState.CANNIBAL, tick);
    }
    // HYPERMUTATING: Stress > 90 + High Mutation
    else if (genome.stressLevel > 90 && params.mutation > 6) {
      this.enterState(BiologicalState.HYPERMUTATING, tick);
    }
    // DESPERATE: HP < 20% + Resilience > 5 (Last Stand)
    else if (hp < maxHp * 0.2 && params.resilience > 5 && hp > 0) {
      this.enterState(BiologicalState.DESPERATE, tick);
    }
    // SENESCENT (Zombie): Death + High Virulence
    else if (hp <= 0 && params.virulence > 7) {
      this.enterState(BiologicalState.SENESCENT, tick);
    }
    // STARVING: Energy < 20
    else if (genome.energyReserves < 20) {
      this.enterState(BiologicalState.STARVING, tick);
    }
    // STRESSED: Energy < 50 or Stress > 50
    else if (genome.energyReserves < 50 || genome.stressLevel > 50) {
      this.enterState(BiologicalState.STRESSED, tick);
    }
    // LATENT: Low activity, high defense, waiting
    else if (params.aggression < 3 && params.defense > 6 && !environment.recentCombat) {
      this.enterState(BiologicalState.LATENT, tick);
    }
    // REPLICATING: High replication, enough energy
    else if (params.replication > 6 && genome.energyReserves > 50) {
      this.enterState(BiologicalState.REPLICATING, tick);
    }
    // SYMBIOTIC: High synergy, nearby allies
    else if (params.synergy > 6 && this.hasNearbyAllies(environment)) {
      this.enterState(BiologicalState.SYMBIOTIC, tick);
    }
    // DYING: 1-10% HP
    else if (hp > 0 && hp < maxHp * 0.1) {
      this.enterState(BiologicalState.DYING, tick);
    }
    // QUANTUM: Stealth 10 weirdness
    else if (params.stealth >= 10) {
      this.enterState(BiologicalState.QUANTUM, tick);
    }
    // ACTIVE: Default state
    else {
      this.enterState(BiologicalState.ACTIVE, tick);
    }

    return this.currentState;
  }

  private enterState(state: BiologicalState, tick: number): void {
    if (this.currentState !== state) {
      this.currentState = state;
      this.stateEnterTick = tick;
    }
  }

  private calculateMetabolicCost(params: VirusParams): number {
    // Base cost
    let cost = 1;

    // Aggression increases cost (combat is expensive)
    cost += params.aggression * 0.3;

    // Replication increases cost (cell division is expensive)
    cost += params.replication * 0.4;

    // Mobility increases cost (movement costs energy)
    cost += params.mobility * 0.2;

    // Defense reduces cost (efficient protection)
    cost -= params.defense * 0.1;

    // Efficiency (from replication synergy) reduces cost
    cost -= params.replication * params.synergy * 0.01;

    return Math.max(0.5, cost);
  }

  private hasNearbyAllies(env: CellEnvironment): boolean {
    // Check if previous owners include friendly virus
    return env.previousOwners.length > 0 && env.previousOwners[0] === env.currentOwner;
  }

  /**
   * Get state-specific modifiers
   */
  getStateModifiers(): { paramBoost: number; energyMult: number; special: string } {
    switch (this.currentState) {
      case BiologicalState.DESPERATE:
        return { paramBoost: 1.5, energyMult: 2.0, special: 'adrenaline' };
      case BiologicalState.HYPERMUTATING:
        return { paramBoost: 1.0, energyMult: 3.0, special: 'chaos_mutation' };
      case BiologicalState.CANNIBAL:
        return { paramBoost: 1.2, energyMult: 0.5, special: 'consume_own' };
      case BiologicalState.LATENT:
        return { paramBoost: 0.5, energyMult: 0.1, special: 'dormant' };
      case BiologicalState.SENESCENT:
        return { paramBoost: 0.5, energyMult: 0.3, special: 'undead' };
      case BiologicalState.QUANTUM:
        return { paramBoost: 1.0, energyMult: 1.0, special: 'superposition' };
      default:
        return { paramBoost: 1.0, energyMult: 1.0, special: 'none' };
    }
  }

  /**
   * Check if state allows certain actions
   */
  canAction(action: 'attack' | 'spread' | 'replicate' | 'move'): boolean {
    switch (this.currentState) {
      case BiologicalState.LATENT:
        return action === 'spread'; // Can only spread slowly
      case BiologicalState.SENESCENT:
        return action === 'spread'; // Zombie can only spread
      case BiologicalState.DYING:
        return false; // Dying cells can't act
      case BiologicalState.CANNIBAL:
        return action === 'attack'; // Only attacks (own cells)
      default:
        return true;
    }
  }

  getState(): BiologicalState {
    return this.currentState;
  }

  getTicksInState(currentTick: number): number {
    return currentTick - this.stateEnterTick;
  }
}
