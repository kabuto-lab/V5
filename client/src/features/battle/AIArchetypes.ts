/**
 * AI Archetypes - Behavioral profiles for single-player/laboratory mode
 * Each archetype has distinct personality, quirks, and emergent behaviors
 */

import { VirusParams, AIArchetype } from './BioTypes';

export const AI_ARCHETYPES: AIArchetype[] = [
  {
    name: 'RUSHER',
    params: {
      aggression: 8,
      virulence: 6,
      propagation: 7,
      defense: 2,
      resilience: 3,
      mobility: 4,
      mutation: 3,
      stealth: 2,
      replication: 5,
      synergy: 3
    },
    behavior: 'Aggressive early expansion, ignores defense',
    quirks: [
      'Overextends and gets surrounded',
      'Creates "spearhead" formations',
      'Vulnerable to counter-attack after initial push',
      'WEIRD: Occasionally creates "sacrificial lamb" cells that distract enemy'
    ],
    emergentBehavior: 'BLITZ'
  },

  {
    name: 'TURTLE',
    params: {
      defense: 9,
      resilience: 8,
      propagation: 3,
      aggression: 1,
      synergy: 5,
      virulence: 2,
      mobility: 2,
      mutation: 2,
      stealth: 3,
      replication: 4
    },
    behavior: 'Defensive consolidation, waits for opponent mistakes',
    quirks: [
      'Can become "Fortress" - immobile but nearly unkillable',
      'May never attack, wins by timeout',
      'Creates "turtle shell" formations',
      'WEIRD: Sometimes "hibernates" for 100 ticks, then wakes powerful'
    ],
    emergentBehavior: 'BUNKER'
  },

  {
    name: 'ASSASSIN',
    params: {
      stealth: 9,
      virulence: 8,
      aggression: 4,
      propagation: 4,
      mobility: 6,
      mutation: 5,
      defense: 3,
      resilience: 4,
      replication: 3,
      synergy: 4
    },
    behavior: 'Infiltrates, sabotages from within, avoids direct combat',
    quirks: [
      'Creates "sleeper cells" that activate after 50 ticks',
      'May "forget" to attack and just observe',
      'Creates paranoia - opponent cannot trust their own cells',
      'WEIRD: Occasionally "befriends" enemy cells, creating "double agents"'
    ],
    emergentBehavior: 'INFILTRATION'
  },

  {
    name: 'SWARM',
    params: {
      replication: 9,
      synergy: 7,
      propagation: 6,
      aggression: 3,
      defense: 2,
      mobility: 4,
      mutation: 4,
      stealth: 3,
      resilience: 3,
      virulence: 4
    },
    behavior: 'Overwhelms with numbers, coordinated attacks',
    quirks: [
      'Individual cells extremely weak',
      'Creates "hive mind" - all cells move as one',
      'Vulnerable to area damage',
      'WEIRD: Individual cells sacrifice themselves to protect "queen" cell'
    ],
    emergentBehavior: 'HIVE_MIND'
  },

  {
    name: 'PLAGUE',
    params: {
      virulence: 9,
      mutation: 8,
      propagation: 5,
      resilience: 3,
      defense: 2,
      aggression: 6,
      mobility: 4,
      stealth: 4,
      replication: 5,
      synergy: 4
    },
    behavior: 'Poisons everything, wins through attrition and mutation',
    quirks: [
      'May kill itself with its own toxins',
      'Creates "uninhabitable zones" that persist',
      'Constantly mutates, unpredictable',
      'WEIRD: Sometimes becomes "benevolent" - heals instead of harms'
    ],
    emergentBehavior: 'DECAY'
  },

  {
    name: 'GHOST',
    params: {
      stealth: 9,
      mobility: 8,
      propagation: 4,
      aggression: 2,
      virulence: 3,
      mutation: 5,
      defense: 3,
      resilience: 4,
      replication: 4,
      synergy: 4
    },
    behavior: 'Invisible movement, avoids detection, strikes from shadows',
    quirks: [
      'Cannot be targeted directly',
      'Leaves no trail',
      'May "haunt" cells - scares without capturing',
      'WEIRD: Occasionally "possesses" enemy cells temporarily'
    ],
    emergentBehavior: 'HAUNTING'
  },

  {
    name: 'CHIMERA',
    params: {
      mutation: 9,
      synergy: 6,
      stealth: 6,
      mobility: 5,
      aggression: 4,
      virulence: 5,
      defense: 4,
      resilience: 5,
      propagation: 5,
      replication: 5
    },
    behavior: 'Constantly changes form and strategy',
    quirks: [
      'Parameters drift over time',
      'May "forget" original goal',
      'Becomes different archetype mid-battle',
      'WEIRD: Every 100 ticks, completely new personality emerges'
    ],
    emergentBehavior: 'METAMORPHOSIS'
  },

  {
    name: 'JUGGERNAUT',
    params: {
      aggression: 9,
      defense: 8,
      resilience: 7,
      propagation: 3,
      mobility: 2,
      virulence: 6,
      mutation: 3,
      stealth: 2,
      replication: 4,
      synergy: 4
    },
    behavior: 'Unstoppable force, slow but inevitable',
    quirks: [
      'Moves in straight lines, cannot turn easily',
      'Destroys everything in path',
      'Nearly unkillable but predictable',
      'WEIRD: Creates "craters" behind it that block spread'
    ],
    emergentBehavior: 'UNSTOPPABLE_FORCE'
  },

  {
    name: 'PARASITE',
    params: {
      synergy: 8,
      stealth: 7,
      replication: 6,
      aggression: 2,
      defense: 3,
      virulence: 3,
      mobility: 4,
      mutation: 5,
      resilience: 5,
      propagation: 5
    },
    behavior: 'Feeds off opponent, grows stronger as enemy grows',
    quirks: [
      'Dies if opponent dies',
      'May "love" enemy too much - refuses to kill',
      'Creates "symbiotic" relationships',
      'WEIRD: Sometimes "romances" enemy cells, creating "forbidden love" scenarios'
    ],
    emergentBehavior: 'SYMBIOSIS'
  },

  {
    name: 'NOMAD',
    params: {
      mobility: 10,
      propagation: 6,
      resilience: 6,
      aggression: 3,
      defense: 3,
      virulence: 4,
      mutation: 5,
      stealth: 5,
      replication: 5,
      synergy: 4
    },
    behavior: 'Never stays in one place, constant migration',
    quirks: [
      'Abandons territory constantly',
      'Creates "trails" of weak cells behind',
      'Impossible to pin down',
      'WEIRD: Occasionally forms "caravans" - long lines of moving cells'
    ],
    emergentBehavior: 'MIGRATION'
  }
];

/**
 * Get archetype by name
 */
export function getArchetype(name: string): AIArchetype | undefined {
  return AI_ARCHETYPES.find(a => a.name === name);
}

/**
 * Get random archetype
 */
export function getRandomArchetype(): AIArchetype {
  return AI_ARCHETYPES[Math.floor(Math.random() * AI_ARCHETYPES.length)];
}

/**
 * Get archetype based on parameter signature
 */
export function identifyArchetype(params: VirusParams): string {
  let bestMatch: AIArchetype | null = null;
  let bestScore = -1;

  for (const archetype of AI_ARCHETYPES) {
    let score = 0;
    const archetypeParams = archetype.params;

    for (const key in archetypeParams) {
      const paramKey = key as keyof VirusParams;
      const diff = Math.abs((params[paramKey] || 0) - (archetypeParams[paramKey] || 0));
      score -= diff; // Lower difference = higher score
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = archetype;
    }
  }

  return bestMatch?.name || 'HYBRID';
}

/**
 * Generate virus params from archetype
 */
export function generateParamsFromArchetype(archetypeName: string): VirusParams {
  const archetype = getArchetype(archetypeName);
  if (!archetype) {
    return {
      aggression: 5,
      virulence: 5,
      defense: 5,
      resilience: 5,
      propagation: 5,
      mobility: 5,
      mutation: 5,
      stealth: 5,
      replication: 5,
      synergy: 5,
      speed: 5,
      reproduction: 5,
      intellect: 5,
      contagiousness: 5,
      lethality: 5
    };
  }

  // Start with defaults
  const params: VirusParams = {
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

  // Apply archetype values
  Object.assign(params, archetype.params);

  return params;
}
