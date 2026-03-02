const cors = require('@koa/cors');

module.exports = cors({
  origin: (ctx) => {
    const { origin } = ctx.request.headers;
    // Allow localhost for dev, GitHub Pages for production
    const allowed = [
      /^http:\/\/localhost(:\d+)?$/,
      /^https?:\/\/.*\.github\.io$/,
    ];
    if (!origin) return '*';
    if (allowed.some((re) => re.test(origin))) return origin;
    return false;
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
});
