const express = require("express");
const puppeteer = require("puppeteer");

const PORT = process.env.PORT || 3001;

const app = express();

const cors = require("cors");
const {
  getDates,
  getActs,
  formatDate,
  getURLs,
  getOldURL,
  getSection,
} = require("./functions");
const e = require("express");

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
      res.json({ urls: urls });
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
      await page.setDefaultNavigationTimeout(0);
      // get old dates
      let oldDate = Date.parse(req.query.date);

      let filteredDates = await dates.filter(
        (date) => Date.parse(date) > oldDate
      );
      filteredDates = filteredDates.map((date) => formatDate(date));

      let idx = filteredDates.length + 1;
      const oldURL = (
        await page.$$eval("#mobileDocTimeline .timestamp a:last-child", (arr) =>
          arr.map((el) => el.href)
        )
      )[idx];

      await page.click(".toc-panel.mobile-timeline a");
      const amendments = await page.$$eval(".amendNote", (arr) =>
        arr.map((el) => el.parentElement.textContent)
      );

      const contexts = await page.$$(".amendNote");
      const sectionNos = await Promise.all(
        contexts.map(async (el) => await getSection(el))
      );

      let lawExp = new RegExp(/([^\[]*)\[.+([0-9]{2}\/[0-9]{2}\/[0-9]{4})\]/);

      let sections = {};

      for (let i = 0; i < amendments.length; i++) {
        const amendment = amendments[i];
        const match = amendment.match(lawExp);
        if (match) {
          const paragraph = match[1];
          const section = sectionNos[i];
          const date = match[2];

          if (filteredDates.includes(date)) {
            if (sections.hasOwnProperty(section)) {
              sections[section].add(paragraph);
            } else {
              sections[section] = new Set();
              sections[section].add(paragraph);
            }
          }
        }
      }

      for (const section in sections) {
        sections[section] = Array.from(sections[section]);
      }

      await browser.close();
      res.json({
        url: link,
        oldURL: oldURL,
        changed: filteredDates.length > 0,
        sections: sections,
      });
    })();
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
