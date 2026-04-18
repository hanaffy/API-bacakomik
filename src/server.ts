import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import cors from 'cors';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const browserDistFolder = join(__dirname, '../browser');

const app = express();
app.use(cors());

// Logging middleware untuk mambantu debug di Vercel/Logs
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

const angularApp = new AngularNodeAppEngine();

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

async function handleListEndpoint(req: express.Request, res: express.Response, urlBuilder: (page: number) => string) {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 0;
    const status = req.query['status'] as string;
    const type = req.query['type'] as string;
    const order = req.query['order'] as string;
    
    let url = urlBuilder(page);
    const urlObj = new URL(url);
    
    if (status) urlObj.searchParams.set('status', status);
    if (type) urlObj.searchParams.set('type', type);
    if (order) urlObj.searchParams.set('order', order);
    
    url = urlObj.toString();
    console.log(`[Scraper] Fetching: ${url}`);
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from source: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    let comics = extractComics($);
    
    const hasNextPage = $('.pagination .next').length > 0 || comics.length > 0;
    
    if (limit > 0) {
      comics = comics.slice(0, limit);
    }
    
    res.json({ 
      success: true, 
      creator: "Aiman El Hanaffy", 
      pagination: {
        currentPage: page,
        limit: limit || comics.length,
        hasNextPage
      },
      data: comics 
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, creator: "Aiman El Hanaffy", message: err.message });
  }
}

// API Endpoints - Menggunakan array rute untuk mendukung dengan/tanpa trailing slash
const apiRoutes = [
  { path: '/api/health', handler: (req: any, res: any) => res.json({ status: 'ok', time: new Date().toISOString(), url: req.originalUrl }) },
  { path: '/api/komik', builder: (page: number) => `https://bacakomik.my/page/${page}/` },
  { path: '/api/komik-terbaru', builder: (page: number) => `https://bacakomik.my/komik-terbaru/page/${page}/` },
  { path: '/api/daftar-komik', builder: (page: number) => `https://bacakomik.my/daftar-komik/page/${page}/` },
  { path: '/api/komik-populer', builder: (page: number) => `https://bacakomik.my/komik-populer/page/${page}/` },
  { path: '/api/komik-berwarna', builder: (page: number) => `https://bacakomik.my/komik-berwarna/page/${page}/` },
  { path: '/api/baca-manhwa', builder: (page: number) => `https://bacakomik.my/baca-manhwa/page/${page}/` },
  { path: '/api/baca-manhua', builder: (page: number) => `https://bacakomik.my/baca-manhua/page/${page}/` },
  { path: '/api/baca-manga', builder: (page: number) => `https://bacakomik.my/baca-manga/page/${page}/` },
  { path: '/api/rekomendasi', builder: (page: number) => `https://bacakomik.my/daftar-komik/page/${page}/?order=rating` }
];

// Daftarkan rute dasar
apiRoutes.forEach(route => {
  const paths = [route.path, `${route.path}/`];
  if (route.handler) {
    app.get(paths, route.handler);
  } else if (route.builder) {
    app.get(paths, (req, res) => handleListEndpoint(req, res, route.builder!));
  }
});

app.get(['/api/genres/:genre', '/api/genres/:genre/'], (req, res) => handleListEndpoint(req, res, (page) => `https://bacakomik.my/genres/${req.params['genre']}/page/${page}/`));

app.get(['/api/cari', '/api/cari/'], (req, res) => {
  const query = req.query['q'] as string || '';
  return handleListEndpoint(req, res, (page) => `https://bacakomik.my/page/${page}/?s=${encodeURIComponent(query)}`);
});

app.get(['/api/daftar-genre', '/api/daftar-genre/'], async (req, res) => {
  try {
    const response = await fetch(`https://bacakomik.my/daftar-genre/`, { headers });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const genres: Record<string, unknown>[] = [];
    $('.genrelist li').each((i, el) => {
      const title = $(el).find('a').text().trim();
      const link = $(el).find('a').attr('href');
      const id = link ? link.split('/').filter(Boolean).pop() : '';
      genres.push({ id, title, link });
    });
    
    res.json({ success: true, creator: "Aiman El Hanaffy", data: genres });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, creator: "Aiman El Hanaffy", message: err.message });
  }
});

app.get(['/api/comic/:id', '/api/comic/:id/'], async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://bacakomik.my/komik/${id}/`, { headers });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const title = $('h1[itemprop="name"]').text().trim();
    let image = $('.thumb img').attr('data-lazy-src') || $('.thumb img').attr('src');
    if (!image || image.startsWith('data:image')) {
      image = $('.thumb noscript img').attr('src');
    }
    const description = $('div[itemprop="description"]').text().trim();
    
    const status = $('.spe span:contains("Status:")').text().replace('Status:', '').trim();
    const type = $('.spe span:contains("Jenis Komik:") a').text().trim();
    
    const genres: string[] = [];
    $('.genre-info a').each((i, el) => {
      genres.push($(el).text().trim());
    });
    
    const chapters: Record<string, unknown>[] = [];
    $('#chapter_list li').each((i, el) => {
      const chapterTitle = $(el).find('.lchx a').text().trim();
      const chapterLink = $(el).find('.lchx a').attr('href');
      const chapterId = chapterLink ? chapterLink.split('/').filter(Boolean).pop() : '';
      const chapterDate = $(el).find('.dt a').text().trim();
      chapters.push({ id: chapterId, title: chapterTitle, link: chapterLink, date: chapterDate });
    });
    
    res.json({ success: true, creator: "Aiman El Hanaffy", data: { id, title, image, description, status, type, genres, chapters } });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, creator: "Aiman El Hanaffy", message: err.message });
  }
});

app.get(['/api/chapter/:id', '/api/chapter/:id/'], async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://bacakomik.my/${id}/`, { headers });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const title = $('h1[itemprop="name"]').text().trim();
    
    const images: string[] = [];
    $('#chimg-auh img').each((i, el) => {
      let src = $(el).attr('data-lazy-src') || $(el).attr('src');
      if (!src || src.startsWith('data:image')) {
        // try to find noscript sibling or child
        const noscriptSrc = $(el).next('noscript').find('img').attr('src');
        if (noscriptSrc) {
          src = noscriptSrc;
        }
      }
      if (src && !src.startsWith('data:image')) {
        images.push(src);
      }
    });
    
    res.json({ success: true, creator: "Aiman El Hanaffy", data: { id, title, images } });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, creator: "Aiman El Hanaffy", message: err.message });
  }
});

// Handle /api/* errors or 404s specifically
app.use('/api', (req, res, next) => {
  res.status(404).json({ 
    success: false, 
    message: `Endpoint ${req.originalUrl} not found on this server`,
    suggestion: 'Try /api/health to check server status'
  });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
