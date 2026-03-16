const WebSocket = require('ws');
const { init } = require('./src/store/fileStore');
const { handleGetPlayer, handleSyncPlayer } = require('./src/handlers/player');
const { handleCheckCooldown, handleStartGame, handleSkipCooldown } = require('./src/handlers/cooldown');
const { handleGetLeaderboard } = require('./src/handlers/leaderboard');
const { handleUpgrade } = require('./src/handlers/upgrades');


const PORT = 3000;

// Initialize data file on startup
init();

const wss = new WebSocket.Server({ port: PORT });

console.log(`Qwest WebSocket server running on port ${PORT}`);

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (raw) => {
    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      ws.send(JSON.stringify({ type: 'ERROR', payload: 'Invalid JSON' }));
      return;
    }

    const { type, payload } = parsed;

    if (!type) {
      ws.send(JSON.stringify({ type: 'ERROR', payload: 'Missing message type' }));
      return;
    }

    console.log(`Received: ${type}`);

    switch (type) {
      case 'GET_PLAYER':
        handleGetPlayer(ws, payload);
        break;
      case 'SYNC_PLAYER':
        handleSyncPlayer(ws, payload);
        break;
        case 'CHECK_COOLDOWN':
        handleCheckCooldown(ws, payload);
        break;
      case 'START_GAME':
        handleStartGame(ws, payload);
        break;
      case 'SKIP_COOLDOWN':
        handleSkipCooldown(ws, payload);
        break;
      case 'GET_LEADERBOARD':
        handleGetLeaderboard(ws);
        break;
      case 'UPGRADE':
        handleUpgrade(ws, payload);
        break;
      default:
        ws.send(JSON.stringify({ type: 'ERROR', payload: `Unknown type: ${type}` }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });
});