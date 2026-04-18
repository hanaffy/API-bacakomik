import * as cheerio from 'cheerio';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function test(url: string) {
  try {
    const res = await fetch(url, { headers });
    const html = await res.text();
    const $ = cheerio.load(html);
    console.log(`\n--- ${url} ---`);
    console.log($('.animepost').eq(5).html());
  } catch (e) {
    console.error(e);
  }
}

async function run() {
  await test('https://bacakomik.my/komik-tamat/');
}
run();
