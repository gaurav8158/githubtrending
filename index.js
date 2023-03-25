const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://github.com/trending');

  // Scraping Trending Repositories
  const trendingRepos = await page.evaluate(() => {
    const repoList = [];
    document.querySelectorAll('article.Box-row').forEach((repo) => {
      const title = repo.querySelector('h1.h3.lh-condensed > a').innerText.trim();
      const description = repo.querySelector('p.my-1').innerText.trim();
      const url = `https://github.com${repo.querySelector('h1.h3.lh-condensed > a').getAttribute('href')}`;
      const stars = repo.querySelector('a.muted-link:nth-child(2)').innerText.trim();
      const forks = repo.querySelector('a.muted-link:nth-child(3)').innerText.trim();
      const language = repo.querySelector('span.d-inline-block:nth-child(5)').innerText.trim();
      repoList.push({
        title,
        description,
        url,
        stars,
        forks,
        language,
      });
    });
    return repoList;
  });

  // Clicking on the Developers tab
  await page.click('a[href="/trending/developers"]');
  await page.waitForSelector('article.Box-row');

  // Scraping Trending Developers
  const trendingDevs = await page.evaluate(() => {
    const devList = [];
    document.querySelectorAll('article.Box-row').forEach((dev) => {
      const name = dev.querySelector('h1.h3.lh-condensed > a').innerText.trim();
      const username = dev.querySelector('p.f4.text-normal.mb-1 > a').innerText.trim();
      const repoName = dev.querySelector('h1.h4.lh-condensed > a').innerText.trim();
      const repoDescription = dev.querySelector('p.col-9.text-gray.my-1.pr-4').innerText.trim();
      devList.push({
        name,
        username,
        repoName,
        repoDescription,
      });
    });
    return devList;
  });

  // Storing extracted data in a JSON object
  const jsonData = {
    trendingRepos,
    trendingDevs,
  };

  // Writing the JSON object to a file
  fs.writeFileSync('data.json', JSON.stringify(jsonData, null, 2));

  console.log(jsonData);

  await browser.close();
})();