const express = require("express");
const puppeteer = require("puppeteer");
const { JSDOM } = require("jsdom");

const router = express.Router();

const FETCH_DATA_INTERVAL = 60 * 60 * 1000;
const REMOTE_SERVER_URL = "https://www.op.gg/modes/aram";

let cachedChampionData = null;

async function fetchDataFromRemoteServer() {
  try {
    const data = await requestChampionData();
    const champions = extractChampionData(data);
    cachedChampionData = champions;
  } catch (error) {
    console.error("데이터를 추출하는 중 오류 발생:", error);
  }
}

async function requestChampionData() {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    await page.goto(REMOTE_SERVER_URL, {
      waitUntil: "networkidle0",
      timeout: 0,
    });

    const htmlData = await page.content();
    await browser.close();
    return htmlData;
  } catch (error) {
    console.error("op.gg에서 데이터를 가져오는 중 오류 발생:", error);
  }
}

function extractChampionData(htmlData) {
  const dom = new JSDOM(htmlData);
  const doc = dom.window.document;

  let champions = [];
  const rows = doc.querySelectorAll("tr");
  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length !== 4) return;

    const champion = {
      rank: cells[0].textContent.trim(),
      name: cells[1].querySelector("strong").textContent.trim(),
      tier: cells[2].lastChild.textContent.trim(),
      winrate: cells[3].textContent.trim(),
    };

    champions.push(champion);
  });

  return champions;
}

fetchDataFromRemoteServer();
const intervalId = setInterval(fetchDataFromRemoteServer, FETCH_DATA_INTERVAL);

function cleanup() {
  clearInterval(intervalId);
}

process.on("exit", cleanup);
process.on("SIGINT", cleanup);

router.get("/aram-champion-ranking-data", (req, res) => {
  if (!cachedChampionData) {
    res.status(500).send("데이터를 사용할 수 없습니다.");
    return;
  }

  res.json(cachedChampionData);
});
module.exports = router;
