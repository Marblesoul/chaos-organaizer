const Koa = require('koa');
const { koaBody } = require('koa-body');
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const createRouter = require('./router');

function createApp(broadcast) {
  const app = new Koa();

  app.use(errorHandler);
  app.use(corsMiddleware);
  app.use(koaBody({
    multipart: true,
    formidable: {
      maxFileSize: 50 * 1024 * 1024, // 50 MB
    },
  }));

  const router = createRouter(broadcast);
  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}

module.exports = createApp;
