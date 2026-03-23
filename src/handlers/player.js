const { getPlayer, createPlayer, savePlayer } = require('../store/fileStore');


function handleDailyLogin(ws, payload) {
  const { playerId } = payload;

  if (!playerId) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Missing playerId' }));
    return;
  }

  const player = getPlayer(playerId);

  if (!player) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Player not found' }));
    return;
  }

  const today = new Date().toDateString();
  const lastLogin = player.lastLoginDate
    ? new Date(player.lastLoginDate).toDateString()
    : null;

  // Already claimed today
  if (lastLogin === today) {
    ws.send(JSON.stringify({
      type: 'DAILY_LOGIN_OK',
      payload: { alreadyClaimed: true, xp: player.xp }
    }));
    return;
  }

  // Give daily login XP
  const XP_DAILY_LOGIN = 20;
  player.xp += XP_DAILY_LOGIN;
  player.leaderboardXP = (player.leaderboardXP || 0) + XP_DAILY_LOGIN;
  player.level = Math.floor(player.xp / 10);
  player.lastLoginDate = new Date().toISOString();

  savePlayer(playerId, player);

  ws.send(JSON.stringify({
    type: 'DAILY_LOGIN_OK',
    payload: {
      alreadyClaimed: false,
      xpAwarded: XP_DAILY_LOGIN,
      xp: player.xp,
      level: player.level
    }
  }));
}


function handleGetPlayer(ws, payload) {
  const { playerId } = payload;

  if (!playerId) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Missing playerId' }));
    return;
  }

  let player = getPlayer(playerId);

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

  player.xp = xp ?? player.xp;
  player.coins = coins ?? player.coins;
  player.level = level ?? player.level;
  player.leaderboardXP = player.xp;

  savePlayer(playerId, player);

  ws.send(JSON.stringify({ type: 'SYNC_OK', payload: player }));
}

function handleSetUsername(ws, payload) {
  const { playerId, username } = payload;

  if (!playerId || !username) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Missing playerId or username' }));
    return;
  }

  if (username.trim().length < 3 || username.trim().length > 20) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Username must be 3 to 20 characters' }));
    return;
  }

  const player = getPlayer(playerId);

  if (!player) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Player not found' }));
    return;
  }

  player.username = username.trim();
  savePlayer(playerId, player);

  ws.send(JSON.stringify({ type: 'USERNAME_OK', payload: { username: player.username } }));
}

function handleSetProfile(ws, payload) {
  const { playerId, dob, state } = payload;

  if (!playerId || !dob || !state) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Missing playerId, dob or state' }));
    return;
  }

  const player = getPlayer(playerId);

  if (!player) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: 'Player not found' }));
    return;
  }

  // Calculate age
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Restricted states - expand this list as compliance requires
  const restrictedStates = ['SA'];

  const isAdult = age >= 18;
  const isRestrictedState = restrictedStates.includes(state.toUpperCase());

  player.dob = dob;
  player.state = state.toUpperCase();
  player.isPrizeEligible = isAdult && !isRestrictedState;

  savePlayer(playerId, player);

  ws.send(JSON.stringify({
    type: 'PROFILE_OK',
    payload: {
      dob: player.dob,
      state: player.state,
      isPrizeEligible: player.isPrizeEligible
    }
  }));
}

module.exports = { handleGetPlayer, handleSyncPlayer, handleSetUsername, handleSetProfile, handleDailyLogin };