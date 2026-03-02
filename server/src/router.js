const Router = require('@koa/router');
const messagesCtrl = require('./controllers/messages');
const filesCtrl = require('./controllers/files');
const pinsCtrl = require('./controllers/pins');

function createRouter(broadcast) {
  const router = new Router({ prefix: '/api' });

  // Messages
  router.get('/messages', (ctx) => messagesCtrl.list(ctx));
  router.post('/messages', (ctx) => messagesCtrl.create(ctx, broadcast));
  router.get('/search', (ctx) => messagesCtrl.search(ctx));

  // Files
  router.post('/files', (ctx) => filesCtrl.upload(ctx, broadcast));
  router.get('/files/:filename', (ctx) => filesCtrl.download(ctx));

  // Pins
  router.get('/pins', (ctx) => pinsCtrl.listPins(ctx));
  router.post('/pins/:id', (ctx) => pinsCtrl.pin(ctx, broadcast));
  router.delete('/pins/:id', (ctx) => pinsCtrl.unpin(ctx, broadcast));

  return router;
}

module.exports = createRouter;
