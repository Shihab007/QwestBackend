const { readAll } = require('../store/fileStore');

function handleGetLeaderboard(ws) {
  const data = readAll();

  const players = Object.values(data);
  players.sort((a, b) => b.xp - a.xp);

  const entries = players.map((player, index) => ({
    rank: index + 1,
    playerId: player.playerId,
    xp: player.xp,
    level: player.level
  }));

  ws.send(JSON.stringify({ type: 'LEADERBOARD_DATA', payload: { entries } }));
}

module.exports = { handleGetLeaderboard };