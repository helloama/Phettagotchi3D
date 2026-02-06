/**
 * PHETTAGOTCHI BATTLE ENGINE
 * Core combat mechanics and turn-based battle logic
 */

import { PetType, PET_NAMES, ElementType } from './battleConfig.js';
import {
  BattleMove,
  MoveInstance,
  StatusEffect,
  StatusEffectData,
  STATUS_EFFECTS,
  BATTLE_MOVES,
  getPetMoves,
  getPetElement,
  getTypeEffectiveness,
  getMoveById,
  createMoveInstances
} from './simpleBattleMoves.js';

// Simplified types for 3D battles (no traits/evolution yet)
export interface PetTraits {
  energy: number;
  mood: number;
  intelligence: number;
  luck: number;
  aggression: number;
  resilience: number;
}

export type EvolutionStage = 'baby' | 'teen' | 'adult' | 'elder';

export const EVOLUTION_CONFIG: Record<EvolutionStage, { name: string; statBonus: number }> = {
  baby: { name: 'Baby', statBonus: 0 },
  teen: { name: 'Teen', statBonus: 5 },
  adult: { name: 'Adult', statBonus: 10 },
  elder: { name: 'Elder', statBonus: 15 },
};

export function getEvolutionStage(level: number): EvolutionStage {
  if (level >= 45) return 'elder';
  if (level >= 30) return 'adult';
  if (level >= 15) return 'teen';
  return 'baby';
}

// Legendary pets for now
const LEGENDARY_PETS = new Set<PetType>(['griffin', 'wolf']);

// ============================================
// TYPES
// ============================================

export interface BattlerStats {
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  accuracy: number;
  critRate: number;
}

export interface ActiveStatus {
  effect: StatusEffect;
  data: StatusEffectData;
  turnsRemaining: number;
}

export interface Battler {
  id: string;
  name: string;
  petType: PetType;
  element: ElementType;
  level: number;
  stats: BattlerStats;
  moves: MoveInstance[];
  activeStatuses: ActiveStatus[];
  isPlayer: boolean;
  isNpc: boolean;
}

export interface BattleAction {
  type: 'move' | 'flee';
  moveId?: string;
  battlerId: string;
}

export type BattleEventType =
  | 'battle_start' | 'turn_start' | 'move_select' | 'move_execute'
  | 'damage_dealt' | 'heal' | 'status_applied' | 'status_removed' | 'status_tick'
  | 'miss' | 'critical' | 'type_effective' | 'type_weak'
  | 'faint' | 'victory' | 'defeat' | 'flee_success' | 'flee_fail';

export interface BattleEvent {
  type: BattleEventType;
  battlerId?: string;
  targetId?: string;
  moveId?: string;
  damage?: number;
  healing?: number;
  status?: StatusEffect;
  message: string;
  isCritical?: boolean;
  effectiveness?: 'super' | 'weak' | 'normal';
}

export interface BattleState {
  id: string;
  player: Battler;
  opponent: Battler;
  turn: number;
  phase: 'intro' | 'select' | 'execute' | 'end';
  events: BattleEvent[];
  winner: 'player' | 'opponent' | null;
  canFlee: boolean;
}

export interface BattleSummary {
  won: boolean;
  xpGained: number;
  coinsGained: number;
  opponentName: string;
  opponentLevel: number;
  turnsPlayed: number;
  damageDealt: number;
  damageTaken: number;
}

// ============================================
// CONSTANTS
// ============================================

const MIN_LEVEL = 1;
const MAX_LEVEL = 50;
const MIN_DAMAGE = 1;
const BASE_XP = 75; // Increased from 50 for more rewarding battles
const BASE_COINS = 15; // Coins per battle win
const MAX_FLEE_CHANCE = 0.95;

// NPC name generators
const NPC_PREFIXES = ['Chill', 'Groovy', 'Mellow', 'Trippy', 'Cosmic', 'Dank', 'Hazy', 'Blazed', 'Vibin', 'Lifted'];
const NPC_SUFFIXES = ['Dude', 'Bro', 'Homie', 'Wanderer', 'Tripper', 'Dreamer', 'Floater', 'Chiller', 'Seeker', 'Spirit'];

// ============================================
// UTILITIES
// ============================================

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(random(min, max + 1));
}

function chance(probability: number): boolean {
  return Math.random() < probability;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Deep clone a battler to avoid mutation issues
function cloneBattler(battler: Battler): Battler {
  return {
    ...battler,
    stats: { ...battler.stats },
    moves: battler.moves.map(m => ({ ...m })),
    activeStatuses: battler.activeStatuses.map(s => ({ ...s, data: { ...s.data } }))
  };
}

// Deep clone battle state
function cloneBattleState(state: BattleState): BattleState {
  return {
    ...state,
    player: cloneBattler(state.player),
    opponent: cloneBattler(state.opponent),
    events: [] // Fresh events array for this turn
  };
}

// ============================================
// STAT CALCULATIONS
// ============================================

// Trait influence multiplier (5% = 0.05)
const TRAIT_INFLUENCE = 0.05;

// Convert trait value (1-100) to a modifier (-0.05 to +0.05)
// Trait 50 = no change, Trait 100 = +5%, Trait 1 = -5%
function getTraitModifier(traitValue: number): number {
  return ((traitValue - 50) / 50) * TRAIT_INFLUENCE;
}

function calculateStats(level: number, petType: PetType, traits?: PetTraits): BattlerStats {
  const safeLevel = clamp(level, MIN_LEVEL, MAX_LEVEL);
  const hash = petType.charCodeAt(0) + petType.charCodeAt(petType.length - 1);

  // Base stats vary by pet type hash for variety
  let hp = Math.floor(40 + (hash % 20) + safeLevel * (5 + (hash % 3)));
  let attack = Math.floor(10 + (hash % 8) + safeLevel * (1.5 + (hash % 2) * 0.3));
  let defense = Math.floor(8 + ((hash * 3) % 6) + safeLevel * (1.2 + ((hash * 2) % 2) * 0.2));
  let speed = Math.floor(8 + ((hash * 7) % 10) + safeLevel * (1 + ((hash * 5) % 3) * 0.2));
  let accuracy = 100;
  let critRate = 0.05;

  // Apply trait modifiers (5% influence max)
  if (traits) {
    // Energy → Speed bonus
    speed = Math.floor(speed * (1 + getTraitModifier(traits.energy)));
    
    // Intelligence → Accuracy bonus
    accuracy = Math.floor(accuracy * (1 + getTraitModifier(traits.intelligence)));
    
    // Luck → Crit rate bonus (additive, not multiplicative)
    critRate = critRate + (getTraitModifier(traits.luck) * 0.5); // Max +2.5% crit
    
    // Aggression → Attack bonus, but reduces defense
    const aggressionMod = getTraitModifier(traits.aggression);
    attack = Math.floor(attack * (1 + aggressionMod));
    defense = Math.floor(defense * (1 - aggressionMod * 0.5)); // Half penalty to defense
    
    // Resilience → Defense and HP bonus
    const resilienceMod = getTraitModifier(traits.resilience);
    defense = Math.floor(defense * (1 + resilienceMod));
    hp = Math.floor(hp * (1 + resilienceMod * 0.5)); // Half bonus to HP
  }

  // Apply evolution stage bonus (5-15% bonus at higher stages)
  const evolutionStage = getEvolutionStage(safeLevel);
  const evolutionBonus = EVOLUTION_CONFIG[evolutionStage].statBonus / 100;
  if (evolutionBonus > 0) {
    hp = Math.floor(hp * (1 + evolutionBonus));
    attack = Math.floor(attack * (1 + evolutionBonus));
    defense = Math.floor(defense * (1 + evolutionBonus));
    speed = Math.floor(speed * (1 + evolutionBonus));
  }

  return { maxHp: hp, hp, attack, defense, speed, accuracy, critRate };
}

function getEffectiveStat(battler: Battler, stat: keyof BattlerStats): number {
  let value = battler.stats[stat];

  for (const status of battler.activeStatuses) {
    const mod = status.data.statModifier;
    if (mod && stat in mod) {
      value *= 1 + (mod[stat as keyof typeof mod] || 0);
    }
  }

  return Math.max(1, Math.floor(value));
}

// ============================================
// BATTLER CREATION
// ============================================

export function createBattler(
  petType: PetType,
  level: number,
  isPlayer: boolean,
  isNpc: boolean = false,
  customName?: string,
  traits?: PetTraits
): Battler {
  const safeLevel = clamp(level, MIN_LEVEL, MAX_LEVEL);
  
  return {
    id: generateId(isPlayer ? 'player' : 'opponent'),
    name: customName || PET_NAMES[petType],
    petType,
    element: getPetElement(petType),
    level: safeLevel,
    stats: calculateStats(safeLevel, petType, traits),
    moves: createMoveInstances(getPetMoves(petType)),
    activeStatuses: [],
    isPlayer,
    isNpc
  };
}

export function generateNpcOpponent(playerLevel: number, difficulty: 'easy' | 'normal' | 'hard' = 'normal'): Battler {
  const ALL_PET_TYPES = Object.keys(PET_NAMES) as PetType[];

  // Legendary pets only appear 5% of the time (and only on hard difficulty or high level)
  const canEncounterLegendary = difficulty === 'hard' || playerLevel >= 10;
  const legendaryRoll = Math.random() < 0.05 && canEncounterLegendary;

  let randomPetType: PetType;
  if (legendaryRoll) {
    // Pick from legendary pets
    const legendaryList = ALL_PET_TYPES.filter(t => LEGENDARY_PETS.has(t));
    randomPetType = legendaryList[randomInt(0, legendaryList.length - 1)];
  } else {
    // Pick from non-legendary pets
    const commonList = ALL_PET_TYPES.filter(t => !LEGENDARY_PETS.has(t));
    randomPetType = commonList[randomInt(0, commonList.length - 1)];
  }

  const levelMod = { easy: randomInt(-3, 0), normal: randomInt(-1, 2), hard: randomInt(1, 4) }[difficulty];
  const npcLevel = clamp(playerLevel + levelMod, MIN_LEVEL, MAX_LEVEL);
  const npcName = `${NPC_PREFIXES[randomInt(0, NPC_PREFIXES.length - 1)]} ${NPC_SUFFIXES[randomInt(0, NPC_SUFFIXES.length - 1)]}`;

  return createBattler(randomPetType, npcLevel, false, true, npcName);
}

// ============================================
// BATTLE INITIALIZATION
// ============================================

export function initializeBattle(player: Battler, opponent: Battler): BattleState {
  return {
    id: generateId('battle'),
    player: { ...player, activeStatuses: [] },
    opponent: { ...opponent, activeStatuses: [] },
    turn: 1,
    phase: 'intro',
    events: [{ type: 'battle_start', message: `A wild ${opponent.name} appeared!` }],
    winner: null,
    canFlee: opponent.isNpc
  };
}

// ============================================
// DAMAGE & ACCURACY
// ============================================

function calculateDamage(
  attacker: Battler,
  defender: Battler,
  move: BattleMove
): { damage: number; isCritical: boolean; effectiveness: 'super' | 'weak' | 'normal' } {
  const atkStat = getEffectiveStat(attacker, 'attack') * (move.category === 'special' ? 1.1 : 1);
  const defStat = getEffectiveStat(defender, 'defense');
  const levelFactor = (2 * attacker.level / 5) + 2;

  let damage = ((levelFactor * move.power * (atkStat / defStat)) / 50) + 2;

  // Type effectiveness
  const typeMultiplier = getTypeEffectiveness(move.element, defender.element);
  damage *= typeMultiplier;

  // STAB bonus
  if (move.element === attacker.element) damage *= 1.2;

  // Critical hit
  const critChance = getEffectiveStat(attacker, 'critRate') + move.critRate;
  const isCritical = chance(critChance);
  if (isCritical) damage *= 1.5;

  // Variance 85-100%
  damage *= random(0.85, 1.0);
  damage = Math.max(MIN_DAMAGE, Math.floor(damage));

  const effectiveness = typeMultiplier > 1 ? 'super' : typeMultiplier < 1 ? 'weak' : 'normal';
  return { damage, isCritical, effectiveness };
}

function checkAccuracy(attacker: Battler, move: BattleMove): boolean {
  const accuracy = (move.accuracy * getEffectiveStat(attacker, 'accuracy')) / 100;
  return chance(accuracy / 100);
}

// ============================================
// STATUS EFFECTS
// ============================================

function applyStatus(target: Battler, effect: StatusEffect, events: BattleEvent[]): void {
  const existing = target.activeStatuses.find(s => s.effect === effect);
  if (existing) {
    existing.turnsRemaining = STATUS_EFFECTS[effect].duration;
    return;
  }

  const data = STATUS_EFFECTS[effect];
  target.activeStatuses.push({ effect, data, turnsRemaining: data.duration });
  events.push({ type: 'status_applied', battlerId: target.id, status: effect, message: `${target.name} is now ${data.name.toLowerCase()}!` });
}

function processStatusEffects(battler: Battler, events: BattleEvent[]): boolean {
  let canAct = true;

  for (const status of battler.activeStatuses) {
    const { damagePerTurn, skipTurnChance, name } = status.data;

    if (damagePerTurn) {
      const amount = Math.abs(damagePerTurn);
      if (damagePerTurn > 0) {
        battler.stats.hp = Math.max(0, battler.stats.hp - amount);
        events.push({ type: 'status_tick', battlerId: battler.id, damage: amount, status: status.effect, message: `${battler.name} took ${amount} damage from ${name}!` });
      } else {
        battler.stats.hp = Math.min(battler.stats.maxHp, battler.stats.hp + amount);
        events.push({ type: 'status_tick', battlerId: battler.id, healing: amount, status: status.effect, message: `${battler.name} recovered ${amount} HP from ${name}!` });
      }
    }

    if (skipTurnChance && chance(skipTurnChance)) {
      canAct = false;
      events.push({ type: 'status_tick', battlerId: battler.id, status: status.effect, message: `${battler.name} is too ${name.toLowerCase()} to move!` });
    }

    status.turnsRemaining--;
  }

  // Remove expired
  const expired = battler.activeStatuses.filter(s => s.turnsRemaining <= 0);
  for (const s of expired) {
    events.push({ type: 'status_removed', battlerId: battler.id, status: s.effect, message: `${battler.name} is no longer ${s.data.name.toLowerCase()}.` });
  }
  battler.activeStatuses = battler.activeStatuses.filter(s => s.turnsRemaining > 0);

  return canAct;
}

// ============================================
// MOVE EXECUTION
// ============================================

function executeMove(attacker: Battler, defender: Battler, move: BattleMove, events: BattleEvent[]): void {
  events.push({ type: 'move_execute', battlerId: attacker.id, targetId: defender.id, moveId: move.id, message: `${attacker.name} used ${move.name}!` });

  if (!checkAccuracy(attacker, move)) {
    events.push({ type: 'miss', battlerId: attacker.id, moveId: move.id, message: `${attacker.name}'s attack missed!` });
    return;
  }

  // Damage
  if (move.power > 0) {
    const { damage, isCritical, effectiveness } = calculateDamage(attacker, defender, move);
    defender.stats.hp = Math.max(0, defender.stats.hp - damage);

    events.push({ type: 'damage_dealt', battlerId: attacker.id, targetId: defender.id, damage, isCritical, effectiveness, message: `${defender.name} took ${damage} damage!` });
    if (isCritical) events.push({ type: 'critical', battlerId: attacker.id, message: 'Critical hit!' });
    if (effectiveness === 'super') events.push({ type: 'type_effective', message: "It's super effective!" });
    else if (effectiveness === 'weak') events.push({ type: 'type_weak', message: "It's not very effective..." });

    // Recoil
    if (move.recoil) {
      const recoil = Math.floor(damage * move.recoil);
      attacker.stats.hp = Math.max(0, attacker.stats.hp - recoil);
      events.push({ type: 'damage_dealt', battlerId: attacker.id, targetId: attacker.id, damage: recoil, message: `${attacker.name} took ${recoil} recoil damage!` });
    }
  }

  // Healing
  if (move.healing) {
    const heal = Math.floor(attacker.stats.maxHp * (move.healing / 100));
    attacker.stats.hp = Math.min(attacker.stats.maxHp, attacker.stats.hp + heal);
    events.push({ type: 'heal', battlerId: attacker.id, healing: heal, message: `${attacker.name} recovered ${heal} HP!` });
  }

  // Status
  if (move.statusEffect && chance(move.statusEffect.chance)) {
    applyStatus(move.statusEffect.target === 'self' ? attacker : defender, move.statusEffect.effect, events);
  }
}

// ============================================
// AI
// ============================================

function selectNpcMove(npc: Battler, opponent: Battler): MoveInstance {
  // Filter moves with PP remaining
  const usableMoves = npc.moves.filter(m => m.currentPp > 0);
  
  // Safety check for empty moves array
  if (usableMoves.length === 0) {
    // If all moves are out of PP, use struggle (basic attack)
    console.warn(`NPC ${npc.name} has no PP left, using struggle`);
    return { move: BATTLE_MOVES.tackle, currentPp: 1 };
  }

  let best = usableMoves[0];
  let bestScore = -Infinity;

  for (const moveInstance of usableMoves) {
    const move = moveInstance.move;
    let score = getTypeEffectiveness(move.element, opponent.element) * 30 + move.power * 0.5;

    if (npc.stats.hp < npc.stats.maxHp * 0.4 && move.healing) score += 50;
    if (move.statusEffect?.target === 'enemy' && opponent.activeStatuses.length === 0) score += 20;
    if (move.statusEffect?.target === 'self' && npc.stats.hp > npc.stats.maxHp * 0.6) score += 15;

    // Prefer moves with more PP
    score += (moveInstance.currentPp / move.maxPp) * 5;

    score += random(-10, 10);
    if (score > bestScore) { bestScore = score; best = moveInstance; }
  }

  return best;
}

function getTurnOrder(player: Battler, opponent: Battler, playerMove: MoveInstance, opponentMove: MoveInstance): Battler[] {
  if (playerMove.move.priority !== opponentMove.move.priority) {
    return playerMove.move.priority > opponentMove.move.priority ? [player, opponent] : [opponent, player];
  }

  const pSpd = getEffectiveStat(player, 'speed');
  const oSpd = getEffectiveStat(opponent, 'speed');

  if (pSpd !== oSpd) return pSpd > oSpd ? [player, opponent] : [opponent, player];
  return chance(0.5) ? [player, opponent] : [opponent, player];
}

// ============================================
// TURN EXECUTION
// ============================================

export function executeTurn(state: BattleState, playerMoveId: string): BattleState {
  // Deep clone to avoid mutating original state
  const newState = cloneBattleState(state);
  const events: BattleEvent[] = [];

  // Find player's move instance
  const playerMoveInstance = newState.player.moves.find(m => m.move.id === playerMoveId);
  if (!playerMoveInstance) {
    return { ...state, events: [{ type: 'move_select', message: 'Invalid move selected!' }] };
  }

  // Check PP
  if (playerMoveInstance.currentPp <= 0) {
    return { ...state, events: [{ type: 'move_select', message: 'No PP left for this move!' }] };
  }

  // Validate opponent has moves
  if (newState.opponent.moves.length === 0) {
    console.error('Opponent has no moves!');
    return { ...state, events: [{ type: 'move_select', message: 'Battle error: opponent has no moves' }] };
  }

  const opponentMoveInstance = selectNpcMove(newState.opponent, newState.player);
  events.push({ type: 'turn_start', message: `Turn ${newState.turn}` });

  // Process status effects
  const playerCanAct = processStatusEffects(newState.player, events);
  const opponentCanAct = processStatusEffects(newState.opponent, events);

  // Check status damage faints
  if (newState.player.stats.hp <= 0) {
    events.push({ type: 'faint', battlerId: newState.player.id, message: `${newState.player.name} fainted!` });
    events.push({ type: 'defeat', message: 'You lost the battle!' });
    return { ...newState, events, winner: 'opponent', phase: 'end' };
  }

  if (newState.opponent.stats.hp <= 0) {
    events.push({ type: 'faint', battlerId: newState.opponent.id, message: `${newState.opponent.name} fainted!` });
    events.push({ type: 'victory', message: 'You won the battle!' });
    return { ...newState, events, winner: 'player', phase: 'end' };
  }

  // Execute moves in turn order
  const order = getTurnOrder(newState.player, newState.opponent, playerMoveInstance, opponentMoveInstance);

  for (const attacker of order) {
    const isPlayerAttacker = attacker === newState.player;
    const defender = isPlayerAttacker ? newState.opponent : newState.player;
    const moveInstance = isPlayerAttacker ? playerMoveInstance : opponentMoveInstance;
    const canAct = isPlayerAttacker ? playerCanAct : opponentCanAct;

    if (!canAct || attacker.stats.hp <= 0) continue;

    // Consume PP
    moveInstance.currentPp = Math.max(0, moveInstance.currentPp - 1);

    executeMove(attacker, defender, moveInstance.move, events);

    // Check for faint after each move
    if (defender.stats.hp <= 0) {
      events.push({ type: 'faint', battlerId: defender.id, message: `${defender.name} fainted!` });
      if (isPlayerAttacker) {
        events.push({ type: 'victory', message: 'You won the battle!' });
        return { ...newState, events, winner: 'player', phase: 'end' };
      } else {
        events.push({ type: 'defeat', message: 'You lost the battle!' });
        return { ...newState, events, winner: 'opponent', phase: 'end' };
      }
    }
  }

  return { ...newState, turn: newState.turn + 1, events, phase: 'select' };
}

// ============================================
// FLEE
// ============================================

export function attemptFlee(state: BattleState): BattleState {
  if (!state.canFlee) {
    return { ...state, events: [{ type: 'flee_fail', message: "You can't escape from this battle!" }] };
  }

  const speedRatio = getEffectiveStat(state.player, 'speed') / getEffectiveStat(state.opponent, 'speed');
  const fleeChance = Math.min(MAX_FLEE_CHANCE, 0.5 + speedRatio * 0.25);

  if (chance(fleeChance)) {
    return { ...state, events: [{ type: 'flee_success', message: 'Got away safely!' }], phase: 'end' };
  }

  // Deep clone for failed flee (opponent gets free attack)
  const newState = cloneBattleState(state);
  const events: BattleEvent[] = [];

  events.push({ type: 'flee_fail', message: "Couldn't escape!" });

  // Opponent free attack
  if (newState.opponent.moves.length > 0) {
    const opponentMoveInstance = selectNpcMove(newState.opponent, newState.player);
    opponentMoveInstance.currentPp = Math.max(0, opponentMoveInstance.currentPp - 1);
    executeMove(newState.opponent, newState.player, opponentMoveInstance.move, events);

    // Check if player fainted
    if (newState.player.stats.hp <= 0) {
      events.push({ type: 'faint', battlerId: newState.player.id, message: `${newState.player.name} fainted!` });
      events.push({ type: 'defeat', message: 'You lost the battle!' });
      return { ...newState, events, winner: 'opponent', phase: 'end' };
    }
  }

  return { ...newState, turn: newState.turn + 1, events, phase: 'select' };
}

// ============================================
// REWARDS
// ============================================

export function calculateXpReward(winner: Battler, loser: Battler): number {
  const levelDiff = loser.level - winner.level;
  const multiplier = 1 + clamp(levelDiff * 0.1, -0.5, 1.5);
  return Math.floor(BASE_XP * loser.level * multiplier);
}

export function calculateCoinReward(winner: Battler, loser: Battler): number {
  const levelDiff = loser.level - winner.level;
  const multiplier = 1 + clamp(levelDiff * 0.15, -0.3, 2.0); // More bonus for higher level opponents
  return Math.floor(BASE_COINS * loser.level * multiplier);
}

export function getBattleSummary(state: BattleState): BattleSummary {
  const won = state.winner === 'player';

  let damageDealt = 0, damageTaken = 0;
  for (const e of state.events) {
    if (e.type === 'damage_dealt' && e.damage) {
      if (e.battlerId === state.player.id && e.targetId !== state.player.id) damageDealt += e.damage;
      else if (e.targetId === state.player.id) damageTaken += e.damage;
    }
  }

  return {
    won,
    xpGained: won ? calculateXpReward(state.player, state.opponent) : 0,
    coinsGained: won ? calculateCoinReward(state.player, state.opponent) : Math.floor(BASE_COINS * 0.2), // Small consolation coins even on loss
    opponentName: state.opponent.name,
    opponentLevel: state.opponent.level,
    turnsPlayed: state.turn,
    damageDealt,
    damageTaken
  };
}
