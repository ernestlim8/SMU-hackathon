const express = require("express");
const puppeteer = require("puppeteer");

const PORT = process.env.PORT || 3001;

const app = express();

const cors = require("cors");
<<<<<<< HEAD
const { getDates, getActs, getURLs } = require("./functions");
=======
const { getDates, getActs, formatDate } = require("./functions");
const e = require("express");
>>>>>>> add webscraping to get new text by date

app.use(cors());

app.use(express.json());

app.get("/getAllActNames", (req, res) => {
  try {
    (async () => {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      const acts = await getActs(page);
      await browser.close();

      // changed here will have to be checked against date first
      res.json({ acts: acts });
    })();
  } catch (err) {
    console.log(err);
  }
});

app.get("/getAllURLs", (req, res) => {
  try {
    (async () => {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      const urls = await getURLs(page);
      await browser.close();

      // changed here will have to be checked against date first
      res.json({ urls: urls});
    })();
  } catch (err) {
    console.log(err);
  }
});

app.get("/getURL", (req, res) => {
  try {
    (async () => {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      const { link, dates } = await getDates(page, req.query.act);

      let oldDate = Date.parse(req.query.date);
      let filteredDates = dates.filter((date) => Date.parse(date) > oldDate);

      const amendments = await page.$$eval(".amendNote", (arr) =>
        arr.map((el) => el.parentElement.textContent)
      );

      let lawExp = new RegExp(/([^\[]*)\[.+([0-9]{2}\/[0-9]{2}\/[0-9]{4})\]/);
      let dateJson = {};

      filteredDates.forEach(
        (date) => (dateJson[formatDate(new Date(date))] = [])
      );

      for (let i = 0; i < amendments.length; i++) {
        const amendment = amendments[i];
        const match = amendment.match(lawExp);
        if (match) {
          const paragraph = match[1];
          const amendmentDates = match.splice(2);
          amendmentDates.forEach((date) => {
            if (dateJson.hasOwnProperty(date)) {
              dateJson[date].push(paragraph);
            }
          });
        }
      }
      await browser.close();
      res.json({
        url: link,
        changed: filteredDates.length > 0,
        dateMap: dateJson,
      });
    })();
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
