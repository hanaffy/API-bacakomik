import * as cheerio from 'cheerio';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function test() {
  const response = await fetch('https://bacakomik.my/daftar-komik/?order=rating', { headers });
  const html = await response.text();
  const $ = cheerio.load(html);
  console.log('Rating results:', $('.animepost').length);
}

test();
