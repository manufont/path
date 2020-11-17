const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/photon",
    createProxyMiddleware({
      target: "http://192.168.1.19:2322",
      pathRewrite: {
        "^/photon/": "/", // remove base path
      },
    })
  );

  app.use(
    "/valhalla",
    createProxyMiddleware({
      target: "http://192.168.1.19:8002",
      pathRewrite: {
        "^/valhalla/": "/", // remove base path
      },
    })
  );
};
