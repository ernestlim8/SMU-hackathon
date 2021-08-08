const express = require("express");
const puppeteer = require("puppeteer");

const PORT = process.env.PORT || 3001;

const app = express();
{/* <input type="text" 
class="form-control basic-search-title ui-autocomplete-input" 
maxlength="100" id="searchPhrase3" 
data-bind="attr: { 'placeholder': placeholder }, value: form.Phrase, css: { 'basic-search-title': form.Within() === 'title' }" placeholder="e.g bank, CPC, 196A, 247/2011, 276, R 11" autocomplete="off"></input> */}
try {
  (async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto('https://sso.agc.gov.sg/');
    await page.waitForSelector('input[id="searchPhrase3"]')
    await page.evaluate('input[id="searchPhrase3"]', el => el.value = "196A");
    // await page.evaluate(() => {
    //   const inputs = document.querySelectorAll('input[type="text"]')
    //   inputs.forEach(input => input.value = "196A")
    // })
    await page.keyboard.press("Enter");
    await page.waitForNavigation();
    console.log("New page url: ", page.url())
    // const data = await page.evaluate(() => document.querySelector('*').outerHTML);
    // console.log(data)
    await browser.close();
  })()
} catch (err) {
  console.log(err);
}

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});