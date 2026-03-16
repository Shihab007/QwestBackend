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
    xp: 0,
    coins: 0,
    level: 0,
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

module.exports = { init, getPlayer, createPlayer, savePlayer, readAll };