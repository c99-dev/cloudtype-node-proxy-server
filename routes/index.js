const express = require("express");
const router = express.Router();
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// 변경된 부분: createProxyMiddleware 함수를 사용
app.use(
  "/proxy",
  createProxyMiddleware({
    target: "https://www.op.gg",
    changeOrigin: true,
    pathRewrite: {
      "^/proxy": "",
    },
  })
);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = router;
