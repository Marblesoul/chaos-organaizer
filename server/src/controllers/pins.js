const store = require('../store/memStore');

async function listPins(ctx) {
  ctx.body = { items: store.getPinned() };
}

async function pin(ctx, broadcast) {
  const { id } = ctx.params;
  const msg = store.pinMessage(id);
  if (!msg) {
    ctx.status = 404;
    ctx.body = { error: 'Message not found' };
    return;
  }
  broadcast({ type: 'message:pinned', payload: msg });
  ctx.body = msg;
}

async function unpin(ctx, broadcast) {
  const { id } = ctx.params;
  const msg = store.unpinMessage(id);
  if (!msg) {
    ctx.status = 404;
    ctx.body = { error: 'Message not found' };
    return;
  }
  broadcast({ type: 'message:unpinned', payload: { id } });
  ctx.body = { id };
}

module.exports = { listPins, pin, unpin };
