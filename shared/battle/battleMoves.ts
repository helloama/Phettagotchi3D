/**
 * PHETTAGOTCHI BATTLE MOVES
 * Stoner/Psychedelic themed Pokemon-style move system
 */

import { ElementType, ELEMENT_CONFIG } from './battleConfig.js';
import { PetType } from './petTypes.js';

// Move categories
export type MoveCategory = 'physical' | 'special' | 'status';

// Status effects
export type StatusEffect =
  | 'burned'      // DOT fire damage
  | 'soaked'      // Reduced speed
  | 'rooted'      // Can't flee
  | 'dazed'       // Reduced accuracy
  | 'enlightened' // Increased crit chance
  | 'mellow'      // Reduced attack but heals
  | 'vibing'      // Increased defense
  | 'stoned'      // Skip turn chance
  | 'blazed';     // Increased special attack

export interface StatusEffectData {
  name: string;
  description: string;
  duration: number; // turns
  damagePerTurn?: number;
  statModifier?: Partial<Record<'attack' | 'defense' | 'speed' | 'accuracy' | 'critRate', number>>;
  skipTurnChance?: number;
}

export const STATUS_EFFECTS: Record<StatusEffect, StatusEffectData> = {
  burned: {
    name: 'Burned',
    description: 'Taking fire damage each turn',
    duration: 3,
    damagePerTurn: 8,
    statModifier: { attack: -0.1 }
  },
  soaked: {
    name: 'Soaked',
    description: 'Movement slowed',
    duration: 3,
    statModifier: { speed: -0.3 }
  },
  rooted: {
    name: 'Rooted',
    description: 'Cannot flee from battle',
    duration: 4,
    statModifier: { speed: -0.2, defense: 0.1 }
  },
  dazed: {
    name: 'Dazed',
    description: 'Seeing stars...',
    duration: 2,
    statModifier: { accuracy: -0.25 }
  },
  enlightened: {
    name: 'Enlightened',
    description: '+30% crit chance, +10% accuracy. Your attacks hit harder and more reliably!',
    duration: 3,
    statModifier: { critRate: 0.3, accuracy: 0.1 }
  },
  mellow: {
    name: 'Mellow',
    description: 'Heals 5 HP/turn but -15% attack. Trade offense for sustainability.',
    duration: 4,
    damagePerTurn: -5, // Negative = healing
    statModifier: { attack: -0.15, defense: 0.1 }
  },
  vibing: {
    name: 'Vibing',
    description: '+25% defense, +10% speed. You\'re in the zone - harder to hit and moving faster!',
    duration: 3,
    statModifier: { defense: 0.25, speed: 0.1 }
  },
  stoned: {
    name: 'Stoned',
    description: 'Too baked to move sometimes',
    duration: 3,
    skipTurnChance: 0.25,
    statModifier: { defense: 0.2, speed: -0.2 }
  },
  blazed: {
    name: 'Blazed',
    description: 'Special powers amplified',
    duration: 3,
    statModifier: { attack: 0.3, defense: -0.1 }
  }
};

// Battle move definition
export interface BattleMove {
  id: string;
  name: string;
  description: string;
  category: MoveCategory;
  element: ElementType;
  power: number;         // 0 for status moves
  accuracy: number;      // 0-100
  critRate: number;      // Base crit chance (0-1)
  priority: number;      // Higher goes first (default 0)
  maxPp: number;         // Maximum Power Points (move uses)
  statusEffect?: {
    effect: StatusEffect;
    chance: number;      // 0-1
    target: 'self' | 'enemy';
  };
  healing?: number;      // Percentage of max HP to heal
  recoil?: number;       // Percentage of damage dealt as self-damage
  animation: 'attack' | 'special' | 'status';
  visualEffect?: string; // CSS class for visual effect
}

// Move instance with current PP tracking
export interface MoveInstance {
  move: BattleMove;
  currentPp: number;
}

// Create a move instance with full PP
export function createMoveInstance(move: BattleMove): MoveInstance {
  return { move, currentPp: move.maxPp };
}

// Create move instances for a pet
export function createMoveInstances(moves: BattleMove[]): MoveInstance[] {
  return moves.map(createMoveInstance);
}

// All battle moves
export const BATTLE_MOVES: Record<string, BattleMove> = {
  // ============================================
  // BASIC MOVES (All pets) - High PP
  // ============================================
  tackle: {
    id: 'tackle',
    name: 'Tackle',
    description: 'A basic body slam attack.',
    category: 'physical',
    element: 'earth',
    power: 40,
    accuracy: 100,
    critRate: 0.05,
    priority: 0,
    maxPp: 35,
    animation: 'attack'
  },
  scratch: {
    id: 'scratch',
    name: 'Scratch',
    description: 'Sharp claws or appendages swipe at the foe.',
    category: 'physical',
    element: 'air',
    power: 35,
    accuracy: 100,
    critRate: 0.1,
    priority: 0,
    maxPp: 35,
    animation: 'attack'
  },
  glare: {
    id: 'glare',
    name: 'Glare',
    description: 'An intimidating stare that might daze.',
    category: 'status',
    element: 'spirit',
    power: 0,
    accuracy: 90,
    critRate: 0,
    priority: 0,
    maxPp: 20,
    statusEffect: { effect: 'dazed', chance: 0.6, target: 'enemy' },
    animation: 'status'
  },
  rest: {
    id: 'rest',
    name: 'Rest',
    description: 'Take a breather and recover HP.',
    category: 'status',
    element: 'air',
    power: 0,
    accuracy: 100,
    critRate: 0,
    priority: -1,
    maxPp: 10,
    healing: 30,
    animation: 'status'
  },

  // ============================================
  // FIRE MOVES
  // ============================================
  emberBlast: {
    id: 'emberBlast',
    name: 'Ember Blast',
    description: 'A burst of flames engulfs the target.',
    category: 'special',
    element: 'fire',
    power: 55,
    accuracy: 95,
    critRate: 0.1,
    priority: 0,
    maxPp: 25,
    statusEffect: { effect: 'burned', chance: 0.2, target: 'enemy' },
    animation: 'special',
    visualEffect: 'fire-burst'
  },
  hotboxHaze: {
    id: 'hotboxHaze',
    name: 'Hotbox Haze',
    description: 'Fill the air with smoky fire. May stone the target.',
    category: 'special',
    element: 'fire',
    power: 45,
    accuracy: 85,
    critRate: 0.05,
    priority: 0,
    maxPp: 20,
    statusEffect: { effect: 'stoned', chance: 0.35, target: 'enemy' },
    animation: 'special',
    visualEffect: 'smoke-cloud'
  },
  blazeUp: {
    id: 'blazeUp',
    name: 'Blaze Up',
    description: 'Ignite your inner fire for massive power.',
    category: 'status',
    element: 'fire',
    power: 0,
    accuracy: 100,
    critRate: 0,
    priority: 0,
    maxPp: 15,
    statusEffect: { effect: 'blazed', chance: 1.0, target: 'self' },
    animation: 'status',
    visualEffect: 'power-up'
  },
  infernoRush: {
    id: 'infernoRush',
    name: 'Inferno Rush',
    description: 'An all-out blazing assault. Causes recoil.',
    category: 'physical',
    element: 'fire',
    power: 90,
    accuracy: 85,
    critRate: 0.15,
    priority: 0,
    maxPp: 8,
    recoil: 0.2,
    statusEffect: { effect: 'burned', chance: 0.3, target: 'enemy' },
    animation: 'attack',
    visualEffect: 'fire-rush'
  },

  // ============================================
  // WATER MOVES
  // ============================================
  splashWave: {
    id: 'splashWave',
    name: 'Splash Wave',
    description: 'A refreshing wave crashes into the target.',
    category: 'special',
    element: 'water',
    power: 50,
    accuracy: 100,
    critRate: 0.05,
    priority: 0,
    maxPp: 25,
    statusEffect: { effect: 'soaked', chance: 0.25, target: 'enemy' },
    animation: 'special',
    visualEffect: 'water-splash'
  },
  mellowTide: {
    id: 'mellowTide',
    name: 'Mellow Tide',
    description: 'Calming waters that heal over time.',
    category: 'status',
    element: 'water',
    power: 0,
    accuracy: 100,
    critRate: 0,
    priority: 0,
    maxPp: 10,
    statusEffect: { effect: 'mellow', chance: 1.0, target: 'self' },
    animation: 'status',
    visualEffect: 'healing-wave'
  },
  tidalCrush: {
    id: 'tidalCrush',
    name: 'Tidal Crush',
    description: 'A massive wave that overwhelms the target.',
    category: 'special',
    element: 'water',
    power: 65,
    accuracy: 75,
    critRate: 0.1,
    priority: 0,
    maxPp: 8,
    statusEffect: { effect: 'soaked', chance: 0.3, target: 'enemy' },
    animation: 'special',
    visualEffect: 'tidal-wave'
  },
  drenchSoak: {
    id: 'drenchSoak',
    name: 'Drench & Soak',
    description: 'Completely douse the enemy, slowing them.',
    category: 'status',
    element: 'water',
    power: 0,
    accuracy: 95,
    critRate: 0,
    priority: 1,
    maxPp: 15,
    statusEffect: { effect: 'soaked', chance: 1.0, target: 'enemy' },
    animation: 'status'
  },

  // ============================================
  // EARTH MOVES
  // ============================================
  rootSlam: {
    id: 'rootSlam',
    name: 'Root Slam',
    description: 'Vines and roots strike from below.',
    category: 'physical',
    element: 'earth',
    power: 55,
    accuracy: 90,
    critRate: 0.1,
    priority: 0,
    maxPp: 20,
    statusEffect: { effect: 'rooted', chance: 0.2, target: 'enemy' },
    animation: 'attack',
    visualEffect: 'root-attack'
  },
  earthenGuard: {
    id: 'earthenGuard',
    name: 'Earthen Guard',
    description: 'Encase yourself in protective earth.',
    category: 'status',
    element: 'earth',
    power: 0,
    accuracy: 100,
    critRate: 0,
    priority: 0,
    maxPp: 15,
    statusEffect: { effect: 'vibing', chance: 1.0, target: 'self' },
    animation: 'status',
    visualEffect: 'earth-shield'
  },
  boulderBash: {
    id: 'boulderBash',
    name: 'Boulder Bash',
    description: 'Hurl a massive rock at the enemy.',
    category: 'physical',
    element: 'earth',
    power: 80,
    accuracy: 75,
    critRate: 0.15,
    priority: -1,
    maxPp: 10,
    animation: 'attack',
    visualEffect: 'rock-throw'
  },
  naturesBind: {
    id: 'naturesBind',
    name: "Nature's Bind",
    description: 'Trap the enemy in living vines.',
    category: 'status',
    element: 'earth',
    power: 0,
    accuracy: 85,
    critRate: 0,
    priority: 0,
    maxPp: 15,
    statusEffect: { effect: 'rooted', chance: 1.0, target: 'enemy' },
    animation: 'status',
    visualEffect: 'vine-trap'
  },

  // ============================================
  // AIR MOVES
  // ============================================
  gustSlash: {
    id: 'gustSlash',
    name: 'Gust Slash',
    description: 'Sharp wind blades cut through the air.',
    category: 'special',
    element: 'air',
    power: 50,
    accuracy: 95,
    critRate: 0.15,
    priority: 1,
    maxPp: 25,
    animation: 'special',
    visualEffect: 'wind-slash'
  },
  cloudNine: {
    id: 'cloudNine',
    name: 'Cloud Nine',
    description: 'Float on clouds, entering a chill state.',
    category: 'status',
    element: 'air',
    power: 0,
    accuracy: 100,
    critRate: 0,
    priority: 0,
    maxPp: 10,
    statusEffect: { effect: 'mellow', chance: 1.0, target: 'self' },
    healing: 15,
    animation: 'status',
    visualEffect: 'cloud-float'
  },
  tornadoSpin: {
    id: 'tornadoSpin',
    name: 'Tornado Spin',
    description: 'Become a whirlwind of destruction.',
    category: 'physical',
    element: 'air',
    power: 75,
    accuracy: 85,
    critRate: 0.1,
    priority: 0,
    maxPp: 12,
    statusEffect: { effect: 'dazed', chance: 0.3, target: 'enemy' },
    animation: 'attack',
    visualEffect: 'tornado'
  },
  zephyrDash: {
    id: 'zephyrDash',
    name: 'Zephyr Dash',
    description: 'Lightning-fast wind attack. Always goes first.',
    category: 'physical',
    element: 'air',
    power: 40,
    accuracy: 100,
    critRate: 0.2,
    priority: 2,
    maxPp: 20,
    animation: 'attack',
    visualEffect: 'speed-lines'
  },

  // ============================================
  // SPIRIT MOVES
  // ============================================
  cosmicBeam: {
    id: 'cosmicBeam',
    name: 'Cosmic Beam',
    description: 'Channel the energy of the cosmos.',
    category: 'special',
    element: 'spirit',
    power: 70,
    accuracy: 90,
    critRate: 0.15,
    priority: 0,
    maxPp: 15,
    animation: 'special',
    visualEffect: 'cosmic-ray'
  },
  thirdEye: {
    id: 'thirdEye',
    name: 'Third Eye',
    description: 'Open your mind to enlightenment.',
    category: 'status',
    element: 'spirit',
    power: 0,
    accuracy: 100,
    critRate: 0,
    priority: 0,
    maxPp: 15,
    statusEffect: { effect: 'enlightened', chance: 1.0, target: 'self' },
    animation: 'status',
    visualEffect: 'eye-glow'
  },
  astralPunch: {
    id: 'astralPunch',
    name: 'Astral Punch',
    description: 'Strike with otherworldly force.',
    category: 'physical',
    element: 'spirit',
    power: 65,
    accuracy: 95,
    critRate: 0.2,
    priority: 0,
    maxPp: 20,
    animation: 'attack',
    visualEffect: 'spirit-fist'
  },
  dimensionRift: {
    id: 'dimensionRift',
    name: 'Dimension Rift',
    description: 'Tear reality. Devastating but inaccurate.',
    category: 'special',
    element: 'spirit',
    power: 110,
    accuracy: 65,
    critRate: 0.25,
    priority: -1,
    maxPp: 5,
    recoil: 0.15,
    animation: 'special',
    visualEffect: 'reality-tear'
  },
  vibeCheck: {
    id: 'vibeCheck',
    name: 'Vibe Check',
    description: 'Judge the enemys vibes. High crit if theyre not chill.',
    category: 'physical',
    element: 'spirit',
    power: 45,
    accuracy: 100,
    critRate: 0.35,
    priority: 0,
    maxPp: 20,
    animation: 'attack',
    visualEffect: 'vibe-wave'
  }
};

// Pet element mapping based on pet type characteristics
export const PET_ELEMENTS: Record<PetType, ElementType> = {
  cutephetta: 'spirit',
  lovebug: 'air',
  meep: 'earth',
  virubug: 'water',
  pizzalotl: 'fire',
  alienfella: 'spirit',
  blufella: 'water',
  bubblegum: 'air',
  droosippy: 'water',
  griffin: 'air',
  metarabbit: 'spirit',
  multicoloredblob: 'spirit',
  nature: 'earth',
  pinkfella: 'spirit',
  punkrockbee: 'air',
  punkrocksqurrield: 'earth',
  redfox: 'fire',
  sippydroo: 'water',
  sparky: 'fire',
  toonely: 'spirit',
  tullo: 'spirit',
  wires: 'air',
  // New pets
  cuney: 'spirit',
  lucy: 'spirit',
  karaokerobot: 'fire',
  slotmachine: 'earth',
  // NPC pets
  twolegrobot: 'air',
  antman: 'earth',
  chessnpc: 'spirit',
  acecat: 'air',
  bigsnail: 'water',
  bobau: 'water',
  borgorrabbit: 'fire',
  deity: 'spirit',
  fishsmokes: 'water',
  mrsanta: 'spirit',
  crab: 'water',
  wassie: 'water',
  slotmachinehjones: 'spirit',
  snail: 'earth',
  toonlighthouse: 'fire',
  toonpizza: 'fire',
  // Sprite-only pets
  catrussel: 'fire',
  mrphish: 'water',
  alhu: 'spirit',
  alienspaceship: 'air',
  borgormachine: 'earth',
  chef: 'fire',
  fishbones: 'water',
  newphetta: 'spirit',
  solar: 'fire',
  zwist: 'spirit',
  scientest: 'water',
  streamfella: 'air',
  shinydragon: 'fire'
};

// Pet moveset - which moves each pet can learn
export const PET_MOVESETS: Record<PetType, string[]> = {
  cutephetta: ['tackle', 'cosmicBeam', 'thirdEye', 'vibeCheck'],
  lovebug: ['scratch', 'gustSlash', 'cloudNine', 'zephyrDash'],
  meep: ['tackle', 'rootSlam', 'earthenGuard', 'boulderBash'],
  virubug: ['scratch', 'splashWave', 'drenchSoak', 'tidalCrush'],
  pizzalotl: ['tackle', 'emberBlast', 'hotboxHaze', 'infernoRush'],
  alienfella: ['glare', 'cosmicBeam', 'dimensionRift', 'astralPunch'],
  blufella: ['tackle', 'splashWave', 'mellowTide', 'tidalCrush'],
  bubblegum: ['scratch', 'gustSlash', 'cloudNine', 'tornadoSpin'],
  droosippy: ['rest', 'splashWave', 'mellowTide', 'drenchSoak'],
  griffin: ['scratch', 'gustSlash', 'tornadoSpin', 'zephyrDash'],
  metarabbit: ['tackle', 'astralPunch', 'thirdEye', 'dimensionRift'],
  multicoloredblob: ['rest', 'cosmicBeam', 'vibeCheck', 'thirdEye'],
  nature: ['rest', 'rootSlam', 'earthenGuard', 'naturesBind'],
  pinkfella: ['glare', 'cosmicBeam', 'cloudNine', 'vibeCheck'],
  punkrockbee: ['scratch', 'gustSlash', 'zephyrDash', 'tornadoSpin'],
  punkrocksqurrield: ['tackle', 'rootSlam', 'boulderBash', 'earthenGuard'],
  redfox: ['scratch', 'emberBlast', 'blazeUp', 'infernoRush'],
  sippydroo: ['rest', 'splashWave', 'mellowTide', 'tidalCrush'],
  sparky: ['tackle', 'emberBlast', 'hotboxHaze', 'blazeUp'],
  toonely: ['glare', 'cosmicBeam', 'astralPunch', 'vibeCheck'],
  tullo: ['rest', 'cosmicBeam', 'thirdEye', 'dimensionRift'],
  wires: ['scratch', 'gustSlash', 'zephyrDash', 'glare'],
  // New pets
  cuney: ['tackle', 'cosmicBeam', 'vibeCheck', 'cloudNine'],
  lucy: ['glare', 'cosmicBeam', 'thirdEye', 'astralPunch'],
  karaokerobot: ['scratch', 'emberBlast', 'infernoRush', 'hotboxHaze'],
  slotmachine: ['tackle', 'boulderBash', 'earthenGuard', 'rootSlam'],
  // NPC pets
  twolegrobot: ['scratch', 'gustSlash', 'zephyrDash', 'tornadoSpin'],
  antman: ['tackle', 'rootSlam', 'boulderBash', 'earthenGuard'],
  chessnpc: ['glare', 'cosmicBeam', 'thirdEye', 'vibeCheck'],
  acecat: ['scratch', 'gustSlash', 'zephyrDash', 'cloudNine'],
  bigsnail: ['rest', 'splashWave', 'mellowTide', 'earthenGuard'],
  bobau: ['rest', 'splashWave', 'mellowTide', 'drenchSoak'],
  borgorrabbit: ['tackle', 'emberBlast', 'hotboxHaze', 'blazeUp'],
  deity: ['glare', 'cosmicBeam', 'dimensionRift', 'thirdEye'],
  fishsmokes: ['scratch', 'splashWave', 'hotboxHaze', 'drenchSoak'],
  mrsanta: ['rest', 'cosmicBeam', 'vibeCheck', 'cloudNine'],
  crab: ['tackle', 'splashWave', 'earthenGuard', 'tidalCrush'],
  wassie: ['tackle', 'splashWave', 'mellowTide', 'tidalCrush'],
  slotmachinehjones: ['glare', 'cosmicBeam', 'vibeCheck', 'dimensionRift'],
  snail: ['rest', 'rootSlam', 'earthenGuard', 'mellowTide'],
  toonlighthouse: ['glare', 'emberBlast', 'blazeUp', 'cosmicBeam'],
  toonpizza: ['tackle', 'emberBlast', 'hotboxHaze', 'infernoRush'],
  // Sprite-only pets
  catrussel: ['scratch', 'emberBlast', 'blazeUp', 'infernoRush'],
  mrphish: ['tackle', 'splashWave', 'mellowTide', 'tidalCrush'],
  alhu: ['glare', 'cosmicBeam', 'thirdEye', 'vibeCheck'],
  alienspaceship: ['scratch', 'gustSlash', 'zephyrDash', 'tornadoSpin'],
  borgormachine: ['tackle', 'boulderBash', 'earthenGuard', 'rootSlam'],
  chef: ['tackle', 'emberBlast', 'hotboxHaze', 'blazeUp'],
  fishbones: ['rest', 'splashWave', 'drenchSoak', 'tidalCrush'],
  newphetta: ['glare', 'cosmicBeam', 'astralPunch', 'dimensionRift'],
  solar: ['scratch', 'emberBlast', 'blazeUp', 'infernoRush'],
  zwist: ['glare', 'cosmicBeam', 'thirdEye', 'dimensionRift'],
  scientest: ['rest', 'splashWave', 'mellowTide', 'drenchSoak'],
  streamfella: ['scratch', 'gustSlash', 'cloudNine', 'zephyrDash'],
  shinydragon: ['scratch', 'emberBlast', 'infernoRush', 'blazeUp']
};

// Get element effectiveness multiplier
export function getTypeEffectiveness(attackElement: ElementType, defenderElement: ElementType): number {
  const config = ELEMENT_CONFIG[attackElement];

  if (config.strong === defenderElement) {
    return 1.5; // Super effective
  } else if (config.weak === defenderElement) {
    return 0.75; // Not very effective
  }
  return 1.0; // Neutral
}

// Get a pet's moves
export function getPetMoves(petType: PetType): BattleMove[] {
  const moveIds = PET_MOVESETS[petType];
  if (!moveIds) {
    console.warn(`[battleMoves] Missing moveset for pet type: ${petType}, using defaults`);
    return [BATTLE_MOVES.tackle, BATTLE_MOVES.scratch, BATTLE_MOVES.glare, BATTLE_MOVES.rest];
  }
  const moves = moveIds.map(id => {
    const move = BATTLE_MOVES[id];
    if (!move) {
      console.error(`[battleMoves] Move not found: ${id}`);
    }
    return move;
  }).filter(Boolean);
  
  if (moves.length === 0) {
    console.error(`[battleMoves] All moves invalid for pet: ${petType}, using defaults`);
    return [BATTLE_MOVES.tackle, BATTLE_MOVES.scratch, BATTLE_MOVES.glare, BATTLE_MOVES.rest];
  }
  return moves;
}

// Get a pet's element
export function getPetElement(petType: PetType): ElementType {
  const element = PET_ELEMENTS[petType];
  if (!element) {
    console.warn(`[battleMoves] Missing element for pet type: ${petType}, defaulting to spirit`);
    return 'spirit';
  }
  return element;
}

// Get all moves of a specific element
export function getMovesByElement(element: ElementType): BattleMove[] {
  return Object.values(BATTLE_MOVES).filter(move => move.element === element);
}

// Get move by ID
export function getMoveById(moveId: string): BattleMove | undefined {
  return BATTLE_MOVES[moveId];
}
