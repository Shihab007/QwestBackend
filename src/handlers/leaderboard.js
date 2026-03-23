const { readAll } = require('../store/fileStore');

function handleGetLeaderboard(ws, payload) {
  const { type } = payload || {};

  const data = readAll();
  const players = Object.values(data);

  let filtered;

  if (type === 'prize') {
    filtered = players.filter(p => p.isPrizeEligible === true);
  } else if (type === 'non-prize') {
    filtered = players.filter(p => p.isPrizeEligible === false);
  } else {
    filtered = players;
  }

  filtered.sort((a, b) => b.leaderboardXP - a.leaderboardXP);

  const entries = filtered.map((player, index) => ({
    rank: index + 1,
    playerId: player.playerId,
    username: player.username || 'Player_' + player.playerId.slice(-4),
    xp: player.leaderboardXP || player.xp,
    level: player.level,
    isPrizeEligible: player.isPrizeEligible
  }));

  ws.send(JSON.stringify({ type: 'LEADERBOARD_DATA', payload: { entries } }));
}

function handleResetLeaderboard(ws) {
  const data = readAll();
  const now = new Date();

  Object.values(data).forEach(player => {
    const resetDate = new Date(player.leaderboardResetDate);

    if (now >= resetDate) {
      player.leaderboardXP = 0;
      player.leaderboardResetDate = getNextResetDate();
    }
  });

  const { writeAll, getNextResetDate } = require('../store/fileStore');
  writeAll(data);

  ws.send(JSON.stringify({ type: 'RESET_OK', payload: 'Leaderboard reset complete' }));
}

module.exports = { handleGetLeaderboard, handleResetLeaderboard };