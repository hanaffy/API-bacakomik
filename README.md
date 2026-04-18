# Bacakomik Scraper API

API Web sederhana untuk melakukan scraping data komik dari bacakomik.my dan mengembalikannya dalam format JSON yang rapi. Dibangun menggunakan Angular untuk antarmuka demo dan Express.js untuk backend API.

## Fitur

- **Daftar Komik**: Mendapatkan daftar komik terbaru, populer, dan rekomendasi.
- **Pencarian**: Cari komik berdasarkan judul.
- **Filter**: Filter komik berdasarkan status (Completed/Ongoing) dan tipe (Manga/Manhwa/Manhua).
- **Genre**: Mendapatkan daftar genre dan komik berdasarkan genre tertentu.
- **Detail Komik**: Informasi lengkap komik termasuk daftar chapter.
- **Baca Chapter**: Mendapatkan daftar gambar untuk setiap chapter.
- **Pagination**: Dukungan pemuatan data per halaman.

## Panduan Penginstalan

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini di lingkungan lokal Anda.

### Prasyarat

- [Node.js](https://nodejs.org/) (Versi 18 atau lebih baru direkomendasikan)
- [npm](https://www.npmjs.com/) (Biasanya disertakan dalam instalasi Node.js)

### Langkah-langkah

1. **Clone Repositori**
   ```bash
   git clone <url-repositori-anda>
   cd bacakomik-scraper-api
   ```

2. **Instal Dependensi**
   Gunakan npm untuk menginstal semua paket yang diperlukan:
   ```bash
   npm install
   ```

3. **Konfigurasi Lingkungan (Opsional)**
   Jika Anda memiliki kunci API atau variabel lingkungan khusus, buat file `.env` di direktori akar. Untuk saat ini, aplikasi ini bekerja langsung tanpa kunci API pihak ketiga.

4. **Menjalankan dalam Mode Pengembangan**
   Untuk menjalankan frontend dan backend secara bersamaan dengan fitur auto-reload:
   ```bash
   npm run dev
   ```
   Aplikasi akan tersedia di `http://localhost:3000`.

5. **Deployment ke Vercel**
   Aplikasi ini sudah dikonfigurasi untuk Vercel. Pastikan Anda memilih framework **Angular** saat melakukan import proyek di Vercel. File `vercel.json` di direktori akar akan menangani perutean API secara otomatis sehingga `/api/*` dapat berfungsi dengan benar.

6. **Membangun untuk Produksi**
   Jika Anda ingin menjalankan aplikasi dalam mode produksi:
   ```bash
   npm run build
   npm start
   ```

## Dokumentasi API (Endpoints)

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `GET` | `/api/komik` | Daftar komik umum |
| `GET` | `/api/komik-terbaru` | Daftar komik yang baru diperbarui |
| `GET` | `/api/rekomendasi` | Daftar komik rekomendasi (berdasarkan rating) |
| `GET` | `/api/cari?q={query}` | Mencari komik berdasarkan judul |
| `GET` | `/api/comic/{id}` | Detail komik berdasarkan ID |
| `GET` | `/api/chapter/{id}` | Daftar gambar chapter berdasarkan ID |
| `GET` | `/api/daftar-genre` | Daftar semua genre yang tersedia |

**Parameter Query Opsional:**
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah item per halaman
- `status`: `completed` atau `ongoing`
- `type`: `manga`, `manhwa`, atau `manhua`

## Teknologi yang Digunakan

- **Frontend**: Angular v19+ (Zoneless)
- **Backend**: Node.js & Express.js
- **Scraping**: Cheerio
- **Styling**: Tailwind CSS

## Lisensi

Proyek ini dibuat untuk tujuan pembelajaran. Data yang diambil adalah milik dari sumber aslinya (bacakomik.my).
