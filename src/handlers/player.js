const { getPlayer, createPlayer, savePlayer } = require('../store/fileStore');

function handleGetPlayer(ws, payload) {
  const { playerId } = payload;

  if (!playerId) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Missing playerId' }));
    return;
  }

  let player = getPlayer(playerId);

  // If player doesn't exist, create them
  if (!player) {
    player = createPlayer(playerId);
  }

  ws.send(JSON.stringify({ type: 'PLAYER_DATA', payload: player }));
}

function handleSyncPlayer(ws, payload) {
  const { playerId, xp, coins, level } = payload;

  if (!playerId) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Missing playerId' }));
    return;
  }

  let player = getPlayer(playerId);

  if (!player) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Player not found' }));
    return;
  }

  // Only update what was sent
  player.xp = xp ?? player.xp;
  player.coins = coins ?? player.coins;
  player.level = level ?? player.level;

  savePlayer(playerId, player);

  ws.send(JSON.stringify({ type: 'SYNC_OK', payload: player }));
}

module.exports = { handleGetPlayer, handleSyncPlayer };