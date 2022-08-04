const puppeteer = require('puppeteer');
const ObjectsToCsv = require('objects-to-csv');

const params = {
  cities: ['københavn', 'S%C3%B8borg', 'kongens-lyngby', 'bagsvaerd', 'gentofte', 'brønshøj'],
  max_rent: 13700,
  min_size: 60,
  months: ['october', 'november', 'december', 'januar'],
};

(async () => {
  const browser = await puppeteer.launch();
  console.log('Scrapper started');
  const page = await browser.newPage();
  await page.goto('https://www.boligportal.dk/');
  const cookieAcceptBtn = await page.$('.coi-banner__accept');
  await cookieAcceptBtn.click();
  data = [];
  for (let city of params.cities) {
    console.log(city);
    await page.goto(`https://www.boligportal.dk/lejligheder/${city}/2-3-v%C3%A6relser/?min_rental_period=12&max_monthly_rent=${params.max_rent}&min_size_m2=${params.min_size}`);
    const hrefs = await page.$$eval('.AdCardSrp__Link', as => as.map(a => a.href));
    console.log(`Fetched links ${hrefs.length}`);
    const buttonText = await page.$$eval('.css-150kjhb css-z3633x', as => as.map(a => a.textContent));
    console.log(buttonText);
    for (let href of hrefs) {
      console.log(href);
      await page.goto(href);
      const priceElement = await page.waitForSelector('.css-goiemm');
      const price = await priceElement.evaluate(el => el.textContent);
      const infoBox = await page.$$eval('.css-15kk0v4', as => as.map(a => a.textContent));
      const period = infoBox[2];
      const dateElement = await page.waitForSelector('.css-apmxeo span');
      const date = await dateElement.evaluate(el => el.textContent);
      const others = await page.$$eval('.css-1bbi9fj', as => as.map(a => a.textContent));
      location = others[1];
      const elementValue = await page.$$eval('.css-1e8e3fr', as => as.map(a => a.textContent));
      line = { price: price, area: elementValue[1], rooms: elementValue[2], date: date, period: period, location: location, href: href };
      if (params.months.some(month => date.includes(month))) {
        console.log(line);
        data.push(line);
      }
    }
  }
  console.log(data);
  const csv = new ObjectsToCsv(data);
  await csv.toDisk('./apartments2.csv');
  console.log(await csv.toString());
  await browser.close();
})();
