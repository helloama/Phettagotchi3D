/**
 * BATTLE DEMO SCRIPT - VRM Pet Battles
 * Plain JS version for sandbox execution
 */

const PLAYER_PET_POS = { x: -10, y: 1, z: 0 }
const OPPONENT_PET_POS = { x: 10, y: 1, z: 0 }

let currentBattle = null
let playerPetCompanion = null
let opponentPetCompanion = null
let battleLogEntity = null

// Import battle engine functions (these will be available via dynamic import)
let createBattler, initializeBattle, executeTurn, PET_CONFIGS

async function init() {
  console.log('[BattleDemo] Initializing battle arena...')

  // Load battle engine modules
  try {
    const battleEngine = await import('../../dist/shared/battle/battleEngine.js')
    const petTypes = await import('../../dist/shared/battle/petTypes.js')

    createBattler = battleEngine.createBattler
    initializeBattle = battleEngine.initializeBattle
    executeTurn = battleEngine.executeTurn
    PET_CONFIGS = petTypes.PET_CONFIGS

    console.log('[BattleDemo] Battle engine loaded')
  } catch (error) {
    console.error('[BattleDemo] Failed to load battle engine:', error)
  }

  new MapWorld('https://notbloxo.fra1.cdn.digitaloceanspaces.com/Notblox-Assets/world/FlatMap.glb')
  battleLogEntity = new FloatingText('Battle Arena Ready!\nType /battle to start', 0, 3, 0, 150)
  console.log('[BattleDemo] Arena ready! Type /battle to start a demo battle')
}

function startBattle(playerType = 'meep', opponentType = 'redfox') {
  if (!createBattler || !initializeBattle) {
    console.error('[BattleDemo] Battle engine not loaded')
    return
  }

  console.log(`[BattleDemo] Starting battle: ${playerType} vs ${opponentType}`)

  const playerBattler = createBattler(playerType, 10, true, false, 'My Pet')
  const opponentBattler = createBattler(opponentType, 10, false, true)
  currentBattle = initializeBattle(playerBattler, opponentBattler)

  const playerConfig = PET_CONFIGS[playerType]
  const opponentConfig = PET_CONFIGS[opponentType]

  playerPetCompanion = new OrbitalCompanion({
    position: PLAYER_PET_POS,
    meshUrl: playerConfig.modelUrl,
    targetEntityId: 0,
    offset: { x: 0, y: 0, z: 0 },
    name: playerBattler.name,
    size: 1.5,
  })

  opponentPetCompanion = new OrbitalCompanion({
    position: OPPONENT_PET_POS,
    meshUrl: opponentConfig.modelUrl,
    targetEntityId: 0,
    offset: { x: 0, y: 0, z: 0 },
    name: opponentBattler.name,
    size: 1.5,
  })

  updateBattleLog(`${playerBattler.name} (Lv${playerBattler.level}) vs ${opponentBattler.name} (Lv${opponentBattler.level})\n\nBattle Start!`)
  EventSystem.addEvent(new MessageEvent(0, 'Battle System', `⚔️ Battle started! ${playerBattler.name} vs ${opponentBattler.name}!`))
}

function executeBattleTurn() {
  if (!currentBattle || currentBattle.phase === 'end') {
    console.log('[BattleDemo] No active battle')
    return
  }

  const playerMove = currentBattle.player.moves[0].move.id
  const newState = executeTurn(currentBattle, playerMove)
  currentBattle = newState

  let logText = `Turn ${newState.turn - 1}\n\n`
  for (const event of newState.events) {
    logText += event.message + '\n'

    if (event.type === 'damage_dealt' && event.damage && event.targetId) {
      const targetPos = event.targetId === currentBattle.opponent.id ? OPPONENT_PET_POS : PLAYER_PET_POS
      new FloatingText(`-${event.damage}`, targetPos.x, targetPos.y + 2, targetPos.z, 2000)
    }
  }

  updateBattleLog(logText)

  if (newState.phase === 'end') {
    const winner = newState.winner === 'player' ? currentBattle.player.name : currentBattle.opponent.name
    EventSystem.addEvent(new MessageEvent(0, 'Battle System', `🏆 Battle Over! ${winner} wins!`))

    setTimeout(() => {
      if (playerPetCompanion?.entity) EntityManager.removeEntity(playerPetCompanion.entity)
      if (opponentPetCompanion?.entity) EntityManager.removeEntity(opponentPetCompanion.entity)
      playerPetCompanion = null
      opponentPetCompanion = null
      currentBattle = null
      updateBattleLog('Battle Arena Ready!\nType /battle to start')
    }, 5000)
  }
}

function updateBattleLog(text) {
  if (battleLogEntity) {
    battleLogEntity.updateText(text)
  }
}

function handleCommand(playerId, command) {
  const parts = command.toLowerCase().split(' ')
  const cmd = parts[0]

  switch (cmd) {
    case '/battle':
      if (currentBattle) {
        console.log('[BattleDemo] Battle already in progress')
        return
      }
      startBattle()
      break

    case '/attack':
      if (!currentBattle) {
        console.log('[BattleDemo] No battle in progress. Type /battle to start')
        return
      }
      executeBattleTurn()
      break

    case '/help':
      EventSystem.addEvent(new MessageEvent(playerId, 'Battle System',
        'Battle Commands:\n/battle - Start battle\n/attack - Execute turn\n/hp - Show HP'))
      break

    case '/hp':
      if (!currentBattle) {
        console.log('[BattleDemo] No battle in progress')
        return
      }
      EventSystem.addEvent(new MessageEvent(playerId, 'Battle System',
        `${currentBattle.player.name}: ${currentBattle.player.stats.hp}/${currentBattle.player.stats.maxHp} HP\n` +
        `${currentBattle.opponent.name}: ${currentBattle.opponent.stats.hp}/${currentBattle.opponent.stats.maxHp} HP`))
      break

    default:
      console.log(`[BattleDemo] Unknown command: ${cmd}`)
  }
}

function update(dt) {
  // Battle logic runs on command only
}

function onMessage(playerId, message) {
  if (message.startsWith('/')) {
    handleCommand(playerId, message)
  }
}
