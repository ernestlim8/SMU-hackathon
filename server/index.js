const express = require("express");
const puppeteer = require("puppeteer");

const PORT = process.env.PORT || 3001;

const app = express();

const cors = require("cors");

app.use(cors());

app.use(express.json())

app.get("/getURL", (req, res) => {
    console.log(req.query)
    try {
        (async () => {
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            const phrase = req.query.act;
            console.log(phrase)
            await page.goto(
            `https://sso.agc.gov.sg/Search/Content?Phrase=${phrase}&PhraseType=AllTheseWords&In=RevisedEditionAct&Within=title`
            );
    
            // retrieve dates of change
            await page.waitForSelector("#searchTable div.row");
            const results = await page.$$("#searchTable div.row");
            // const results2 = await page.evaluate((el) => el.textContent, results[2]);
            // console.log(results2);
            const link = await page.$eval("#searchTable div.row a", (el) => el.href);
    
            await browser.close();
            // changed here will have to be checked against date first
            res.json({"url": link, "changed": true})
        })();
    } catch (err) {
        console.log(err);
    }
})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
