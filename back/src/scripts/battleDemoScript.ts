/**
 * BATTLE DEMO SCRIPT - VRM Pet Battles
 */

import { MapWorld } from '../ecs/entity/MapWorld.js';
import { OrbitalCompanion } from '../ecs/entity/OrbitalCompanion.js';
import { FloatingText } from '../ecs/entity/FloatingText.js';
import { EventSystem } from '../../../shared/system/EventSystem.js';
import { MessageEvent } from '../ecs/component/events/MessageEvent.js';
import { createBattler, initializeBattle, executeTurn, type BattleState } from '../../../shared/battle/battleEngine.js';
import type { PetType } from '../../../shared/battle/petTypes.js';
import { PET_CONFIGS } from '../../../shared/battle/petTypes.js';
import { EntityManager } from '../../../shared/system/EntityManager.js';
import { TextComponent } from '../../../shared/component/TextComponent.js';

const PLAYER_PET_POS = { x: -10, y: 0, z: 0 };
const OPPONENT_PET_POS = { x: 10, y: 0, z: 0 };

let currentBattle: BattleState | null = null;
let playerPetCompanion: OrbitalCompanion | null = null;
let opponentPetCompanion: OrbitalCompanion | null = null;
let battleLogEntity: FloatingText | null = null;

export async function init() {
  console.log('[BattleDemo] Initializing battle arena...');
  new MapWorld('https://notbloxo.fra1.cdn.digitaloceanspaces.com/Notblox-Assets/world/PetSim.glb');
  battleLogEntity = new FloatingText('Battle Arena Ready!\nType /battle to start', 0, 10, 0, 150);
  console.log('[BattleDemo] Arena ready! Type /battle to start a demo battle');
}

function startBattle(playerType: PetType = 'meep', opponentType: PetType = 'redfox') {
  console.log(`[BattleDemo] Starting battle: ${playerType} vs ${opponentType}`);
  
  const playerBattler = createBattler(playerType, 10, true, false, 'My Pet');
  const opponentBattler = createBattler(opponentType, 10, false, true);
  currentBattle = initializeBattle(playerBattler, opponentBattler);
  
  const playerConfig = PET_CONFIGS[playerType];
  const opponentConfig = PET_CONFIGS[opponentType];
  
  playerPetCompanion = new OrbitalCompanion({
    position: PLAYER_PET_POS,
    meshUrl: playerConfig.modelUrl,
    targetEntityId: 0,
    offset: { x: 0, y: 0, z: 0 },
    name: playerBattler.name,
    size: 1.5,
  });
  
  opponentPetCompanion = new OrbitalCompanion({
    position: OPPONENT_PET_POS,
    meshUrl: opponentConfig.modelUrl,
    targetEntityId: 0,
    offset: { x: 0, y: 0, z: 0 },
    name: opponentBattler.name,
    size: 1.5,
  });
  
  updateBattleLog(`${playerBattler.name} (Lv${playerBattler.level}) vs ${opponentBattler.name} (Lv${opponentBattler.level})\n\nBattle Start!`);
  EventSystem.addEvent(new MessageEvent(0, 'Battle System', `⚔️ Battle started! ${playerBattler.name} vs ${opponentBattler.name}!`));
}

function executeBattleTurn() {
  if (!currentBattle || currentBattle.phase === 'end') {
    console.log('[BattleDemo] No active battle');
    return;
  }
  
  const playerMove = currentBattle.player.moves[0].move.id;
  const newState = executeTurn(currentBattle, playerMove);
  currentBattle = newState;
  
  let logText = `Turn ${newState.turn - 1}\n\n`;
  for (const event of newState.events) {
    logText += event.message + '\n';
    
    if (event.type === 'damage_dealt' && event.damage && event.targetId) {
      const targetPos = event.targetId === currentBattle.opponent.id ? OPPONENT_PET_POS : PLAYER_PET_POS;
      new FloatingText(`-${event.damage}`, targetPos.x, targetPos.y + 2, targetPos.z, 2000);
    }
  }
  
  updateBattleLog(logText);
  
  if (newState.phase === 'end') {
    const winner = newState.winner === 'player' ? currentBattle.player.name : currentBattle.opponent.name;
    EventSystem.addEvent(new MessageEvent(0, 'Battle System', `🏆 Battle Over! ${winner} wins!`));
    
    setTimeout(() => {
      if (playerPetCompanion?.entity) EntityManager.removeEntity(playerPetCompanion.entity);
      if (opponentPetCompanion?.entity) EntityManager.removeEntity(opponentPetCompanion.entity);
      playerPetCompanion = null;
      opponentPetCompanion = null;
      currentBattle = null;
      updateBattleLog('Battle Arena Ready!\nType /battle to start');
    }, 5000);
  }
}

function updateBattleLog(text: string) {
  if (battleLogEntity) {
    battleLogEntity.updateText(text);
  }
}

function handleCommand(playerId: number, command: string) {
  const parts = command.toLowerCase().split(' ');
  const cmd = parts[0];
  
  switch (cmd) {
    case '/battle':
      if (currentBattle) {
        console.log('[BattleDemo] Battle already in progress');
        return;
      }
      startBattle();
      break;
    
    case '/attack':
      if (!currentBattle) {
        console.log('[BattleDemo] No battle in progress. Type /battle to start');
        return;
      }
      executeBattleTurn();
      break;
    
    case '/help':
      EventSystem.addEvent(new MessageEvent(playerId, 'Battle System', 
        'Battle Commands:\n/battle - Start battle\n/attack - Execute turn\n/hp - Show HP'));
      break;
    
    case '/hp':
      if (!currentBattle) {
        console.log('[BattleDemo] No battle in progress');
        return;
      }
      EventSystem.addEvent(new MessageEvent(playerId, 'Battle System', 
        `${currentBattle.player.name}: ${currentBattle.player.stats.hp}/${currentBattle.player.stats.maxHp} HP\n` +
        `${currentBattle.opponent.name}: ${currentBattle.opponent.stats.hp}/${currentBattle.opponent.stats.maxHp} HP`));
      break;
    
    default:
      console.log(`[BattleDemo] Unknown command: ${cmd}`);
  }
}

export function update(dt: number) {
  // Battle logic runs on command only
}

export function onMessage(playerId: number, message: string) {
  if (message.startsWith('/')) {
    handleCommand(playerId, message);
  }
}
