const express = require("express");
const puppeteer = require("puppeteer");

const PORT = process.env.PORT || 3001;

const app = express();

const cors = require("cors");
const { getDates } = require("./functions");

app.use(cors());

app.use(express.json());

app.get("/getURL", (req, res) => {
  try {
    (async () => {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      const { link, dates } = await getDates(page, req.query.act);
      await browser.close();

      let oldDate = Date.parse(req.query.date);
      let filteredDates = dates.filter((date) => Date.parse(date) > oldDate);

      // changed here will have to be checked against date first
      res.json({ url: link, changed: filteredDates.length > 0 });
    })();
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
