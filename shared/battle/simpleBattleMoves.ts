/**
 * Simplified Battle Moves for 3D VRM Battles
 * Contains only the pets we have VRM models for
 */

import { ElementType, ELEMENT_CONFIG } from './battleConfig.js';
import { PetType } from './petTypes.js';

// Move categories
export type MoveCategory = 'physical' | 'special' | 'status';

// Status effects
export type StatusEffect =
  | 'burned' | 'soaked' | 'rooted' | 'dazed' | 'enlightened'
  | 'mellow' | 'vibing' | 'stoned' | 'blazed';

export interface StatusEffectData {
  name: string;
  description: string;
  duration: number;
  damagePerTurn?: number;
  statModifier?: Partial<Record<'attack' | 'defense' | 'speed' | 'accuracy' | 'critRate', number>>;
  skipTurnChance?: number;
}

export const STATUS_EFFECTS: Record<StatusEffect, StatusEffectData> = {
  burned: { name: 'Burned', description: 'Fire damage', duration: 3, damagePerTurn: 8, statModifier: { attack: -0.1 } },
  soaked: { name: 'Soaked', description: 'Slowed', duration: 3, statModifier: { speed: -0.3 } },
  rooted: { name: 'Rooted', description: 'Cannot flee', duration: 4, statModifier: { speed: -0.2, defense: 0.1 } },
  dazed: { name: 'Dazed', description: 'Low accuracy', duration: 2, statModifier: { accuracy: -0.25 } },
  enlightened: { name: 'Enlightened', description: 'High crit', duration: 3, statModifier: { critRate: 0.3, accuracy: 0.1 } },
  mellow: { name: 'Mellow', description: 'Healing', duration: 4, damagePerTurn: -5, statModifier: { attack: -0.15 } },
  vibing: { name: 'Vibing', description: 'Boosted defense', duration: 3, statModifier: { defense: 0.25, speed: 0.1 } },
  stoned: { name: 'Stoned', description: 'Sometimes skip', duration: 3, skipTurnChance: 0.25 },
  blazed: { name: 'Blazed', description: 'Power up', duration: 3, statModifier: { attack: 0.3 } }
};

// Battle move definition
export interface BattleMove {
  id: string;
  name: string;
  description: string;
  category: MoveCategory;
  element: ElementType;
  power: number;
  accuracy: number;
  critRate: number;
  priority: number;
  maxPp: number;
  statusEffect?: { effect: StatusEffect; chance: number; target: 'self' | 'enemy' };
  healing?: number;
  recoil?: number;
  animation: 'attack' | 'special' | 'status';
}

export interface MoveInstance {
  move: BattleMove;
  currentPp: number;
}

export function createMoveInstance(move: BattleMove): MoveInstance {
  return { move, currentPp: move.maxPp };
}

export function createMoveInstances(moves: BattleMove[]): MoveInstance[] {
  return moves.map(createMoveInstance);
}

// Basic moves
export const BATTLE_MOVES: Record<string, BattleMove> = {
  tackle: { id: 'tackle', name: 'Tackle', description: 'Basic attack', category: 'physical', element: 'earth', power: 40, accuracy: 100, critRate: 0.05, priority: 0, maxPp: 35, animation: 'attack' },
  scratch: { id: 'scratch', name: 'Scratch', description: 'Sharp claws', category: 'physical', element: 'air', power: 35, accuracy: 100, critRate: 0.1, priority: 0, maxPp: 35, animation: 'attack' },
  emberBlast: { id: 'emberBlast', name: 'Ember Blast', description: 'Fire attack', category: 'special', element: 'fire', power: 55, accuracy: 95, critRate: 0.1, priority: 0, maxPp: 25, statusEffect: { effect: 'burned', chance: 0.2, target: 'enemy' }, animation: 'special' },
  splashWave: { id: 'splashWave', name: 'Splash Wave', description: 'Water attack', category: 'special', element: 'water', power: 50, accuracy: 100, critRate: 0.05, priority: 0, maxPp: 25, statusEffect: { effect: 'soaked', chance: 0.25, target: 'enemy' }, animation: 'special' },
  rootSlam: { id: 'rootSlam', name: 'Root Slam', description: 'Earth attack', category: 'physical', element: 'earth', power: 55, accuracy: 90, critRate: 0.1, priority: 0, maxPp: 20, statusEffect: { effect: 'rooted', chance: 0.2, target: 'enemy' }, animation: 'attack' },
  gustSlash: { id: 'gustSlash', name: 'Gust Slash', description: 'Air attack', category: 'special', element: 'air', power: 50, accuracy: 95, critRate: 0.15, priority: 1, maxPp: 25, animation: 'special' },
  cosmicBeam: { id: 'cosmicBeam', name: 'Cosmic Beam', description: 'Spirit attack', category: 'special', element: 'spirit', power: 70, accuracy: 90, critRate: 0.15, priority: 0, maxPp: 15, animation: 'special' },
};

// Pet element mapping
export const PET_ELEMENTS: Record<PetType, ElementType> = {
  cutephetta: 'spirit',
  lovebug: 'air',
  meep: 'earth',
  pizzalotl: 'fire',
  alienfella: 'spirit',
  redfox: 'fire',
  griffin: 'air',
  sparky: 'fire',
  cat: 'earth',
  dog: 'earth',
  wolf: 'air',
};

// Pet movesets
export const PET_MOVESETS: Record<PetType, string[]> = {
  cutephetta: ['tackle', 'cosmicBeam', 'scratch', 'emberBlast'],
  lovebug: ['scratch', 'gustSlash', 'tackle', 'splashWave'],
  meep: ['tackle', 'rootSlam', 'scratch', 'emberBlast'],
  pizzalotl: ['tackle', 'emberBlast', 'scratch', 'cosmicBeam'],
  alienfella: ['cosmicBeam', 'gustSlash', 'tackle', 'emberBlast'],
  redfox: ['scratch', 'emberBlast', 'tackle', 'splashWave'],
  griffin: ['gustSlash', 'cosmicBeam', 'scratch', 'emberBlast'],
  sparky: ['tackle', 'emberBlast', 'cosmicBeam', 'gustSlash'],
  cat: ['scratch', 'tackle', 'gustSlash', 'rootSlam'],
  dog: ['tackle', 'rootSlam', 'scratch', 'gustSlash'],
  wolf: ['scratch', 'gustSlash', 'tackle', 'cosmicBeam'],
};

export function getTypeEffectiveness(attackElement: ElementType, defenderElement: ElementType): number {
  const config = ELEMENT_CONFIG[attackElement];
  if (config.strong === defenderElement) return 1.5;
  if (config.weak === defenderElement) return 0.75;
  return 1.0;
}

export function getPetMoves(petType: PetType): BattleMove[] {
  const moveIds = PET_MOVESETS[petType] || ['tackle', 'scratch', 'emberBlast', 'cosmicBeam'];
  return moveIds.map(id => BATTLE_MOVES[id]).filter(Boolean);
}

export function getPetElement(petType: PetType): ElementType {
  return PET_ELEMENTS[petType] || 'spirit';
}

export function getMoveById(moveId: string): BattleMove | undefined {
  return BATTLE_MOVES[moveId];
}
