module.exports = async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    const status = err.status || err.statusCode || 500;
    ctx.status = status;
    ctx.body = {
      error: err.message || 'Internal Server Error',
    };
    if (status >= 500) {
      console.error('[Server Error]', err);
    }
  }
};
