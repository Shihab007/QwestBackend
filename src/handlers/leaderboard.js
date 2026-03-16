const { readAll } = require('../store/fileStore');

function handleGetLeaderboard(ws) {
  const data = readAll();

  // Convert players object to array
  const players = Object.values(data);

  // Sort by xp descending
  players.sort((a, b) => b.xp - a.xp);

  // Build leaderboard entries
  const leaderboard = players.map((player, index) => ({
    rank: index + 1,
    playerId: player.playerId,
    xp: player.xp,
    level: player.level
  }));

  ws.send(JSON.stringify({ type: 'LEADERBOARD_DATA', payload: leaderboard }));
}

module.exports = { handleGetLeaderboard };