const store = require('../store/memStore');
const { getBotReply } = require('../utils/botResponder');

async function list(ctx) {
  const limit = parseInt(ctx.query.limit, 10) || 10;
  const { before } = ctx.query;
  const result = store.getMessages(limit, before || null);
  ctx.body = result;
}

async function create(ctx, broadcast) {
  const { content } = ctx.request.body;
  if (!content || typeof content !== 'string') {
    ctx.status = 400;
    ctx.body = { error: 'content is required' };
    return;
  }

  const userMsg = store.addMessage({ type: 'text', content: content.trim(), author: 'user' });
  broadcast({ type: 'message:new', payload: userMsg });

  // Check for bot command
  const botReply = getBotReply(content.trim());
  if (botReply) {
    // Small delay to make it feel natural
    setTimeout(() => {
      const botMsg = store.addMessage({ type: 'text', content: botReply, author: 'bot' });
      broadcast({ type: 'message:new', payload: botMsg });
    }, 400);
  }

  ctx.status = 201;
  ctx.body = userMsg;
}

async function search(ctx) {
  const { q } = ctx.query;
  if (!q) {
    ctx.body = { items: [] };
    return;
  }
  const items = store.searchMessages(q);
  ctx.body = { items };
}

module.exports = { list, create, search };
