const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (app) => {
  app.use("/api", createProxyMiddleware({ target: "http://localhost:8000", pathRewrite: { "^/api": "/" } }));
  app.use("/ws", createProxyMiddleware({ target: "ws://localhost:8000", ws: true }));
};
