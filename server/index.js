const http = require('http');
const createApp = require('./src/app');
const createWsServer = require('./src/ws');

const PORT = process.env.PORT || 7070;

// Bootstrap: WS needs a broadcast fn; app needs broadcast fn.
// Create HTTP server first, then attach WS, then start.

// Temporary no-op broadcast until WS is ready
let broadcast = () => {};

const app = createApp((data) => broadcast(data));
const server = http.createServer(app.callback());

const { broadcast: wsBroadcast } = createWsServer(server);
broadcast = wsBroadcast;

server.listen(PORT, () => {
  console.log(`[Server] Listening on http://localhost:${PORT}`);
  console.log(`[WS]     WebSocket on ws://localhost:${PORT}/ws`);
});
