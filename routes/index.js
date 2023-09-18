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
    // Transform the response data into Base64 format
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      const base64Data = Buffer.from(proxyResData).toString("base64");
      return base64Data;
    },
  })
);

module.exports = router;
