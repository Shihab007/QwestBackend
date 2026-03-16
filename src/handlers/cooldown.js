const { getPlayer, savePlayer } = require('../store/fileStore');

const COOLDOWN_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

function handleCheckCooldown(ws, payload) {
  const { playerId, game } = payload;

  if (!playerId || !game) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Missing playerId or game' }));
    return;
  }

  const player = getPlayer(playerId);

  if (!player) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Player not found' }));
    return;
  }

  const lastPlayed = player.cooldowns[game];

  // No cooldown recorded, player can play
  if (!lastPlayed) {
    ws.send(JSON.stringify({ type: 'COOLDOWN_STATUS', payload: { canPlay: true, remainingMs: 0 } }));
    return;
  }

  const elapsed = Date.now() - new Date(lastPlayed).getTime();
  const remaining = COOLDOWN_DURATION - elapsed;

  if (remaining <= 0) {
    ws.send(JSON.stringify({ type: 'COOLDOWN_STATUS', payload: { canPlay: true, remainingMs: 0 } }));
  } else {
    ws.send(JSON.stringify({ type: 'COOLDOWN_STATUS', payload: { canPlay: false, remainingMs: remaining } }));
  }
}

function handleStartGame(ws, payload) {
  const { playerId, game } = payload;

  if (!playerId || !game) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Missing playerId or game' }));
    return;
  }

  const player = getPlayer(playerId);

  if (!player) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Player not found' }));
    return;
  }

  // Stamp the cooldown start time
  player.cooldowns[game] = new Date().toISOString();
  savePlayer(playerId, player);

  ws.send(JSON.stringify({ type: 'GAME_STARTED', payload: { game, startedAt: player.cooldowns[game] } }));
}

function handleSkipCooldown(ws, payload) {
  const { playerId, game } = payload;

  if (!playerId || !game) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Missing playerId or game' }));
    return;
  }

  const player = getPlayer(playerId);

  if (!player) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Player not found' }));
    return;
  }

  const SKIP_COST = 10;

  if (player.coins < SKIP_COST) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Not enough coins' }));
    return;
  }

  // Deduct coins and clear cooldown
  player.coins -= SKIP_COST;
  player.cooldowns[game] = null;
  savePlayer(playerId, player);

  ws.send(JSON.stringify({ type: 'COOLDOWN_SKIPPED', payload: { game, coins: player.coins } }));
}

module.exports = { handleCheckCooldown, handleStartGame, handleSkipCooldown };