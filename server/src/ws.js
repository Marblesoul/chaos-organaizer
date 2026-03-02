const { WebSocketServer } = require('ws');
const store = require('./store/memStore');
const { getBotReply } = require('./utils/botResponder');

function createWsServer(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  function broadcast(data) {
    const json = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(json);
      }
    });
  }

  wss.on('connection', (ws) => {
    console.log('[WS] Client connected, total:', wss.clients.size);

    ws.on('message', (raw) => {
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return;
      }

      const { type, payload } = parsed;

      if (type === 'message:send') {
        const { content } = payload || {};
        if (!content || typeof content !== 'string') return;

        const userMsg = store.addMessage({
          type: 'text',
          content: content.trim(),
          author: 'user',
        });
        broadcast({ type: 'message:new', payload: userMsg });

        // Bot reply
        const botReply = getBotReply(content.trim());
        if (botReply) {
          setTimeout(() => {
            const botMsg = store.addMessage({
              type: 'text',
              content: botReply,
              author: 'bot',
            });
            broadcast({ type: 'message:new', payload: botMsg });
          }, 400);
        }
      }

      if (type === 'message:pin') {
        const { id } = payload || {};
        if (!id) return;
        const msg = store.pinMessage(id);
        if (msg) broadcast({ type: 'message:pinned', payload: msg });
      }

      if (type === 'message:unpin') {
        const { id } = payload || {};
        if (!id) return;
        const msg = store.unpinMessage(id);
        if (msg) broadcast({ type: 'message:unpinned', payload: { id } });
      }
    });

    ws.on('close', () => {
      console.log('[WS] Client disconnected, total:', wss.clients.size);
    });

    ws.on('error', (err) => {
      console.error('[WS] Error:', err.message);
    });
  });

  return { wss, broadcast };
}

module.exports = createWsServer;
