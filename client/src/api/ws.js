import store from '../store/store.js';

const WS_URL = (() => {
  // In production BACKEND_URL is injected (e.g. https://my-app.herokuapp.com)
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/^http/, 'ws') + '/ws';
  }
  // In dev — use webpack-dev-server proxy
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/ws`;
})();

const MAX_DELAY = 30000;

let socket = null;
let reconnectDelay = 1000;
let reconnectTimer = null;
let intentionallyClosed = false;

function send(type, payload = {}) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, payload }));
    return true;
  }
  return false;
}

function handleMessage(event) {
  let parsed;
  try {
    parsed = JSON.parse(event.data);
  } catch {
    return;
  }

  const { type, payload } = parsed;

  if (type === 'message:new') {
    store.appendMessage(payload);
  }

  if (type === 'message:pinned') {
    store.setMessagePinned(payload);
  }

  if (type === 'message:unpinned') {
    store.clearPin(payload.id);
  }
}

function connect() {
  if (socket) return;

  store.set('connectionStatus', 'connecting');
  socket = new WebSocket(WS_URL);

  socket.addEventListener('open', () => {
    reconnectDelay = 1000;
    store.set('connectionStatus', 'open');
  });

  socket.addEventListener('message', handleMessage);

  socket.addEventListener('close', () => {
    socket = null;
    if (intentionallyClosed) return;
    store.set('connectionStatus', 'closed');
    reconnectTimer = setTimeout(() => {
      reconnectDelay = Math.min(reconnectDelay * 2, MAX_DELAY);
      connect();
    }, reconnectDelay);
  });

  socket.addEventListener('error', () => {
    socket?.close();
    socket = null;
  });
}

function disconnect() {
  intentionallyClosed = true;
  clearTimeout(reconnectTimer);
  socket?.close();
  socket = null;
}

export default { connect, disconnect, send };
