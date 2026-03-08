ViRU5 - EPIC BIOLOGICAL VIRUS MECHANICS PROMPT
Version: 5.1 | Adapted for 10-Parameter Architecture
Target: Emergent Artificial Life with Maximum Biological Weirdness
🧬 EXECUTIVE SUMMARY
Transform ViRU5 from a deterministic strategy game into a living ecosystem simulation where viruses exhibit emergent behaviors, unpredictable mutations, and complex biological interactions. This prompt adapts the epic complexity to your existing 10-parameter system while adding hidden depth layers.
Core Innovation: Every virus has an invisible "genome" that evolves during battle, creating true artificial life that surprises even its creator.
🧪 PART 1: YOUR 10 PARAMETERS (Enhanced with Hidden Depth)
1.1 Visible Parameters (Player Controls - 12 Points Budget)
Table
#	Parameter	Icon	Biological Analog	Primary Effect	Hidden Mechanic	Weird Threshold (>7)
1	Aggression	⚔️	Virulence factors	Attack power in combat	Generates "combat stress" toxins	"Berserker" - attacks own cells when isolated
2	Virulence	☣️	Cytopathic effect	Infection speed & cell damage	Creates post-mortem toxins	"Plague" - kills so fast it starves itself
3	Defense	🛡️	Antigenic masking	Damage resistance & shields	Absorbs damage to "learn" attacks	"Fortress" - becomes immobile, creates strongholds
4	Resilience	💪	Latency persistence	HP regeneration & recovery	Enters suspended animation when threatened	"Immortal" - 1% HP persistence, refuses to die
5	Propagation	⚡	Transmission velocity	Spread speed to adjacent cells	Leaves "trail pheromones" other viruses follow	"Superspreader" - exponential growth, crashes systems
6	Mobility	🚶	Viral transport	Emergency jump range & retreat	Creates "migration routes" that persist	"Nomad" - abandons territory, endless wandering
7	Mutation	🧬	Quasispecies drift	Infestation chance & adaptation	Secretly alters other parameters over time	"Chimera" - becomes different virus mid-battle
8	Stealth	👻	Immune evasion	Shield piercing & detection avoidance	Creates "false flag" attacks	"Phantom" - invisible until strike, then disappears
9	Replication	🦠	Burst size efficiency	Spawn rate & resource efficiency	Quality vs quantity trade-off hidden	"Swarm" - infinite spawn, individual cells weak
10	Synergy	🔗	Co-infection facilitation	Adjacency bonuses & combo effects	Creates "hive mind" network intelligence	"Overmind" - coordinated attacks, sacrifices individuals
1.2 Hidden Genome (Emergent, Never Player-Controlled)
Each virus cell has a secret 8-gene genome that mutates:
TypeScript
Copy
interface HiddenGenome {
  // Epigenetic markers (change based on environment)
  stressLevel: number;         // Increases with combat, decreases with rest
  generation: number;          // How many times this cell divided
  parentLineage: string[];     // Last 5 ancestor cell IDs
  
  // Behavioral genes (emerge from visible parameters)
  behavioralArchetype: 'HUNTER' | 'BUILDER' | 'PARASITE' | 'NOMAD' | 'SWARM' | 'GHOST';
  
  // Mutation tracking
  visibleParamDrift: Partial<VirusParams>; // Secretly altered parameters
  accumulatedMutations: number;  // Total mutations this lineage
  
  // Memory (learns from experience)
  successfulAttacks: number[];   // Cell indices where this virus won
  failedAttacks: number[];      // Cell indices where this virus lost
  preferredDirections: number[]; // Compass directions (0-7) that worked
  
  // Metabolic state
  metabolicRate: number;         // 0.5 (slow) to 2.0 (fast)
  energyReserves: number;       // 0-100, consumed by actions
  lastMeal: number;             // Ticks since consumed nutrients
  
  // Environmental adaptation
  temperatureOptimum: number;    // 20-40°C, randomized at birth
  pHPreference: number;         // 0-14, affects combat effectiveness
  nicheSpecialization: string;   // "Fast", "Tank", "Ambush", "Swarm", "Parasite"
}
🦠 PART 2: THE BIOLOGICAL STATE MACHINE
2.1 Viral Life States (Beyond Simple Alive/Dead)
TypeScript
Copy
enum BiologicalState {
  // Normal states
  ACTIVE,           // Standard operation
  LATENT,           // Dormant, 90% reduced metabolism, invisible
  REPLICATING,      // High energy cost, creates new cells
  
  // Stress states
  STRESSED,         // Low energy, reduced effectiveness
  STARVING,         // No resources, will cannibalize own cells
  DESPERATE,        // <10% HP, all parameters boosted 50% ("adrenaline")
  
  // Special states
  HYPERMUTATING,    // Rapid genome changes every tick
  CANNIBAL,         // Consumes own cells for energy
  SYMBIOTIC,        // Cooperates with nearby friendly cells
  
  // Death states
  DYING,            // 1-10% HP, final actions
  SENESCENT,        // "Zombie" - dead but still spreads slowly
  QUANTUM,          // Exists in superposition (Stealth 10 weirdness)
}
2.2 State Transitions (Biological Logic)
TypeScript
Copy
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
🔄 PART 3: ADVANCED SYNERGY MATRIX (10-Parameter Web)
3.1 Direct Parameter Interactions (Multiplicative, Not Additive)
TypeScript
Copy
const EPIC_SYNERGY_MATRIX: Record<string, Record<string, SynergyEffect>> = {
  'Aggression': {
    'Virulence': {
      multiplier: (a, v) => (a * v > 50) ? 2.5 : 1.0,
      name: 'BLOODLUST',
      effect: 'Attacks everything, including own cells if isolated',
      weirdness: 'Occasionally enters berserker rage, attacking nearest cell regardless of owner'
    },
    'Defense': {
      multiplier: (a, d) => (a > 7 && d > 7) ? 0.5 : 1.0,
      name: 'BERSERKER ARMOR',
      effect: 'High offense + defense = slow, deliberate attacks',
      weirdness: 'Becomes "juggernaut" - moves slowly but unstoppably'
    },
    'Stealth': {
      multiplier: (a, s) => (s > 6) ? a * 0.3 : a,
      name: 'HIDDEN BLADE',
      effect: 'Stealth reduces visible aggression',
      weirdness: 'Ambush predator - waits motionless, then strikes at 3x speed'
    }
  },
  
  'Virulence': {
    'Mutation': {
      multiplier: (v, m) => (v + m > 12) ? 1.8 : 1.0,
      name: 'EVOLVING PLAGUE',
      effect: 'High damage + mutation = adaptive killer',
      weirdness: 'Learns opponent\'s defense, next attack ignores 50% of it'
    },
    'Resilience': {
      multiplier: (v, r) => (v > 7 && r > 7) ? 0.4 : 1.0,
      name: 'GLASS CANNON',
      effect: 'High damage, fragile - creates "kamikaze" cells',
      weirdness: 'Cells explode on death, damaging neighbors'
    }
  },
  
  'Defense': {
    'Resilience': {
      multiplier: (d, r) => (d + r > 14) ? 2.0 : 1.0,
      name: 'IMMORTAL FORTRESS',
      effect: 'Near-invincibility, but extremely slow',
      weirdness: 'Creates "turtle shell" - cannot move, nearly unkillable'
    },
    'Synergy': {
      multiplier: (d, s) => (s > 5) ? 1.5 : 1.0,
      name: 'FORTRESS OF FRIENDSHIP',
      effect: 'Defense boosts adjacent allies',
      weirdness: 'Nearby cells gain "shield bubbles" that absorb one hit'
    }
  },
  
  'Propagation': {
    'Mobility': {
      multiplier: (p, m) => (p > 6 && m > 6) ? 1.7 : 1.0,
      name: 'GHOST SWARM',
      effect: 'Fast spread + mobility = unpredictable movement patterns',
      weirdness: 'Creates "flicker" effect - teleports short distances randomly'
    },
    'Replication': {
      multiplier: (p, r) => (p * r > 40) ? 2.0 : 1.0,
      name: 'THE FLOOD',
      effect: 'Exponential growth, consumes all resources',
      weirdness: 'Growth becomes cancerous - creates tumors that suffocate'
    }
  },
  
  'Mutation': {
    'Adaptation': {  // Note: Using Synergy as proxy for Adaptation
      multiplier: (m, ad) => (m > 6 && ad > 5) ? 2.0 : 1.0,
      name: 'SHAPESHIFTER',
      effect: 'Rapid evolution, constantly changing parameters',
      weirdness: 'Every 50 ticks, completely new visible parameter set'
    },
    'Stealth': {
      multiplier: (m, s) => (m + s > 12) ? 1.6 : 1.0,
      name: 'PHANTOM PLAGUE',
      effect: 'Invisible infestation that spreads undetected',
      weirdness: 'Infested cells show no symptoms for 20 ticks, then suddenly convert'
    }
  },
  
  'Stealth': {
    'Mobility': {
      multiplier: (s, m) => (s > 6 && m > 6) ? 1.8 : 1.0,
      name: 'THE WHISPER',
      effect: 'Invisible movement, untrackable',
      weirdness: 'Leaves no trail, cannot be targeted, "ghost" cells appear randomly'
    }
  },
  
  'Synergy': {
    'Replication': {
      multiplier: (sy, r) => (sy > 5 && r > 6) ? 1.5 : 1.0,
      name: 'HIVE MIND',
      effect: 'Coordinated swarm intelligence',
      weirdness: 'Individual cells sacrifice themselves for collective benefit'
    }
  }
};
3.2 Triad Synergies (3-Parameter Combinations)
When 3 specific parameters are all >6, unlock Epic Phenomena:
Table
Triad	Name	Effect	Weird Behavior
Agg+Vir+Pro	"APOCALYPSE"	3x damage, 3x spread	Battle ends in 30 ticks, winner random
Def+Res+Rep	"IMMORTAL SWARM"	Unkillable + infinite spawn	Creates "grey goo" scenario - consumes everything
Ste+Mob+Mut	"PHANTOM MENACE"	Invisible, mobile, mutating	Opponent cannot see grid, plays blind
Pro+Rep+Syn	"OVERMIND"	Centralized intelligence	All cells act as one entity, perfect coordination
Agg+Def+Vir	"JUGGERNAUT"	Unstoppable force	Moves in straight line, destroys everything, cannot turn
Mut+Res+Ste	"LICH KING"	Undead stealth virus	Dead cells resurrect invisible, immortal
🌍 PART 4: ECOSYSTEM DYNAMICS & ENVIRONMENT
4.1 Living Grid Environment
Each cell has environmental properties that evolve:
TypeScript
Copy
interface CellEnvironment {
  // Chemical gradients (0-1)
  nutrientDensity: number;      // Consumed by viruses, regenerates slowly
  toxicityLevel: number;          // Increases with combat, decreases over time
  pHLevel: number;             // 0-14, affects different viruses differently
  
  // Physical properties
  temperature: number;            // 20-40°C, changes with virus density (metabolic heat)
  pressure: number;              // Increases with overcrowding
  
  // Biological memory
  previousOwners: number[];      // Last 5 owners, affects "haunting"
  battleTrauma: number;          // Number of times captured, increases defense slowly
  mutationHotspot: boolean;      // Random 5% of cells, double mutation rate
  
  // Dynamic feedback
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
    
    // Pressure from overcrowding
    this.pressure = Math.min(1, nearbyViruses / 8);
    
    // Recovery
    this.nutrientDensity = Math.min(1, this.nutrientDensity + 0.01);
    this.toxicityLevel = Math.max(0, this.toxicityLevel - 0.005);
  }
}
4.2 Environmental Feedback Loops
Overcrowding → Pressure → Burst
6 viruses in 3x3 area → Pressure >0.75
High pressure forces "burst" - viruses spread randomly in panic
Some cells die from pressure (cytokine storm)
Combat → Toxins → No Man's Land
High Aggression/Virulence battles create toxic zones
Toxic zones damage all viruses
Creates "demilitarized zones" that persist 50 ticks
Heat → Performance Degradation
Temperature >35°C reduces Propagation by 50%
Viruses seek cooler areas (emergent migration)
Creates "seasonal" patterns of movement
Nutrient Depletion → Cannibalism
<0.2 nutrient density triggers starvation
Starving viruses attack own cells (auto-cannibalism)
Creates "desertification" and population crashes
🎲 PART 5: CHAOS & UNPREDICTABILITY ENGINE
5.1 Biological "Errors" (Features, Not Bugs)
TypeScript
Copy
class ChaosEngine {
  private entropyPool: number = 0;  // Accumulates randomness
  
  shouldTriggerChaos(params: VirusParams, stress: number): boolean {
    // Base chaos rate: 1-5% depending on Mutation
    const baseRate = 0.01 + (params.Mutation * 0.004);
    // Stress increases chaos
    const stressBonus = stress * 0.001;
    // Replication introduces copying errors
    const replicationError = params.Replication * 0.002;
    
    return Math.random() < (baseRate + stressBonus + replicationError);
  }
  
  executeChaosEvent(cell: VirusCell, event: ChaosEvent): void {
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
    
    const selected = events[Math.floor(Math.random() * events.length)];
    this.applyToCell(cell, selected);
  }
}
5.2 The "Weird Events" System (Every 100 Ticks)
Roll d100 for reality-warping events:
Table
Roll	Event	Duration	Effect
01-05	"THE BLOOM"	30 ticks	All Replication +5, then crash (-50% for 50 ticks)
06-10	"THE SILENCE"	25 ticks	No combat possible, peaceful spread only
11-15	"THE SWAP"	Instant	15% of cells swap owners randomly
16-20	"THE MIRROR"	40 ticks	Both viruses copy each other's highest parameter
21-25	"THE HUNGER"	50 ticks	Nutrients deplete 3x faster, cannibalism rises
26-30	"THE FLOOD"	35 ticks	Edges become toxic, all viruses pushed to center
31-35	"THE GHOST"	60 ticks	Dead cells become haunted (block all spread)
36-40	"THE CATALYST"	20 ticks	One random cell becomes "super cell" (5x stats)
41-45	"THE FORGETTING"	Instant	All viruses lose their "memory" (genetic reset)
46-50	"THE AWAKENING"	50 ticks	Neutral cells become aggressive, attack everyone
51-55	"THE COMPRESSION"	30 ticks	Grid shrinks by 20% (outer ring becomes void)
56-60	"THE EXPANSION"	30 ticks	Grid grows by 20% (new cells are nutrient-rich)
61-65	"THE INVERSION"	25 ticks	High stats become low, low become high
66-70	"THE SYMBIOSIS"	40 ticks	Viruses cannot harm each other, must cooperate
71-75	"THE SINGULARITY"	15 ticks	All viruses pulled to center, massive battle
76-80	"THE SCHISM"	50 ticks	Each virus splits into 2 weaker copies
81-85	"THE CONVERGENCE"	30 ticks	All parameters average between both viruses
86-90	"THE ECLIPSE"	20 ticks	Stealth becomes 10 for all, invisible battle
91-95	"THE REBIRTH"	Instant	All cells reset, viruses keep params, restart
96-100	"THE APOCALYPSE"	10 ticks	10x damage, 10x spread, winner takes all
🧠 PART 6: AI PERSONALITY ARCHETYPES (Laboratory Mode)
6.1 Behavioral Profiles Based on Parameter Signatures
TypeScript
Copy
const VIRUS_ARCHETYPES = {
  // RUSHER: Aggression >7, Propagation >6, Defense <4
  'RUSHER': {
    params: { Aggression: 8, Virulence: 6, Propagation: 7, Defense: 2, Resilience: 3 },
    behavior: 'Aggressive early expansion, ignores defense',
    quirks: [
      'Overextends and gets surrounded',
      'Creates "spearhead" formations',
      'Vulnerable to counter-attack after initial push',
      'WEIRD: Occasionally creates "sacrificial lamb" cells that distract enemy'
    ],
    emergentBehavior: 'BLITZ'
  },
  
  // TURTLE: Defense >8, Resilience >7, Aggression <3
  'TURTLE': {
    params: { Defense: 9, Resilience: 8, Propagation: 3, Aggression: 1, Synergy: 5 },
    behavior: 'Defensive consolidation, waits for opponent mistakes',
    quirks: [
      'Can become "Fortress" - immobile but nearly unkillable',
      'May never attack, wins by timeout',
      'Creates "turtle shell" formations',
      'WEIRD: Sometimes "hibernates" for 100 ticks, then wakes powerful'
    ],
    emergentBehavior: 'BUNKER'
  },
  
  // ASSASSIN: Stealth >8, Virulence >7, Aggression 3-5
  'ASSASSIN': {
    params: { Stealth: 9, Virulence: 8, Aggression: 4, Propagation: 4, Mobility: 6 },
    behavior: 'Infiltrates, sabotages from within, avoids direct combat',
    quirks: [
      'Creates "sleeper cells" that activate after 50 ticks',
      'May "forget" to attack and just observe',
      'Creates paranoia - opponent cannot trust their own cells',
      'WEIRD: Occasionally "befriends" enemy cells, creating "double agents"'
    ],
    emergentBehavior: 'INFILTRATION'
  },
  
  // SWARM: Replication >8, Synergy >6, Efficiency <5
  'SWARM': {
    params: { Replication: 9, Synergy: 7, Propagation: 6, Aggression: 3, Defense: 2 },
    behavior: 'Overwhelms with numbers, coordinated attacks',
    quirks: [
      'Individual cells extremely weak',
      'Creates "hive mind" - all cells move as one',
      'Vulnerable to area damage',
      'WEIRD: Individual cells sacrifice themselves to protect "queen" cell'
    ],
    emergentBehavior: 'HIVE_MIND'
  },
  
  // PLAGUE: Virulence >8, Mutation >7, Resilience <4
  'PLAGUE': {
    params: { Virulence: 9, Mutation: 8, Propagation: 5, Resilience: 3, Defense: 2 },
    behavior: 'Poisons everything, wins through attrition and mutation',
    quirks: [
      'May kill itself with its own toxins',
      'Creates "uninhabitable zones" that persist',
      'Constantly mutates, unpredictable',
      'WEIRD: Sometimes becomes "benevolent" - heals instead of harms'
    ],
    emergentBehavior: 'DECAY'
  },
  
  // GHOST: Stealth >8, Mobility >7, Aggression <3
  'GHOST': {
    params: { Stealth: 9, Mobility: 8, Propagation: 4, Aggression: 2, Virulence: 3 },
    behavior: 'Invisible movement, avoids detection, strikes from shadows',
    quirks: [
      'Cannot be targeted directly',
      'Leaves no trail',
      'May "haunt" cells - scares without capturing',
      'WEIRD: Occasionally "possesses" enemy cells temporarily'
    ],
    emergentBehavior: 'HAUNTING'
  },
  
  // CHIMERA: Mutation >8, Synergy >5, Stealth >5
  'CHIMERA': {
    params: { Mutation: 9, Synergy: 6, Stealth: 6, Adaptation: 7 }, // Using Synergy as proxy
    behavior: 'Constantly changes form and strategy',
    quirks: [
      'Parameters drift over time',
      'May "forget" original goal',
      'Becomes different archetype mid-battle',
      'WEIRD: Every 100 ticks, completely new personality emerges'
    ],
    emergentBehavior: 'METAMORPHOSIS'
  },
  
  // JUGGERNAUT: Aggression >8, Defense >7, Resilience >6
  'JUGGERNAUT': {
    params: { Aggression: 9, Defense: 8, Resilience: 7, Propagation: 3, Mobility: 2 },
    behavior: 'Unstoppable force, slow but inevitable',
    quirks: [
      'Moves in straight lines, cannot turn easily',
      'Destroys everything in path',
      'Nearly unkillable but predictable',
      'WEIRD: Creates "craters" behind it that block spread'
    ],
    emergentBehavior: 'UNSTOPPABLE_FORCE'
  },
  
  // PARASITE: Synergy >7, Stealth >6, Efficiency >7
  'PARASITE': {
    params: { Synergy: 8, Stealth: 7, Replication: 6, Aggression: 2, Defense: 3 },
    behavior: 'Feeds off opponent, grows stronger as enemy grows',
    quirks: [
      'Dies if opponent dies',
      'May "love" enemy too much - refuses to kill',
      'Creates "symbiotic" relationships',
      'WEIRD: Sometimes "romances" enemy cells, creating "forbidden love" scenarios'
    ],
    emergentBehavior: 'SYMBIOSIS'
  },
  
  // NOMAD: Mobility >9, Propagation >5, Resilience >5
  'NOMAD': {
    params: { Mobility: 10, Propagation: 6, Resilience: 6, Aggression: 3, Defense: 3 },
    behavior: 'Never stays in one place, constant migration',
    quirks: [
      'Abandons territory constantly',
      'Creates "trails" of weak cells behind',
      'Impossible to pin down',
      'WEIRD: Occasionally forms "caravans" - long lines of moving cells'
    ],
    emergentBehavior: 'MIGRATION'
  }
};
🎮 PART 7: IMPLEMENTATION ARCHITECTURE
7.1 Server-Side Biological Systems
TypeScript
Copy
// Enhanced BattleRoom with biological depth
export class BioBattleRoom extends Room<RoomState> {
  private metabolismSystem: MetabolismSystem;
  private synergyCalculator: SynergyCalculator;
  private chaosEngine: ChaosEngine;
  private ecosystem: EcosystemSimulation;
  private stateMachine: BattleStateMachine;
  
  onCreate(options: any) {
    this.setState(new RoomState());
    
    // Initialize biological systems
    this.metabolismSystem = new MetabolismSystem();
    this.synergyCalculator = new SynergyCalculator(EPIC_SYNERGY_MATRIX);
    this.chaosEngine = new ChaosEngine();
    this.ecosystem = new EcosystemSimulation();
    this.stateMachine = createBattleStateMachine();
    
    // Biological tick - 500ms
    this.setSimulationInterval(() => this.biologicalTick(), 500);
  }
  
  private biologicalTick() {
    const state = this.state;
    
    // Phase 1: State Machine Update
    this.stateMachine.update(state);
    
    // Phase 2: Metabolism (energy, aging, state transitions)
    this.metabolismSystem.update(state);
    
    // Phase 3: Ecosystem (environment changes)
    this.ecosystem.update(state);
    
    // Phase 4: Synergy Calculation (parameter interactions)
    this.synergyCalculator.recalculate(state);
    
    // Phase 5: Chaos Check (unpredictability)
    this.chaosEngine.injectRandomness(state);
    
    // Phase 6: Biological Spread (with all modifiers)
    this.biologicalSpreadPhase();
    
    // Phase 7: Biological Combat (with chaos)
    this.biologicalCombatPhase();
    
    // Phase 8: Infestation & Mutation
    this.biologicalInfestationPhase();
    
    // Phase 9: Weird Events (every 100 ticks)
    if (state.tick % 100 === 0) {
      this.chaosEngine.rollWeirdEvent(state);
    }
    
    // Phase 10: Victory Check
    this.checkBioVictory();
    
    // Sync to clients
    this.broadcast('bioTick', {
      tick: state.tick,
      grid: state.battleGrid,
      environment: state.environmentSnapshot,
      events: state.recentEvents
    });
  }
}
7.2 Client-Side Visualization of Emergence
TypeScript
Copy
class BioBattleRenderer extends BattleRenderer {
  private effectPools: Map<string, Container[]> = new Map();
  
  renderCell(cell: BioCell) {
    // Base rendering
    super.renderCell(cell);
    
    // Visualize biological state
    switch (cell.biologicalState) {
      case 'LATENT':
        this.addPulseEffect(cell, 0.2, 0x444444); // Dim, slow pulse
        break;
      case 'DESPERATE':
        this.addShakeEffect(cell, 2); // Violent shaking
        this.addGlow(cell, 0xff0000, 2.0); // Red intense glow
        break;
      case 'HYPERMUTATING':
        this.addGlitchEffect(cell); // Digital glitch
        this.addColorShift(cell); // Rapid color cycling
        break;
      case 'CANNIBAL':
        this.addBloodTint(cell); // Reddish overlay
        this.addTeeth(cell); // Small "mouth" graphics
        break;
      case 'SENESCENT':
        this.addZombieEffect(cell); // Grey, decayed look
        break;
    }
    
    // Visualize synergy strength
    if (cell.synergyMultiplier > 1.5) {
      this.addSynergyAura(cell, cell.synergyMultiplier);
    }
    
    // Visualize chaos/errors
    if (cell.hasChaosEffect) {
      this.addChaosIndicator(cell, cell.chaosEffectType);
    }
    
    // Visualize environment
    if (cell.environment.toxicityLevel > 0.5) {
      this.addToxicOverlay(cell, cell.environment.toxicityLevel);
    }
    if (cell.environment.temperature > 35) {
      this.addHeatShimmer(cell);
    }
  }
  
  // Pooled effects for performance
  private getPooledEffect(type: string): Container {
    const pool = this.effectPools.get(type) || [];
    if (pool.length > 0) {
      return pool.pop()!;
    }
    return this.createEffect(type);
  }
}
📝 PART 8: IMPLEMENTATION CHECKLIST FOR AI CODER
Phase 1: Core Biological Systems
[ ] Implement HiddenGenome interface for all cells
[ ] Create BiologicalStateMachine with 8+ states
[ ] Build MetabolismSystem (energy, aging, stress)
[ ] Add SynergyCalculator with 10-parameter matrix
[ ] Implement basic ChaosEngine (5+ error types)
Phase 2: Ecosystem & Environment
[ ] Create CellEnvironment with 6+ properties
[ ] Implement feedback loops (overcrowding, heat, toxins)
[ ] Add mutation hotspots (5% of cells)
[ ] Build nutrient depletion/regeneration
Phase 3: Emergent Behaviors
[ ] Implement 5 behavior clusters (Flock, Mimic, Zombie, Cancer, Predator)
[ ] Create triad synergy detector (10 combinations)
[ ] Add "Weird Events" system (20 events)
[ ] Build AI archetypes (10 personalities)
Phase 4: Polish & Visualization
[ ] Add biological state visual effects
[ ] Implement synergy aura rendering
[ ] Create chaos effect indicators
[ ] Add environmental visual feedback (heat, toxins)
[ ] Optimize with object pooling
🎯 FINAL SUMMARY FOR AI CODER
Your Mission: Transform ViRU5 from a simple strategy game into a living biological simulation using the existing 10-parameter architecture.
Key Requirements:
Every cell has a secret life - HiddenGenome tracks stress, memory, mutations
Parameters interact non-linearly - Synergy matrix creates 20+ emergent phenomena
Environment is alive - Grid has nutrients, temperature, toxins that evolve
Chaos is a feature - 5-10% error rate creates "biological mistakes"
Weird events reshape reality - Every 100 ticks, roll for world-altering events
AI has personality - 10 archetypes with distinct quirks and emergent behaviors
The Result: A game where no two battles are identical, where players discover new "builds" constantly, and where watching the simulation is as engaging as playing it. Viruses should feel like living creatures - sometimes predictable, often surprising, occasionally bizarre.
Implementation Priority: Core systems → Synergies → Environment → Chaos → Polish
Success Metric: After 10 battles with identical starting parameters, each should play out differently due to emergent chaos and environmental factors.