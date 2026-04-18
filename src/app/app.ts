import {ChangeDetectionStrategy, Component, signal, inject, computed} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {JsonPipe} from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [],
  template: `
    <div class="min-h-screen bg-white text-black font-mono p-8 text-sm">
      <div class="max-w-3xl mx-auto space-y-8">
        <div class="border-b border-black pb-4">
          <h1 class="text-xl font-bold uppercase tracking-tighter">Index of /api</h1>
          <p class="mt-1 opacity-60 italic">Comic Scraper API &bull; Created by Aiman El Hanaffy</p>
        </div>

        <ul class="space-y-3">
          <li class="flex items-center gap-4">
            <span class="w-12 opacity-40">[DIR]</span>
            <a href="/api/health" target="_blank" class="hover:underline">health/</a>
          </li>
          <li class="flex items-center gap-4">
            <span class="w-12 opacity-40">[DIR]</span>
            <a href="/api/rekomendasi" target="_blank" class="hover:underline">rekomendasi/</a>
          </li>
          <li class="flex items-center gap-4">
            <span class="w-12 opacity-40">[DIR]</span>
            <a href="/api/komik-terbaru" target="_blank" class="hover:underline">komik-terbaru/</a>
          </li>
           <li class="flex items-center gap-4">
            <span class="w-12 opacity-40">[DIR]</span>
            <a href="/api/komik" target="_blank" class="hover:underline">komik/</a>
          </li>
           <li class="flex items-center gap-4">
            <span class="w-12 opacity-40">[DIR]</span>
            <a href="/api/daftar-genre" target="_blank" class="hover:underline">daftar-genre/</a>
          </li>
          <li class="flex items-center gap-4">
            <span class="w-12 opacity-40">[DIR]</span>
            <a href="/api/komik-populer" target="_blank" class="hover:underline">komik-populer/</a>
          </li>
        </ul>

        <hr class="border-zinc-200" />

        <div class="space-y-6">
          <div class="space-y-2">
            <p class="font-bold uppercase text-[10px] tracking-widest opacity-40">Dynamic Request</p>
            <div class="flex gap-2">
              <span class="opacity-40">CARI:</span>
              <input #s class="border-b border-black outline-none w-48" placeholder="search..." (keydown.enter)="open('/api/cari?q=' + s.value)" />
            </div>
            <div class="flex gap-2 text-xs">
              <span class="opacity-40">COMIC:</span>
              <input #c class="border-b border-black outline-none w-32" placeholder="comic-id" (keydown.enter)="open('/api/comic/' + c.value)" />
              <span class="ml-4 opacity-40">CHAPTER:</span>
              <input #h class="border-b border-black outline-none w-32" placeholder="chapter-id" (keydown.enter)="open('/api/chapter/' + h.value)" />
            </div>
          </div>
        </div>

        <footer class="pt-8 text-[10px] opacity-30 border-t border-zinc-100">
          Apache/2.4.41 (Ubuntu) Server at ais-dev-ju6dzfav Port 3000
        </footer>
      </div>
    </div>
  `,
  styles: []
})
export class App {
  open(url: string) {
    if (url) window.open(url, '_blank');
  }
}
