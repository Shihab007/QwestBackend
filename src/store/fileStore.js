const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/players.json');

function init() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
  }
}

function readAll() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  if (!raw || raw.trim() === '') return {};
  return JSON.parse(raw);
}

function writeAll(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getPlayer(playerId) {
  const data = readAll();
  return data[playerId] || null;
}

function createPlayer(playerId) {
  const data = readAll();

  data[playerId] = {
    playerId,
    username: 'Player_' + playerId.slice(-4),
    dob: null,
    state: null,
    isPrizeEligible: false,
    xp: 0,
    leaderboardXP: 0,
    coins: 0,
    level: 0,
    lastLoginDate: null,
    leaderboardResetDate: getNextResetDate(),
    upgrades: {
      character: 0,
      pet: 0,
      house: 0
    },
    cooldowns: {
      wheel: null,
      piano: null
    },
    createdAt: new Date().toISOString()
  };

  writeAll(data);
  return data[playerId];
}

function savePlayer(playerId, playerData) {
  const data = readAll();
  data[playerId] = playerData;
  writeAll(data);
}

// Returns the first day of next month as ISO string
function getNextResetDate() {
  const now = new Date();
  const reset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return reset.toISOString();
}

module.exports = { init, getPlayer, createPlayer, savePlayer, readAll, writeAll, getNextResetDate };