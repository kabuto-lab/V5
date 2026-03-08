/**
 * SynergyCalculator - Non-linear parameter interactions
 * Creates emergent phenomena from parameter combinations
 */

import { VirusParams, SynergyEffect, SynergyMatrix, BioCell } from './BioTypes';

export class SynergyCalculator {
  private synergyMatrix: SynergyMatrix;

  constructor() {
    this.synergyMatrix = this.createSynergyMatrix();
  }

  private createSynergyMatrix(): SynergyMatrix {
    return {
      'aggression': {
        'virulence': {
          multiplier: (a, v) => (a * v > 50) ? 2.5 : 1.0,
          name: 'BLOODLUST',
          effect: 'Attacks everything, including own cells if isolated',
          weirdness: 'Occasionally enters berserker rage, attacking nearest cell regardless of owner',
          active: false
        },
        'defense': {
          multiplier: (a, d) => (a > 7 && d > 7) ? 0.5 : 1.0,
          name: 'BERSERKER ARMOR',
          effect: 'High offense + defense = slow, deliberate attacks',
          weirdness: 'Becomes "juggernaut" - moves slowly but unstoppably',
          active: false
        },
        'stealth': {
          multiplier: (a, s) => (s > 6) ? a * 0.3 : a,
          name: 'HIDDEN BLADE',
          effect: 'Stealth reduces visible aggression',
          weirdness: 'Ambush predator - waits motionless, then strikes at 3x speed',
          active: false
        },
        'replication': {
          multiplier: (a, r) => (a > 6 && r > 6) ? 1.4 : 1.0,
          name: 'SWARM FURY',
          effect: 'Aggressive replication creates overwhelming numbers',
          weirdness: 'Cells divide rapidly but die young',
          active: false
        }
      },

      'virulence': {
        'mutation': {
          multiplier: (v, m) => (v + m > 12) ? 1.8 : 1.0,
          name: 'EVOLVING PLAGUE',
          effect: 'High damage + mutation = adaptive killer',
          weirdness: 'Learns opponent\'s defense, next attack ignores 50% of it',
          active: false
        },
        'resilience': {
          multiplier: (v, r) => (v > 7 && r > 7) ? 0.4 : 1.0,
          name: 'GLASS CANNON',
          effect: 'High damage, fragile - creates "kamikaze" cells',
          weirdness: 'Cells explode on death, damaging neighbors',
          active: false
        },
        'toxicity': {
          multiplier: (v, t) => (v > 6 && t > 6) ? 1.6 : 1.0,
          name: 'BIOHAZARD',
          effect: 'Creates toxic zones that damage all viruses',
          weirdness: 'Toxic zones persist after battle, haunt the grid',
          active: false
        }
      },

      'defense': {
        'resilience': {
          multiplier: (d, r) => (d + r > 14) ? 2.0 : 1.0,
          name: 'IMMORTAL FORTRESS',
          effect: 'Near-invincibility, but extremely slow',
          weirdness: 'Creates "turtle shell" - cannot move, nearly unkillable',
          active: false
        },
        'synergy': {
          multiplier: (d, s) => (s > 5) ? 1.5 : 1.0,
          name: 'FORTRESS OF FRIENDSHIP',
          effect: 'Defense boosts adjacent allies',
          weirdness: 'Nearby cells gain "shield bubbles" that absorb one hit',
          active: false
        },
        'replication': {
          multiplier: (d, r) => (d > 6 && r > 6) ? 1.3 : 1.0,
          name: 'SWARM ARMOR',
          effect: 'Many weak cells create collective defense',
          weirdness: 'Individual cells sacrifice for collective',
          active: false
        }
      },

      'propagation': {
        'mobility': {
          multiplier: (p, m) => (p > 6 && m > 6) ? 1.7 : 1.0,
          name: 'GHOST SWARM',
          effect: 'Fast spread + mobility = unpredictable movement patterns',
          weirdness: 'Creates "flicker" effect - teleports short distances randomly',
          active: false
        },
        'replication': {
          multiplier: (p, r) => (p * r > 40) ? 2.0 : 1.0,
          name: 'THE FLOOD',
          effect: 'Exponential growth, consumes all resources',
          weirdness: 'Growth becomes cancerous - creates tumors that suffocate',
          active: false
        },
        'stealth': {
          multiplier: (p, s) => (s > 6) ? 1.4 : 1.0,
          name: 'SILENT SPREAD',
          effect: 'Spreads undetected until too late',
          weirdness: 'Opponent cannot see spread direction',
          active: false
        }
      },

      'mobility': {
        'stealth': {
          multiplier: (m, s) => (s > 6 && m > 6) ? 1.8 : 1.0,
          name: 'THE WHISPER',
          effect: 'Invisible movement, untrackable',
          weirdness: 'Leaves no trail, cannot be targeted, "ghost" cells appear randomly',
          active: false
        },
        'mutation': {
          multiplier: (m, mu) => (m > 6 && mu > 6) ? 1.5 : 1.0,
          name: 'MIGRATORY EVOLUTION',
          effect: 'Movement triggers adaptation',
          weirdness: 'Cells evolve differently based on direction traveled',
          active: false
        }
      },

      'mutation': {
        'stealth': {
          multiplier: (mu, s) => (mu + s > 12) ? 1.6 : 1.0,
          name: 'PHANTOM PLAGUE',
          effect: 'Invisible infestation that spreads undetected',
          weirdness: 'Infested cells show no symptoms for 20 ticks, then suddenly convert',
          active: false
        },
        'synergy': {
          multiplier: (mu, s) => (mu > 6 && s > 5) ? 1.4 : 1.0,
          name: 'ADAPTIVE HIVE',
          effect: 'Mutations spread through synergy network',
          weirdness: 'One cell mutates, all connected cells follow',
          active: false
        }
      },

      'stealth': {
        'synergy': {
          multiplier: (s, syn) => (s > 6 && syn > 5) ? 1.5 : 1.0,
          name: 'INVISIBLE HAND',
          effect: 'Synergy bonuses apply without visible connection',
          weirdness: 'Cells cooperate but show no visual link',
          active: false
        }
      },

      'replication': {
        'synergy': {
          multiplier: (r, s) => (r > 6 && s > 5) ? 1.5 : 1.0,
          name: 'HIVE MIND',
          effect: 'Coordinated swarm intelligence',
          weirdness: 'Individual cells sacrifice themselves for collective benefit',
          active: false
        }
      }
    };
  }

  /**
   * Calculate total synergy multiplier for a virus
   */
  calculateMultiplier(params: VirusParams): { multiplier: number; activeSynergies: string[] } {
    let totalMultiplier = 1.0;
    const activeSynergies: string[] = [];

    const paramKeys = Object.keys(params) as (keyof VirusParams)[];

    for (let i = 0; i < paramKeys.length; i++) {
      for (let j = i + 1; j < paramKeys.length; j++) {
        const key1 = paramKeys[i];
        const key2 = paramKeys[j];
        const val1 = params[key1] || 0;
        const val2 = params[key2] || 0;

        // Check synergy in both directions
        const synergy = this.getSynergy(key1, key2, val1, val2) ||
                       this.getSynergy(key2, key1, val2, val1);

        if (synergy && synergy.multiplier(val1, val2) > 1.0) {
          totalMultiplier *= synergy.multiplier(val1, val2);
          activeSynergies.push(synergy.name);
          synergy.active = true;
        }
      }
    }

    return {
      multiplier: Math.round(totalMultiplier * 100) / 100,
      activeSynergies
    };
  }

  private getSynergy(
    key1: string,
    key2: string,
    val1: number,
    val2: number
  ): SynergyEffect | null {
    const matrix = this.synergyMatrix;
    if (matrix[key1] && matrix[key1][key2]) {
      return matrix[key1][key2];
    }
    return null;
  }

  /**
   * Check for triad synergies (3-parameter combinations)
   */
  checkTriadSynergies(params: VirusParams): string[] {
    const triads: string[] = [];
    const p = params;

    // APOCALYPSE: Agg+Vir+Pro all >6
    if (p.aggression > 6 && p.virulence > 6 && p.propagation > 6) {
      triads.push('APOCALYPSE - 3x damage, 3x spread, battle ends in 30 ticks');
    }

    // IMMORTAL SWARM: Def+Res+Rep all >6
    if (p.defense > 6 && p.resilience > 6 && p.replication > 6) {
      triads.push('IMMORTAL SWARM - Unkillable + infinite spawn');
    }

    // PHANTOM MENACE: Ste+Mob+Mut all >6
    if (p.stealth > 6 && p.mobility > 6 && p.mutation > 6) {
      triads.push('PHANTOM MENACE - Invisible, mobile, mutating');
    }

    // OVERMIND: Pro+Rep+Syn all >6
    if (p.propagation > 6 && p.replication > 6 && p.synergy > 6) {
      triads.push('OVERMIND - Centralized intelligence');
    }

    // JUGGERNAUT: Agg+Def+Vir all >6
    if (p.aggression > 6 && p.defense > 6 && p.virulence > 6) {
      triads.push('JUGGERNAUT - Unstoppable force');
    }

    // LICH KING: Mut+Res+Ste all >6
    if (p.mutation > 6 && p.resilience > 6 && p.stealth > 6) {
      triads.push('LICH KING - Undead stealth virus');
    }

    return triads;
  }

  /**
   * Get weird behavior description for a synergy
   */
  getWeirdBehavior(param1: keyof VirusParams, param2: keyof VirusParams): string | null {
    const synergy = this.synergyMatrix[param1]?.[param2];
    return synergy?.weirdness || null;
  }

  /**
   * Reset synergy active states
   */
  resetActiveStates(): void {
    for (const key1 in this.synergyMatrix) {
      for (const key2 in this.synergyMatrix[key1]) {
        this.synergyMatrix[key1][key2].active = false;
      }
    }
  }

  /**
   * Calculate synergy multipliers for given params
   * Returns synergy result with multipliers and active effects
   */
  calculate(params: VirusParams): { attackMult: number; defenseMult: number; speedMult: number; special: string | null } {
    const result = {
      attackMult: 1.0,
      defenseMult: 1.0,
      speedMult: 1.0,
      special: null as string | null
    };

    // Check pairwise synergies
    const pairs: Array<[keyof VirusParams, keyof VirusParams]> = [
      ['aggression', 'virulence'],
      ['aggression', 'defense'],
      ['mutation', 'stealth'],
      ['replication', 'resilience'],
      ['propagation', 'mobility']
    ];

    for (const [p1, p2] of pairs) {
      const synergy = this.synergyMatrix[p1]?.[p2];
      if (synergy) {
        const val1 = params[p1] || 0;
        const val2 = params[p2] || 0;
        const mult = synergy.multiplier(val1, val2);
        if (mult > 1.0) {
          result.attackMult *= mult;
          result.special = synergy.name;
          synergy.active = true;
        }
      }
    }

    return result;
  }
}
