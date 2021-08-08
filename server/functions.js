const getDates = async (page, phrase) => {
  await page.goto(
    `https://sso.agc.gov.sg/Search/Content?Phrase=${phrase}&PhraseType=AllTheseWords&In=InForce_Act_SL&Within=title`
  );

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

module.exports = {
  getDates,
};
