import * as cheerio from 'cheerio';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function test() {
  const params = [
    'status=completed',
    'status=ongoing',
    'type=manga',
    'type=manhwa',
    'type=manhua'
  ];

  for (const p of params) {
    const url = `https://bacakomik.my/daftar-komik/?${p}`;
    const response = await fetch(url, { headers });
    const html = await response.text();
    const $ = cheerio.load(html);
    console.log(`URL: ${url} | Results: ${$('.animepost').length}`);
  }
}

test();
