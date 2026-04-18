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

// Log ALL requests early
app.use((req, res, next) => {
  console.log(`[Early Log] ${req.method} ${req.url}`);
  next();
});

// --- API ROUTER (TOP PRIORITY - MOVED TO TOP) ---
const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  console.log('[API] Health check triggered');
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    path: req.url,
    originalUrl: req.originalUrl,
    msg: 'API is serving from the absolute top of Express'
  });
});

apiRouter.get('/rekomendasi', (req, res) => handleListEndpoint(req, res, (p) => `https://bacakomik.my/daftar-komik/page/${p}/?order=rating`));
apiRouter.get('/komik-terbaru', (req, res) => handleListEndpoint(req, res, (p) => `https://bacakomik.my/komik-terbaru/page/${p}/`));
apiRouter.get('/komik', (req, res) => handleListEndpoint(req, res, (p) => `https://bacakomik.my/page/${p}/`));

apiRouter.get('/daftar-genre', async (req, res) => {
  try {
    const response = await fetch(`https://bacakomik.my/daftar-genre/`, { headers });
    const html = await response.text();
    const $ = cheerio.load(html);
    const genres: any[] = [];
    $('.genrelist li').each((i, el) => {
      const title = $(el).find('a').text().trim();
      const link = $(el).find('a').attr('href');
      const id = link ? link.split('/').filter(Boolean).pop() : '';
      genres.push({ id, title, link });
    });
    res.json({ success: true, creator: "Aiman El Hanaffy", data: genres });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.get('/comic/:id', async (req, res) => {
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
      const chapterTitle = $(el).find('.lchx a').text().trim();
      const chapterLink = $(el).find('.lchx a').attr('href');
      const chapterId = chapterLink ? chapterLink.split('/').filter(Boolean).pop() : '';
      chapters.push({ id: chapterId, title: chapterTitle });
    });
    res.json({ success: true, data: { id, title, image, description, chapters } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.get('/chapter/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://bacakomik.my/${id}/`, { headers });
    const html = await response.text();
    const $ = cheerio.load(html);
    const title = $('h1[itemprop="name"]').text().trim();
    const images: string[] = [];
    $('#chimg-auh img').each((i, el) => {
      const src = $(el).attr('data-lazy-src') || $(el).attr('src');
      if (src && !src.startsWith('data:image')) images.push(src);
    });
    res.json({ success: true, data: { id, title, images } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mount API router FIRST
app.use('/api', apiRouter);

// Redirect root index directly to API health
app.get(['/', '/api'], (req, res) => {
  res.redirect('/api/health');
});

// Strict API 404 - If it starts with /api but no route matched, FAIL here.
app.use('/api', (req, res) => {
  console.log(`[API] 404 hit for: ${req.url}`);
  res.status(404).json({ success: false, error: 'API route not found', requestedPath: req.url });
});
// --- END API ROUTER ---

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

// --- END API ROUTER ---

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
  console.log(`[SSR] Rendering request for: ${req.url}`);
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
