const express = require("express");
const router = express.Router();
const { createProxyMiddleware } = require("http-proxy-middleware");

// 기존의 app 인스턴스 생성 코드는 제거

router.get("/", function (req, res, next) {
  res.render("index.njk"); // .html 대신 .njk 확장자 사용
});

// 변경된 부분: createProxyMiddleware 함수를 사용
router.use(
  "/proxy",
  createProxyMiddleware({
    target: "https://www.op.gg",
    changeOrigin: true,
    pathRewrite: {
      "^/proxy": "",
    },
    onProxyRes: (proxyRes) => {
      // Change MIME type to application/json
      proxyRes.headers["Content-Type"] = "application/json";
      // Add CORS headers
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
    },
    // Transform the response data into JSON format
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      return JSON.stringify(proxyResData.toString("utf8"));
    },
  })
);

module.exports = router;
