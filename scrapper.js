const puppeteer = require('puppeteer');
const ObjectsToCsv = require('objects-to-csv');

(async () => {
  const browser = await puppeteer.launch();
  console.log('Started');
  const page = await browser.newPage();
  cities = ['S%C3%B8borg', 'kongens-lyngby', 'herlev', 'ballerup', 'Rødovre', 'bagsvaerd', 'gentofte'];
  await page.goto('https://www.boligportal.dk/lejligheder/k%C3%B8benhavn/2-3-v%C3%A6relser/?min_rental_period=12&max_monthly_rent=13500&min_size_m2=60');
  const cookieAcceptBtn = await page.$('.coi-banner__accept');
  await cookieAcceptBtn.click();
  const hrefs = await page.$$eval('.AdCardSrp__Link', as => as.map(a => a.href));
  data = [];
  for (let href of hrefs) {
    console.log(href);
    await page.goto(href);
    const priceElement = await page.waitForSelector('.css-1p985l2');
    const price = await priceElement.evaluate(el => el.textContent);
    const infoBox = await page.$$eval('.css-sg80e', as => as.map(a => a.textContent));
    const period = infoBox[2];
    const dateElement = await page.waitForSelector('.css-1xqwnoo span');
    const date = await dateElement.evaluate(el => el.textContent);
    await page.waitForSelector('.css-1sdzuqu');
    const others = await page.$$eval('.css-1sdzuqu', as => as.map(a => a.textContent));
    location = others[1];
    const elementValue = await page.$$eval('.css-uzgi25', as => as.map(a => a.textContent));
    line = { price: price, area: elementValue[1], rooms: elementValue[2], date: date, period: period, location: location, href: href };
    if (line.period != '1-11 måneder') {
      data.push(line);
    }
  }
  const csv = new ObjectsToCsv(data);
  await csv.toDisk('./test.csv');
  console.log(await csv.toString());
  await browser.close();
})();
