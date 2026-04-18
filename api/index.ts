import { VercelRequest, VercelResponse } from '@vercel/node';
import * as cheerio from 'cheerio';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

function extractComics($: cheerio.CheerioAPI): Record<string, unknown>[] {
  const comics: Record<string, unknown>[] = [];
  $('.animepost').each((i, el) => {
    const title = $(el).find('h4').text().trim();
    const link = $(el).find('a').attr('href');
    const id = link ? link.split('/').filter(Boolean).pop() : '';
    let image = $(el).find('img').attr('data-lazy-src') || $(el).find('img').attr('src');
    if (!image || image.startsWith('data:image')) {
      image = $(el).find('noscript img').attr('src');
    }
    const type = $(el).find('.typeflag').attr('class')?.replace('typeflag', '').trim() || '';
    const chapter = $(el).find('.lsch a').text().trim();
    const rating = $(el).find('.rating i').text().trim();
    const timestamp = $(el).find('.datech').text().trim();
    comics.push({ id, title, image, type, chapter, rating, timestamp, link });
  });
  return comics;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Manual Routing inside the handler
  const { url = '' } = req;
  const path = url.split('?')[0];

  try {
    if (path === '/api/health') {
      return res.json({ status: 'ok', source: 'Vercel Serverless Native', time: new Date().toISOString() });
    }

    if (path === '/api/rekomendasi' || path === '/api/komik' || path === '/api/komik-terbaru') {
      const page = parseInt(req.query.page as string) || 1;
      const baseUrl = path === '/api/komik' ? 'https://bacakomik.my/' : 
                      path === '/api/komik-terbaru' ? 'https://bacakomik.my/komik-terbaru/' : 
                      'https://bacakomik.my/daftar-komik/';
      
      let fetchUrl = `${baseUrl}page/${page}/`;
      if (path === '/api/rekomendasi') fetchUrl += '?order=rating';
      
      const response = await fetch(fetchUrl, { headers });
      const html = await response.text();
      const $ = cheerio.load(html);
      const comics = extractComics($);
      const hasNextPage = $('.pagination .next').length > 0 || comics.length > 0;
      
      return res.json({ success: true, creator: "Aiman El Hanaffy", pagination: { currentPage: page, hasNextPage }, data: comics });
    }

    if (path.startsWith('/api/comic/')) {
      const id = path.replace('/api/comic/', '');
      const response = await fetch(`https://bacakomik.my/komik/${id}/`, { headers });
      const html = await response.text();
      const $ = cheerio.load(html);
      const title = $('h1[itemprop="name"]').text().trim();
      let image = $('.thumb img').attr('data-lazy-src') || $('.thumb img').attr('src');
      const description = $('div[itemprop="description"]').text().trim();
      const chapters: any[] = [];
      $('#chapter_list li').each((i, el) => {
        const cTitle = $(el).find('.lchx a').text().trim();
        const cLink = $(el).find('.lchx a').attr('href');
        const cId = cLink ? cLink.split('/').filter(Boolean).pop() : '';
        chapters.push({ id: cId, title: cTitle });
      });
      return res.json({ success: true, data: { id, title, image, description, chapters } });
    }

    return res.status(404).json({ success: false, message: `Route ${path} not found` });
  } catch (error: any) {
    console.error('Serverless Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
