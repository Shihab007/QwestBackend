const { getPlayer, savePlayer } = require('../store/fileStore');

const UPGRADE_COSTS = {
  character: [0, 20, 40, 60],
  pet: [0, 20, 40, 60],
  house: [0, 20, 40, 60]
};

const MAX_LEVEL = 3;

function handleUpgrade(ws, payload) {
  const { playerId, item } = payload;

  if (!playerId || !item) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Missing playerId or item' }));
    return;
  }

  if (!UPGRADE_COSTS[item]) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Invalid item' }));
    return;
  }

  const player = getPlayer(playerId);

  if (!player) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Player not found' }));
    return;
  }

  const currentLevel = player.upgrades[item];

  if (currentLevel >= MAX_LEVEL) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Max level reached' }));
    return;
  }

  const nextLevel = currentLevel + 1;
  const cost = UPGRADE_COSTS[item][nextLevel];

  if (player.coins < cost) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Not enough coins' }));
    return;
  }

  // Deduct coins and apply upgrade
  player.coins -= cost;
  player.upgrades[item] = nextLevel;
  savePlayer(playerId, player);

  ws.send(JSON.stringify({
    type: 'UPGRADE_OK',
    payload: {
      item,
      newLevel: nextLevel,
      coins: player.coins
    }
  }));
}

module.exports = { handleUpgrade };