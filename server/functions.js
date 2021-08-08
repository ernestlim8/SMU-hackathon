const { Browser } = require("puppeteer");

const getDates = async (page, phrase) => {
  await page.goto(
    `https://sso.agc.gov.sg/Search/Content?Phrase=${phrase}&PhraseType=AllTheseWords&In=InForce_Act_SL&Within=title`
  );
  console.log(phrase);
  const link = await page.$eval("#searchTable div.row a", (el) => el.href);
  await page.goto(link);

  await page.waitForSelector(
    "#mobileToolbar > div:nth-child(2) > button:nth-child(2)"
  );
  await page.click("#mobileToolbar > div:nth-child(2) > button:nth-child(2)");
  await page.waitForSelector("#mobileDocTimeline .timestamp a:last-child");

  const dates = await page.$$eval(
    "#mobileDocTimeline .timestamp a:last-child",
    (arr) => arr.map((el) => el.innerText)
  );
  await page.click(".toc-panel.mobile-timeline a");
  return { link, dates };
};

const getRelevantActs = async (page, url) => {
  await page.goto(url);
  var data = await page.evaluate(() => {
    const tds = Array.from(document.querySelectorAll('table tr td'));
    return tds.map(td => td.innerText);
  })
  // remove the title of the table columns and other styling at the bottom of the table
  data = data.slice(36, -30); 
  var ret = [];
  for (let i = 0; i < data.length; i++) {
    if (i * 6 >= data.length){
      break;
    }
    // only need the names of the acts not the other columns in the table
    ret.push(data[i * 6]); 
  }
  return ret;
}

const getActs = async (page) => { 
  // only 2 pages to look at so no need to click buttons and go through
  let arr1 = await getRelevantActs(page, "https://sso.agc.gov.sg/Browse/Act/Current/All?PageSize=500&SortBy=Title&SortOrder=ASC");
  let arr2 = await getRelevantActs(page, "https://sso.agc.gov.sg/Browse/Act/Current/All/1?PageSize=500&SortBy=Title&SortOrder=ASC");
  let result = arr1.concat(arr2);
  return result;
}

module.exports = {
  getDates,
  getActs,
};
