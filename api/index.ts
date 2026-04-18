import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import * as cheerio from 'cheerio';

const app = express();
app.use(cors());

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

async function handleList(req: any, res: any, urlBuilder: (page: number) => string) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 0;
    const status = req.query.status as string;
    const type = req.query.type as string;
    
    let url = urlBuilder(page);
    const urlObj = new URL(url);
    if (status) urlObj.searchParams.set('status', status);
    if (type) urlObj.searchParams.set('type', type);
    
    const response = await fetch(urlObj.toString(), { headers });
    const html = await response.text();
    const $ = cheerio.load(html);
    let comics = extractComics($);
    const hasNextPage = $('.pagination .next').length > 0 || comics.length > 0;
    if (limit > 0) comics = comics.slice(0, limit);
    
    res.json({ success: true, creator: "Aiman El Hanaffy", pagination: { currentPage: page, hasNextPage }, data: comics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', source: 'Vercel Serverless' }));
app.get('/api/rekomendasi', (req, res) => handleList(req, res, (p) => `https://bacakomik.my/daftar-komik/page/${p}/?order=rating`));
app.get('/api/komik-terbaru', (req, res) => handleList(req, res, (p) => `https://bacakomik.my/komik-terbaru/page/${p}/`));
app.get('/api/komik', (req, res) => handleList(req, res, (p) => `https://bacakomik.my/page/${p}/`));

app.get('/api/comic/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
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
    res.json({ success: true, data: { id, title, image, description, chapters } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export default for Vercel
export default app;
