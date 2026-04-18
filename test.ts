import * as cheerio from 'cheerio';

async function test() {
  try {
    const res = await fetch('https://bacakomik.my/magic-emperor-chapter-836/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    console.log($('#chimg-auh').html()?.substring(0, 1500));
  } catch (e) {
    console.error(e);
  }
}
test();
