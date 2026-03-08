/**
 * ViRU5 Biological Virus Types
 * Extended 10-parameter system with hidden genome and emergent behaviors
 */

// ============================================
// VISIBLE PARAMETERS (Player Controls - 12 Points)
// ============================================

export interface VirusParams {
  // Core 10 parameters
  aggression: number;      // ⚔️ Attack power in combat
  virulence: number;       // ☣️ Infection speed & cell damage
  defense: number;         // 🛡️ Damage resistance & shields
  resilience: number;      // 💪 HP regeneration & recovery
  propagation: number;     // ⚡ Spread speed to adjacent cells
  mobility: number;        // 🚶 Emergency jump range & retreat
  mutation: number;        // 🧬 Infestation chance & adaptation
  stealth: number;         // 👻 Shield piercing & detection avoidance
  replication: number;     // 🦠 Spawn rate & resource efficiency
  synergy: number;         // 🔗 Adjacency bonuses & combo effects
  // Legacy compatibility aliases (map to core params)
  speed: number;          // = propagation
  reproduction: number;   // = replication
  intellect: number;      // = synergy
  contagiousness: number; // = mutation
  lethality: number;      // = virulence
}

// Default empty params
export const DEFAULT_VIRUS_PARAMS: VirusParams = {
  aggression: 0,
  virulence: 0,
  defense: 0,
  resilience: 0,
  propagation: 0,
  mobility: 0,
  mutation: 0,
  stealth: 0,
  replication: 0,
  synergy: 0,
  speed: 0,
  reproduction: 0,
  intellect: 0,
  contagiousness: 0,
  lethality: 0
};

// ============================================
// HIDDEN GENOME (Emergent, Never Player-Controlled)
// ============================================

export type BehavioralArchetype = 
  | 'HUNTER'      // Aggressive predator
  | 'BUILDER'     // Defensive consolidator
  | 'PARASITE'    // Symbiotic feeder
  | 'NOMAD'       // Endless wanderer
  | 'SWARM'       // Hive mind collective
  | 'GHOST';      // Invisible infiltrator

export type NicheSpecialization = 
  | 'Fast'        // Speed-focused
  | 'Tank'        // Defense-focused
  | 'Ambush'      // Stealth-focused
  | 'Swarm'       // Numbers-focused
  | 'Parasite';   // Synergy-focused

export interface HiddenGenome {
  // Epigenetic markers (change based on environment)
  stressLevel: number;         // 0-100, increases with combat
  generation: number;          // How many times this cell divided
  parentLineage: string[];     // Last 5 ancestor cell IDs
  
  // Behavioral genes (emerge from visible parameters)
  behavioralArchetype: BehavioralArchetype;
  
  // Mutation tracking
  visibleParamDrift: Partial<VirusParams>; // Secretly altered parameters
  accumulatedMutations: number;  // Total mutations this lineage
  
  // Memory (learns from experience)
  successfulAttacks: number[];   // Cell indices where this virus won
  failedAttacks: number[];       // Cell indices where this virus lost
  preferredDirections: number[]; // Compass directions (0-7) that worked
  
  // Metabolic state
  metabolicRate: number;         // 0.5 (slow) to 2.0 (fast)
  energyReserves: number;        // 0-100, consumed by actions
  lastMeal: number;              // Ticks since consumed nutrients
  
  // Environmental adaptation
  temperatureOptimum: number;    // 20-40°C, randomized at birth
  pHPreference: number;          // 0-14, affects combat effectiveness
  nicheSpecialization: NicheSpecialization;
}

// ============================================
// BIOLOGICAL STATES
// ============================================

export enum BiologicalState {
  // Normal states
  ACTIVE = 'ACTIVE',           // Standard operation
  LATENT = 'LATENT',           // Dormant, 90% reduced metabolism
  REPLICATING = 'REPLICATING', // High energy cost, creates new cells
  
  // Stress states
  STRESSED = 'STRESSED',       // Low energy, reduced effectiveness
  STARVING = 'STARVING',       // No resources, will cannibalize
  DESPERATE = 'DESPERATE',     // <10% HP, all parameters boosted 50%
  
  // Special states
  HYPERMUTATING = 'HYPERMUTATING', // Rapid genome changes
  CANNIBAL = 'CANNIBAL',           // Consumes own cells for energy
  SYMBIOTIC = 'SYMBIOTIC',         // Cooperates with nearby friendly cells
  
  // Death states
  DYING = 'DYING',             // 1-10% HP, final actions
  SENESCENT = 'SENESCENT',     // "Zombie" - dead but still spreads
  QUANTUM = 'QUANTUM'          // Exists in superposition (Stealth 10 weirdness)
}

// ============================================
// SYNERGY EFFECTS
// ============================================

export interface SynergyEffect {
  multiplier: (a: number, b: number) => number;
  name: string;
  effect: string;
  weirdness: string;
  active: boolean;
}

// ============================================
// CELL ENVIRONMENT
// ============================================

export interface CellEnvironment {
  // Chemical gradients (0-1)
  nutrientDensity: number;
  toxicityLevel: number;
  pHLevel: number;
  
  // Physical properties
  temperature: number;         // 20-40°C
  pressure: number;            // 0-1, increases with overcrowding
  
  // Biological memory
  previousOwners: number[];
  battleTrauma: number;
  mutationHotspot: boolean;
  
  // State
  recentCombat: boolean;
  currentOwner: number;
}

// ============================================
// CHAOS EVENTS
// ============================================

export interface ChaosEvent {
  name: string;
  effect: string;
  duration: number;
  visual: string;
  apply?: (cell: BioCell, state: any) => void;
}

// ============================================
// WEIRD EVENTS (Every 100 ticks)
// ============================================

export interface WeirdEvent {
  rollRange: [number, number];
  name: string;
  duration: number;
  effect: string;
  apply?: (state: any) => void;
}

// ============================================
// AI ARCHETYPES
// ============================================

export interface AIArchetype {
  name: string;
  params: Partial<VirusParams>;
  behavior: string;
  quirks: string[];
  emergentBehavior: string;
}

// ============================================
// BIO CELL (Extended Battle Cell)
// ============================================

export interface BioCell {
  index: number;
  owner: number;           // 0 = empty, 1 = team1, 2 = team2
  hp: number;
  maxHp: number;
  
  // Biological extensions
  biologicalState: BiologicalState;
  hiddenGenome: HiddenGenome;
  visibleParams: VirusParams;
  environment: CellEnvironment;
  
  // Temporary effects
  activeEffects: Map<string, { duration: number; value: any }>;
  synergyMultiplier: number;
  hasChaosEffect: boolean;
  chaosEffectType: string | null;
  
  // State flags
  isZombie: boolean;
  isInfested: boolean;
  lastActionTick: number;
}

// ============================================
// BATTLE STATE
// ============================================

export interface BioBattleState {
  tick: number;
  grid: BioCell[];
  width: number;
  height: number;
  phase: 'setup' | 'countdown' | 'battle' | 'ended';
  winner: string | null;
  
  // Biological tracking
  recentEvents: string[];
  environmentSnapshot: CellEnvironment[];
  activeWeirdEvents: WeirdEvent[];
}

// ============================================
// SYNERGY MATRIX DEFINITION
// ============================================

export type SynergyMatrix = Record<string, Record<string, SynergyEffect>>;
