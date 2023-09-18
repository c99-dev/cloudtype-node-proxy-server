const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const router = express.Router();

router.use(
  "/proxy",
  createProxyMiddleware({
    target: "https://www.op.gg",
    changeOrigin: true,
    pathRewrite: {
      "^/proxy": "",
    },
    onProxyRes: (proxyRes) => {
      // Change MIME type to plain text
      proxyRes.headers["Content-Type"] = "text/plain";
    },
  })
);

module.exports = router;
