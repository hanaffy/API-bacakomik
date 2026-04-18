import {ChangeDetectionStrategy, Component, signal, inject, computed} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {JsonPipe} from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [JsonPipe],
  template: `
    <div class="min-h-screen bg-zinc-950 text-zinc-300 p-4 md:p-8 font-sans">
      <div class="max-w-6xl mx-auto space-y-8">
        <header class="space-y-4">
          <h1 class="text-3xl font-bold text-emerald-400">Free webkomik API</h1>
          <p class="text-zinc-500">Simple web API to scrape comics from bacakomik.my</p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="space-y-4 col-span-1">
            <h2 class="text-xl font-semibold text-zinc-100">Endpoints</h2>
            
            <div class="relative">
              <input 
                type="text" 
                placeholder="Search comics... (Press Enter)" 
                class="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500 transition-colors"
                (keydown.enter)="searchComics($event)"
              />
              <span class="absolute right-4 top-3.5 text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div class="flex flex-col gap-1">
                <label for="status-filter" class="text-[10px] uppercase tracking-wider text-zinc-500 font-bold ml-1">Status</label>
                <select 
                  id="status-filter"
                  (change)="updateStatus($event)"
                  class="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="ongoing">Ongoing</option>
                </select>
              </div>
              <div class="flex flex-col gap-1">
                <label for="type-filter" class="text-[10px] uppercase tracking-wider text-zinc-500 font-bold ml-1">Type</label>
                <select 
                  id="type-filter"
                  (change)="updateType($event)"
                  class="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  <option value="">All Types</option>
                  <option value="manga">Manga</option>
                  <option value="manhwa">Manhwa</option>
                  <option value="manhua">Manhua</option>
                </select>
              </div>
            </div>

            <div class="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <button 
                (click)="fetchData('/api/rekomendasi')"
                class="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-colors group"
                [class.border-emerald-500]="currentEndpoint() === '/api/rekomendasi'"
              >
                <div class="text-xs text-emerald-500 font-semibold mb-1 font-mono">GET</div>
                <div class="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors font-mono">/api/rekomendasi</div>
              </button>
              <button 
                (click)="fetchData('/api/komik')"
                class="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-colors group"
                [class.border-emerald-500]="currentEndpoint() === '/api/komik'"
              >
                <div class="text-xs text-emerald-500 font-semibold mb-1 font-mono">GET</div>
                <div class="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors font-mono">/api/komik</div>
              </button>

              <button 
                (click)="fetchData('/api/komik-terbaru')"
                class="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-colors group"
                [class.border-emerald-500]="currentEndpoint() === '/api/komik-terbaru'"
              >
                <div class="text-xs text-emerald-500 font-semibold mb-1 font-mono">GET</div>
                <div class="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors font-mono">/api/komik-terbaru</div>
              </button>

              <button 
                (click)="fetchData('/api/daftar-genre')"
                class="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-colors group"
                [class.border-emerald-500]="currentEndpoint() === '/api/daftar-genre'"
              >
                <div class="text-xs text-emerald-500 font-semibold mb-1 font-mono">GET</div>
                <div class="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors font-mono">/api/daftar-genre</div>
              </button>

              <button 
                (click)="fetchData('/api/daftar-komik')"
                class="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-colors group"
                [class.border-emerald-500]="currentEndpoint() === '/api/daftar-komik'"
              >
                <div class="text-xs text-emerald-500 font-semibold mb-1 font-mono">GET</div>
                <div class="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors font-mono">/api/daftar-komik</div>
              </button>

              <button 
                (click)="fetchData('/api/komik-populer')"
                class="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-colors group"
                [class.border-emerald-500]="currentEndpoint() === '/api/komik-populer'"
              >
                <div class="text-xs text-emerald-500 font-semibold mb-1 font-mono">GET</div>
                <div class="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors font-mono">/api/komik-populer</div>
              </button>

              <button 
                (click)="fetchData('/api/komik-berwarna')"
                class="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-colors group"
                [class.border-emerald-500]="currentEndpoint() === '/api/komik-berwarna'"
              >
                <div class="text-xs text-emerald-500 font-semibold mb-1 font-mono">GET</div>
                <div class="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors font-mono">/api/komik-berwarna</div>
              </button>

              <button 
                (click)="fetchData('/api/baca-manhwa')"
                class="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-colors group"
                [class.border-emerald-500]="currentEndpoint() === '/api/baca-manhwa'"
              >
                <div class="text-xs text-emerald-500 font-semibold mb-1 font-mono">GET</div>
                <div class="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors font-mono">/api/baca-manhwa</div>
              </button>

              <button 
                (click)="fetchData('/api/baca-manhua')"
                class="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-colors group"
                [class.border-emerald-500]="currentEndpoint() === '/api/baca-manhua'"
              >
                <div class="text-xs text-emerald-500 font-semibold mb-1 font-mono">GET</div>
                <div class="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors font-mono">/api/baca-manhua</div>
              </button>

              <button 
                (click)="fetchData('/api/baca-manga')"
                class="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-colors group"
                [class.border-emerald-500]="currentEndpoint() === '/api/baca-manga'"
              >
                <div class="text-xs text-emerald-500 font-semibold mb-1 font-mono">GET</div>
                <div class="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors font-mono">/api/baca-manga</div>
              </button>

              <button 
                (click)="fetchData('/api/genres/isekai')"
                class="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-colors group"
                [class.border-emerald-500]="currentEndpoint() === '/api/genres/isekai'"
              >
                <div class="text-xs text-emerald-500 font-semibold mb-1 font-mono">GET</div>
                <div class="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors font-mono">/api/genres/isekai</div>
              </button>

              <button 
                (click)="fetchData('/api/genres/ecchi')"
                class="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-colors group"
                [class.border-emerald-500]="currentEndpoint() === '/api/genres/ecchi'"
              >
                <div class="text-xs text-emerald-500 font-semibold mb-1 font-mono">GET</div>
                <div class="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors font-mono">/api/genres/ecchi</div>
              </button>
            </div>
          </div>

          <div class="col-span-1 md:col-span-3">
            <div class="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col h-[800px]">
              <div class="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="text-sm text-zinc-400 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Response
                  </div>
                  <div class="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                    <button 
                      (click)="viewMode.set('ui')" 
                      class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
                      [class.bg-zinc-800]="viewMode() === 'ui'"
                      [class.text-zinc-100]="viewMode() === 'ui'"
                      [class.text-zinc-500]="viewMode() !== 'ui'"
                    >UI Preview</button>
                    <button 
                      (click)="viewMode.set('json')" 
                      class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
                      [class.bg-zinc-800]="viewMode() === 'json'"
                      [class.text-zinc-100]="viewMode() === 'json'"
                      [class.text-zinc-500]="viewMode() !== 'json'"
                    >JSON</button>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  @if (history().length > 1) {
                    <button (click)="goBack()" class="text-xs text-zinc-400 hover:text-emerald-400 transition-colors">
                      &larr; Back
                    </button>
                  }
                  @if (loading()) {
                    <div class="text-xs text-emerald-500 animate-pulse">Fetching...</div>
                  }
                </div>
              </div>
              <div class="p-4 overflow-auto flex-1 relative custom-scrollbar">
                @if (error()) {
                  <div class="text-red-400 text-sm">{{ error() }}</div>
                } @else if (data()) {
                  @if (viewMode() === 'json') {
                    <pre class="text-xs text-zinc-300 leading-relaxed font-mono">{{ data() | json }}</pre>
                  } @else {
                    @if (dataType() === 'comic-list') {
                      <div class="flex flex-col h-full">
                        <div class="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 content-start">
                          @for (comic of $any(data())['data']; track comic['id']) {
                            <div class="cursor-pointer group flex flex-col" tabindex="0" (keyup.enter)="fetchData('/api/comic/' + comic['id'])" (click)="fetchData('/api/comic/' + comic['id'])">
                              <div class="aspect-[3/4] overflow-hidden rounded-lg bg-zinc-800 mb-2 relative">
                                <img [src]="comic['image']" [alt]="comic['title']" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerpolicy="no-referrer" />
                                @if (comic['type']) {
                                  <div class="absolute top-2 right-2 px-2 py-0.5 bg-zinc-900/80 backdrop-blur text-[10px] font-bold text-emerald-400 rounded uppercase tracking-wider flex items-center gap-1">
                                    @if (comic['type'].toLowerCase() === 'manhwa') {
                                      <span class="text-xs leading-none">🇰🇷</span>
                                    } @else if (comic['type'].toLowerCase() === 'manhua') {
                                      <span class="text-xs leading-none">🇨🇳</span>
                                    } @else if (comic['type'].toLowerCase() === 'manga') {
                                      <span class="text-xs leading-none">🇯🇵</span>
                                    }
                                    {{ comic['type'] }}
                                  </div>
                                }
                              </div>
                              <h3 class="text-sm font-semibold line-clamp-2 group-hover:text-emerald-400 transition-colors leading-snug">{{ comic['title'] }}</h3>
                              <div class="text-xs text-zinc-500 mt-auto pt-1 flex items-center justify-between">
                                <span>{{ comic['chapter'] || 'No Chapter' }}</span>
                                @if (comic['rating']) {
                                  <span class="flex items-center gap-1 text-yellow-500">
                                    ★ {{ comic['rating'] }}
                                  </span>
                                }
                              </div>
                              @if (comic['timestamp'] || comic['status']) {
                                <div class="text-[10px] text-zinc-600 mt-1 flex justify-between items-center">
                                  <span>{{ comic['timestamp'] }}</span>
                                  @if (comic['status']) {
                                    <span class="text-emerald-500/80 font-medium">{{ comic['status'] }}</span>
                                  }
                                </div>
                              }
                            </div>
                          }
                        </div>
                        
                        @if ($any(data())['pagination']) {
                          <div class="mt-8 pt-4 border-t border-zinc-800 flex items-center justify-between sticky bottom-0 bg-zinc-900/90 backdrop-blur pb-2">
                            <div class="flex items-center gap-2">
                              <span class="text-xs text-zinc-400">Items per page:</span>
                              <select 
                                class="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
                                [value]="currentLimit()"
                                (change)="changeLimit($event)"
                              >
                                <option value="0">Default</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                              </select>
                            </div>
                            
                            <div class="flex items-center gap-4">
                              <button 
                                (click)="changePage(-1)" 
                                [disabled]="$any(data())['pagination'].currentPage <= 1"
                                class="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Previous
                              </button>
                              <span class="text-sm text-zinc-400 font-medium">
                                Page {{ $any(data())['pagination'].currentPage }}
                              </span>
                              <button 
                                (click)="changePage(1)" 
                                [disabled]="!$any(data())['pagination'].hasNextPage"
                                class="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    } @else if (dataType() === 'comic-detail') {
                      <div class="space-y-6 max-w-4xl mx-auto">
                        <div class="flex flex-col sm:flex-row gap-6">
                          <div class="w-48 shrink-0 mx-auto sm:mx-0">
                            <img [src]="$any(data())['data']['image']" [alt]="$any(data())['data']['title']" class="w-full rounded-xl shadow-2xl" referrerpolicy="no-referrer" />
                          </div>
                          <div class="space-y-4">
                            <h2 class="text-2xl sm:text-3xl font-bold text-zinc-100">{{ $any(data())['data']['title'] }}</h2>
                            
                            <div class="flex flex-wrap items-center gap-3 text-sm">
                              @if ($any(data())['data']['type']) {
                                <div class="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/80 border border-zinc-700 rounded-lg text-emerald-400 font-medium">
                                  @if ($any(data())['data']['type'].toLowerCase() === 'manhwa') {
                                    <span class="text-base leading-none">🇰🇷</span>
                                  } @else if ($any(data())['data']['type'].toLowerCase() === 'manhua') {
                                    <span class="text-base leading-none">🇨🇳</span>
                                  } @else if ($any(data())['data']['type'].toLowerCase() === 'manga') {
                                    <span class="text-base leading-none">🇯🇵</span>
                                  }
                                  {{ $any(data())['data']['type'] }}
                                </div>
                              }
                              @if ($any(data())['data']['status']) {
                                <div class="px-2.5 py-1 bg-zinc-800/80 border border-zinc-700 rounded-lg text-zinc-300">
                                  Status: <span class="text-emerald-400">{{ $any(data())['data']['status'] }}</span>
                                </div>
                              }
                            </div>

                            <div class="flex flex-wrap gap-2">
                              @for (genre of $any(data())['data']['genres']; track genre) {
                                <span class="px-2.5 py-1 bg-zinc-800/80 border border-zinc-700 rounded-full text-xs text-zinc-300">{{ genre }}</span>
                              }
                            </div>
                            <div class="prose prose-invert prose-sm max-w-none text-zinc-400">
                              <p>{{ $any(data())['data']['description'] }}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div class="space-y-4 bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50">
                          <h3 class="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                            <span class="w-1.5 h-5 bg-emerald-500 rounded-full"></span>
                            Chapters ({{ $any(data())['data']['chapters']?.length || 0 }})
                          </h3>
                          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            @for (chapter of $any(data())['data']['chapters']; track chapter['id']) {
                              <button (click)="fetchData('/api/chapter/' + chapter['id'])" class="text-left p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800 transition-all flex justify-between items-center group">
                                <span class="text-sm font-medium text-zinc-300 group-hover:text-emerald-400 transition-colors line-clamp-1 truncate mr-2">{{ chapter['title'] }}</span>
                                <span class="text-[10px] text-zinc-500 shrink-0 whitespace-nowrap">{{ chapter['date'] }}</span>
                              </button>
                            }
                          </div>
                        </div>
                      </div>
                    } @else if (dataType() === 'chapter') {
                      <div class="space-y-6">
                        <h2 class="text-xl font-bold text-zinc-100 text-center sticky top-0 bg-zinc-900/90 backdrop-blur py-4 z-10 border-b border-zinc-800 -mt-4 -mx-4 px-4">
                          {{ $any(data())['data']['title'] }}
                        </h2>
                        <div class="flex flex-col items-center gap-0 max-w-3xl mx-auto bg-black">
                          @for (img of $any(data())['data']['images']; track img) {
                            <img [src]="img" alt="Chapter image" class="w-full h-auto" referrerpolicy="no-referrer" loading="lazy" />
                          }
                        </div>
                      </div>
                    } @else if (dataType() === 'genre-list') {
                      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        @for (genre of $any(data())['data']; track genre['id']) {
                          <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 text-center hover:border-emerald-500/50 hover:text-emerald-400 transition-colors cursor-pointer">
                            {{ genre['title'] }}
                          </div>
                        }
                      </div>
                    }
                  }
                } @else {
                  <div class="text-zinc-600 text-sm h-full flex flex-col items-center justify-center gap-4">
                    <div class="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center">
                      <svg class="w-8 h-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    Select an endpoint to view response
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
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
  private http = inject(HttpClient);
  
  data = signal<Record<string, unknown> | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  currentEndpoint = signal<string | null>(null);
  baseEndpoint = signal<string | null>(null);
  viewMode = signal<'json' | 'ui'>('ui');
  history = signal<{endpoint: string, base: string, page: number, limit: number}[]>([]);
  
  currentPage = signal(1);
  currentLimit = signal(0); // 0 means default/all from page
  currentStatus = signal<string>('');
  currentType = signal<string>('');

  dataType = computed(() => {
    const d = this.data()?.['data'] as Record<string, unknown> | Record<string, unknown>[];
    if (!d) return null;
    
    if (Array.isArray(d)) {
      if (d.length > 0 && d[0]['title'] && !d[0]['image'] && d[0]['link']) {
        return 'genre-list';
      }
      return 'comic-list';
    }
    
    if (d['chapters'] && Array.isArray(d['chapters'])) {
      return 'comic-detail';
    }
    
    if (d['images'] && Array.isArray(d['images'])) {
      return 'chapter';
    }
    
    return null;
  });

  fetchData(endpoint: string, addToHistory = true, page = 1, limit = 0) {
    let fullEndpoint = endpoint;
    const isListEndpoint = endpoint.startsWith('/api/') && !endpoint.includes('/comic/') && !endpoint.includes('/chapter/') && endpoint !== '/api/daftar-genre';
    
    if (isListEndpoint) {
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('limit', limit.toString());
      if (this.currentStatus()) url.searchParams.set('status', this.currentStatus());
      if (this.currentType()) url.searchParams.set('type', this.currentType());
      fullEndpoint = url.pathname + url.search;
    }

    if (addToHistory) {
      this.history.update(h => [...h, { endpoint: fullEndpoint, base: endpoint, page, limit }]);
    }
    this.currentEndpoint.set(fullEndpoint);
    this.baseEndpoint.set(endpoint);
    this.currentPage.set(page);
    this.currentLimit.set(limit);
    
    this.loading.set(true);
    this.error.set(null);

    this.http.get(fullEndpoint).subscribe({
      next: (res) => {
        this.data.set(res as Record<string, unknown>);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('API Error:', err);
        const errorMessage = err.error?.message || err.message || 'An error occurred while fetching data';
        this.error.set(errorMessage);
        this.loading.set(false);
      }
    });
  }

  changePage(delta: number) {
    const newPage = this.currentPage() + delta;
    if (newPage >= 1 && this.baseEndpoint()) {
      this.fetchData(this.baseEndpoint()!, true, newPage, this.currentLimit());
    }
  }

  changeLimit(event: Event) {
    const select = event.target as HTMLSelectElement;
    const limit = parseInt(select.value, 10);
    if (this.baseEndpoint()) {
      this.fetchData(this.baseEndpoint()!, true, 1, limit);
    }
  }

  searchComics(event: Event) {
    const input = event.target as HTMLInputElement;
    const query = input.value.trim();
    if (query) {
      this.fetchData(`/api/cari?q=${encodeURIComponent(query)}`);
    }
  }

  updateStatus(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.currentStatus.set(select.value);
    if (this.baseEndpoint()) {
      this.fetchData(this.baseEndpoint()!, true, 1, this.currentLimit());
    }
  }

  updateType(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.currentType.set(select.value);
    if (this.baseEndpoint()) {
      this.fetchData(this.baseEndpoint()!, true, 1, this.currentLimit());
    }
  }

  goBack() {
    const h = this.history();
    if (h.length > 1) {
      const newHistory = h.slice(0, -1);
      this.history.set(newHistory);
      const prev = newHistory[newHistory.length - 1];
      this.fetchData(prev.base, false, prev.page, prev.limit);
    }
  }
}
