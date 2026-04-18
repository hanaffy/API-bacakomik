import {ChangeDetectionStrategy, Component, signal, inject, computed} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {JsonPipe} from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [JsonPipe],
  template: `
    <div class="min-h-screen bg-zinc-950 text-zinc-300 p-4 md:p-8 font-sans">
      <div class="max-w-4xl mx-auto space-y-12">
        <header class="space-y-4 text-center">
          <h1 class="text-4xl font-extrabold text-emerald-400 tracking-tight">Bacakomik Scraper API</h1>
          <p class="text-zinc-500 max-w-xl mx-auto">Marketplace API untuk scraping data komik dari bacakomik.my. Klik endpoint di bawah untuk melihat data JSON mentah.</p>
        </header>

        <section class="space-y-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </span>
            <h2 class="text-2xl font-bold text-zinc-100">API Index</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (item of endpoints; track item.path) {
              <a 
                [href]="item.path" 
                target="_blank"
                class="group block p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/30 transition-all duration-300"
              >
                <div class="flex items-start justify-between">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold font-mono">GET</span>
                      <h3 class="text-zinc-100 font-semibold group-hover:text-emerald-400 transition-colors uppercase tracking-wide text-xs">{{ item.label }}</h3>
                    </div>
                    <code class="text-sm text-zinc-500 font-mono block mt-2">{{ item.path }}</code>
                  </div>
                  <span class="text-zinc-700 group-hover:text-emerald-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </span>
                </div>
              </a>
            }
          </div>
        </section>

        <section class="space-y-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <h2 class="text-2xl font-bold text-zinc-100">Live Search & Details</h2>
          </div>

          <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Search Comics</label>
              <div class="relative">
                <input 
                  #searchInput
                  type="text" 
                  placeholder="Type comic title (e.g. Solo Leveling)" 
                  class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 text-zinc-300 focus:outline-none focus:border-emerald-500 transition-all font-mono text-sm"
                  (keydown.enter)="openSearch(searchInput.value)"
                />
                <button 
                  (click)="openSearch(searchInput.value)"
                  class="absolute right-3 top-2.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-lg transition-colors text-sm"
                >
                  GO
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Get Comic Details</label>
                <div class="flex gap-2">
                  <input 
                    #comicIdInput
                    type="text" 
                    placeholder="comic-id" 
                    class="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-emerald-500 transition-all font-mono text-sm"
                  />
                  <button 
                    (click)="openDetail(comicIdInput.value)"
                    class="px-4 py-3 bg-zinc-800 border border-zinc-700 hover:border-emerald-500/50 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </button>
                </div>
              </div>

               <div class="space-y-2">
                <label class="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Read Chapter</label>
                <div class="flex gap-2">
                  <input 
                    #chapIdInput
                    type="text" 
                    placeholder="chapter-id" 
                    class="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-emerald-500 transition-all font-mono text-sm"
                  />
                  <button 
                    (click)="openChapter(chapIdInput.value)"
                    class="px-4 py-3 bg-zinc-800 border border-zinc-700 hover:border-emerald-500/50 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer class="text-center pt-8 border-t border-zinc-900">
          <p class="text-zinc-600 text-xs">Developed by Aiman El Hanaffy &bull; Built with Angular SSR</p>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(24, 24, 27, 0.5);
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(63, 63, 70, 0.8);
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(82, 82, 91, 1);
    }
  `]
})
export class App {
  endpoints = [
    { label: 'Health Check', path: '/api/health' },
    { label: 'Rekomendasi', path: '/api/rekomendasi' },
    { label: 'Komik Terbaru', path: '/api/komik-terbaru' },
    { label: 'Koleksi Komik', path: '/api/komik?limit=30' },
    { label: 'Daftar Semua Genre', path: '/api/daftar-genre' },
    { label: 'Daftar Komik A-Z', path: '/api/daftar-komik' },
    { label: 'Komik Populer', path: '/api/komik-populer' },
    { label: 'Komik Berwarna', path: '/api/komik-berwarna' },
    { label: 'Manhwa List', path: '/api/baca-manhwa' },
    { label: 'Manhua List', path: '/api/baca-manhua' },
    { label: 'Manga List', path: '/api/baca-manga' },
    { label: 'Genre: Isekai', path: '/api/genres/isekai' }
  ];

  openSearch(query: string) {
    if (query.trim()) {
      window.open(`/api/cari?q=${encodeURIComponent(query)}`, '_blank');
    }
  }

  openDetail(id: string) {
    if (id.trim()) {
      window.open(`/api/comic/${id.trim()}`, '_blank');
    }
  }

  openChapter(id: string) {
    if (id.trim()) {
      window.open(`/api/chapter/${id.trim()}`, '_blank');
    }
  }
}
