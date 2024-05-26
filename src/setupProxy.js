const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/photon",
    createProxyMiddleware({
      target: "https://path.manufont.com",
      changeOrigin: true,
    })
  );

  app.use(
    "/valhalla",
    createProxyMiddleware({
      target: "https://path.manufont.com",
      changeOrigin: true,
    })
  );

  app.use(
    "/osmt",
    createProxyMiddleware({
      target: "https://path.manufont.com",
      changeOrigin: true,
    })
  );
};
