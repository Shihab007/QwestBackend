const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000');

let step = 0;

ws.on('open', () => {
  // Step 1: Give player some coins first via SYNC_PLAYER
  ws.send(JSON.stringify({
    type: 'SYNC_PLAYER',
    payload: { playerId: 'test-player-001', coins: 100 }
  }));
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  console.log(`Step ${step + 1}:`, JSON.stringify(response, null, 2));
  step++;

  if (step === 1) {
    // Step 2: Upgrade character
    ws.send(JSON.stringify({
      type: 'UPGRADE',
      payload: { playerId: 'test-player-001', item: 'character' }
    }));
  } else {
    ws.close();
  }
});