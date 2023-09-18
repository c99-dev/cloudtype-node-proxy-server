// index.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
const { JSDOM } = require("jsdom");

let cachedChampionData = null;
const fetchDataInterval = 60 * 60 * 1000;

const fetchDataFromRemoteServer = async () => {
  try {
    // add headers to axios request Accept-Language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6
    const response = await axios.get("https://www.op.gg/modes/aram?region=kr", {
      headers: {
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6",
      },
    });
    const data = response.data;

    const dom = new JSDOM(data);
    const doc = dom.window.document;
    let championData = [];

    const rows = doc.querySelectorAll("tr");
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length !== 4) return;

      const rank = cells[0].textContent.trim();
      const name = cells[1].querySelector("strong").textContent.trim();
      const tierText = cells[2].lastChild.textContent.trim();
      const tier = tierText;
      const winrate = cells[3].textContent.trim();

      championData.push({ rank, name, tier, winrate });
    });

    cachedChampionData = championData;
  } catch (error) {
    console.error("Error fetching data from remote server:", error);
  }
};

// Fetch the data immediately when the server starts
fetchDataFromRemoteServer();

// Then, fetch the data at regular intervals
setInterval(fetchDataFromRemoteServer, fetchDataInterval);

router.get("/aram-champion-ranking-data", (req, res) => {
  if (!cachedChampionData) {
    return res.status(500).send("Data not available");
  }

  res.json(cachedChampionData);
});

router.get("/test", (req, res) => {
  res.send("Hello World!");
});

module.exports = router;
