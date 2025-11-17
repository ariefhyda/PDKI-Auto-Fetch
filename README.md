# PDKI Auto Fetch

Ekstensi Chrome untuk otomatisasi pengambilan data dari situs PDKI (Pangkalan Data Kekayaan Intelektual Indonesia) milik Direktorat Jenderal Kekayaan Intelektual (DGIP).

## Instalasi

### Cara Instalasi Manual

1. **Download atau Clone Repository**
   ```bash
   git clone https://github.com/ariefhyda/PDKI-Auto-Fetch.git
   cd PDKI-Auto-Fetch
   ```

2. **Buka Chrome Extensions**
   - Buka browser Google Chrome
   - Ketik `chrome://extensions/` di address bar atau
   - Klik menu (⋮) → More tools → Extensions

3. **Aktifkan Developer Mode**
   - Toggle switch "Developer mode" di pojok kanan atas

4. **Load Extension**
   - Klik tombol "Load unpacked"
   - Pilih folder `PDKI-Auto-Fetch` yang berisi file-file ekstensi
   - Ekstensi akan muncul di daftar extensions

5. **Verifikasi Instalasi**
   - Pastikan ekstensi "PDKI Auto Fetch" muncul di daftar
   - Icon ekstensi akan muncul di toolbar Chrome

### File yang Diperlukan

Pastikan folder ekstensi berisi file-file berikut:
- `manifest.json` - Konfigurasi ekstensi
- `popup.html` - Interface pengguna
- `popup.js` - Logika popup dan export data
- `content.js` - Script untuk scraping data dari halaman PDKI
- `icon16.png` - Icon ekstensi (16x16)
- `icon48.png` - Icon ekstensi (48x48)
- `icon128.png` - Icon ekstensi (128x128)
- `README.md` - Dokumentasi (file ini)

## Cara Menggunakan

### Persiapan

1. **Buka Halaman PDKI Search**
   - Buka browser Chrome
   - Kunjungi: https://pdki-indonesia.dgip.go.id/search
   - Pastikan halaman terbuka dan aktif

2. **Inisialisasi (Penting!)**
   - Lakukan pencarian manual **sekali** untuk inisialisasi:
     - Masukkan kode pencarian (contoh: `1234567890`)
     - Klik tombol "Cari" atau tekan Enter
     - Klik pada hasil pencarian untuk melihat halaman detail
     - Pastikan halaman detail sudah terbuka dan data sudah terlihat
   - Langkah ini diperlukan agar ekstensi dapat berfungsi dengan baik
   - Tanpa inisialisasi, ekstensi mungkin tidak dapat menemukan elemen yang diperlukan

### Menggunakan Ekstensi

1. **Buka Ekstensi**
   - Klik icon ekstensi "PDKI Auto Fetch" di toolbar Chrome
   - Popup ekstensi akan muncul

2. **Input Kode Pencarian**
   - Masukkan kode-kode yang ingin di-scrape di textarea
   - Format: satu kode per baris
   - Contoh:
     ```
     1234567890
     0987654321
     1122334455
     ```

3. **Jalankan Proses**
   - Klik tombol **"Jalankan"**
   - Proses scraping akan dimulai secara otomatis
   - Status akan ditampilkan di popup: "Memproses X kode..."
   - Tunggu sampai muncul alert "Selesai!" yang menampilkan:
     - Jumlah data berhasil ditemukan
     - Jumlah kode yang gagal
     - Daftar kode yang gagal
   - **Jangan tutup atau refresh halaman PDKI** saat proses berjalan
   - **Pastikan tab PDKI tetap aktif** selama proses berjalan

4. **Export Data**
   - Setelah proses selesai, klik **"Export JSON"** atau **"Export CSV"**
   - File akan terunduh otomatis melalui Chrome Downloads API:
     - `pdki.json` untuk format JSON (dengan indentasi 2 spasi)
     - `pdki.csv` untuk format CSV (kompatibel dengan Excel)
   - Jika belum ada data, akan muncul pesan error "Belum ada data untuk diekspor!"
   - Data bisa di-export berkali-kali tanpa perlu scrape ulang (data tersimpan di Chrome Storage)

### Format Output

**JSON Format:**
```json
[
  {
    "kode": "1234567890",
    "nomorPencatatan": "000123456",
    "tanggalPencatatan": "01 Januari 2024",
    "status": "Aktif",
    "judul": "Judul Ciptaan",
    "uraianCiptaan": "Uraian lengkap ciptaan",
    "jenisCiptaan": "Karya Tulis",
    "pemegang": [
      {
        "nama": "Nama Pemegang",
        "kewarganegaraan": "Indonesia"
      }
    ],
    "pencipta": [
      {
        "nama": "Nama Pencipta",
        "kewarganegaraan": "Indonesia"
      }
    ],
    "konsultan": [
      "Nama Konsultan 1",
      "Nama Konsultan 2"
    ]
  }
]
```

**CSV Format:**
- Semua data dalam format tabel
- Array pemegang dan pencipta diubah menjadi string dengan format: `"Nama (Kewarganegaraan)"` dengan separator `; `
- Array konsultan diubah menjadi string dengan separator `; `
- Semua field di-escape untuk kompatibilitas dengan Excel

## Cara Kerja

### Arsitektur Ekstensi

Ekstensi ini menggunakan **Manifest V3** dengan komponen berikut:

1. **Content Script (`content.js`)**
   - Berjalan di halaman PDKI secara otomatis
   - Mengambil data dari DOM menggunakan selector CSS
   - Menjalankan proses scraping otomatis dengan retry mechanism
   - Menyediakan fungsi `startAuto()` dan `goToPDKI()` untuk proses scraping

2. **Popup (`popup.html` + `popup.js`)**
   - Interface pengguna (popup ekstensi)
   - Mengirim perintah ke content script menggunakan `chrome.scripting.executeScript`
   - Menangani export data (JSON dan CSV)
   - Menampilkan status dan notifikasi

3. **Storage**
   - Menyimpan data hasil scraping di `window.__PDKI_DATA` dan `window.__PDKI_NOT_FOUND`
   - Juga menyimpan data di Chrome Storage Local untuk persistensi
   - Data dapat diakses dari popup maupun content script

### Alur Kerja

1. **User Input**
   - User memasukkan kode di popup
   - Popup mengirim kode ke content script

2. **Proses Scraping**
   ```
   Untuk setiap kode:
   ├─ Set input value di form pencarian
   ├─ Klik tombol submit
   ├─ Tunggu hasil pencarian muncul
   ├─ Klik link hasil
   ├─ Tunggu halaman detail selesai loading
   ├─ Ambil data dari DOM
   └─ Simpan data
   ```

3. **Retry Mechanism**
   - Jika link tidak ditemukan atau data kosong, akan retry maksimal 3 kali
   - Setiap retry menunggu elemen muncul dengan timeout 8 detik
   - Interval pengecekan elemen: 200ms
   - Delay antar request: 500ms

4. **Data Collection**
   - Data yang diambil dari halaman detail:
     - **Nomor Pencatatan** - Nomor pencatatan hak cipta
     - **Tanggal Pencatatan** - Tanggal pencatatan
     - **Status** - Status pencatatan (aktif, dll)
     - **Judul** - Judul ciptaan
     - **Uraian Ciptaan** - Deskripsi/uraian ciptaan
     - **Jenis Ciptaan** - Jenis ciptaan
     - **Pemegang** - Array objek dengan `nama` dan `kewarganegaraan`
     - **Pencipta** - Array objek dengan `nama` dan `kewarganegaraan`
     - **Konsultan** - Array string nama konsultan
     - **Data tambahan** - Data lain dari grid (jika ada)
   - Setiap data ditambahkan field `kode` (kode pencarian yang digunakan)

5. **Error Handling**
   - Kode yang gagal dicatat dalam `window.__PDKI_NOT_FOUND`
   - Data yang berhasil dicatat dalam `window.__PDKI_DATA`
   - Data juga disimpan di Chrome Storage (`chrome.storage.local`)
   - Notifikasi alert menampilkan jumlah data berhasil dan daftar kode yang gagal

### Teknologi yang Digunakan

- **Chrome Extensions API**
  - `chrome.scripting` - Menjalankan script di halaman (executeScript)
  - `chrome.storage.local` - Menyimpan data di browser lokal
  - `chrome.downloads` - Mengunduh file hasil export

- **JavaScript Features**
  - Async/Await untuk operasi asynchronous
  - DOM Manipulation untuk scraping data
  - Event handling untuk interaksi user
  - Promise-based untuk waitForSelector
  - Blob API untuk membuat file download

## Catatan Penting

### ⚠️ Persyaratan

1. **Inisialisasi Wajib**
   - Harus melakukan pencarian manual **minimal sekali** sebelum menggunakan ekstensi
   - Tanpa inisialisasi, ekstensi mungkin tidak berfungsi dengan baik

2. **Halaman Harus Aktif**
   - Halaman PDKI Search harus terbuka dan aktif di tab browser
   - Jangan tutup atau refresh halaman saat proses scraping berjalan

3. **Koneksi Internet**
   - Pastikan koneksi internet stabil
   - Proses scraping membutuhkan koneksi untuk memuat halaman

### 🔒 Keamanan & Privasi

- Ekstensi hanya berjalan di domain `pdki-indonesia.dgip.go.id` (dikonfigurasi di `manifest.json` dengan `content_scripts.matches`)
- Data hanya disimpan di browser lokal (Chrome Storage Local)
- Tidak ada data yang dikirim ke server eksternal
- Semua proses berjalan di sisi client (browser)
- Tidak menggunakan server proxy atau API eksternal
- Content script hanya aktif di halaman PDKI
- Permissions yang digunakan hanya yang diperlukan: `scripting`, `storage`, `activeTab`, `downloads`

### ⚡ Performa

- **Delay antar request**: 500ms (0.5 detik)
- **Timeout per elemen**: 8 detik
- **Interval pengecekan**: 200ms
- **Retry maksimal**: 3 kali per kode
- **Rekomendasi**: Jangan scrape lebih dari 50 kode sekaligus untuk menghindari timeout atau masalah performa

### 🐛 Troubleshooting

**Masalah: Link hasil tidak ditemukan**
- Solusi: Pastikan sudah melakukan inisialisasi dengan pencarian manual
- Solusi: Tunggu beberapa detik dan coba lagi
- Solusi: Refresh halaman PDKI dan lakukan inisialisasi ulang

**Masalah: Data tidak muncul di export**
- Solusi: Pastikan proses scraping sudah selesai (tunggu alert "Selesai!")
- Solusi: Cek console browser (F12) untuk melihat error atau data yang diambil
- Solusi: Coba export lagi setelah proses selesai
- Solusi: Pastikan ada data yang berhasil di-scrape (cek jumlah data di alert)
- Solusi: Refresh halaman PDKI dan coba scrape lagi jika data kosong

**Masalah: Ekstensi tidak berfungsi**
- Solusi: Pastikan ekstensi sudah diaktifkan di `chrome://extensions/`
- Solusi: Reload ekstensi (klik icon reload di chrome://extensions/)
- Solusi: Pastikan halaman PDKI sudah terbuka dan sudah diinisialisasi
- Solusi: Pastikan tab PDKI adalah tab aktif saat mengklik tombol "Jalankan"
- Solusi: Cek console browser untuk melihat error JavaScript
- Solusi: Pastikan URL halaman PDKI adalah `https://pdki-indonesia.dgip.go.id/search`

### 📝 Catatan Tambahan

- Ekstensi ini dibuat untuk keperluan pengambilan data secara efisien
- Gunakan dengan bijak dan sesuai dengan ketentuan penggunaan situs PDKI
- Data yang diambil adalah data publik yang tersedia di situs PDKI
- Ekstensi ini tidak mengubah atau memanipulasi data, hanya mengambil data yang sudah tersedia
- Export data tersedia dalam 2 format: JSON (untuk programmatic) dan CSV (untuk Excel/Google Sheets)
- Data yang gagal di-scrape akan ditampilkan di alert dan bisa dicoba lagi secara manual

### 💡 Tips & Trik

- **Melihat Data di Console**: Buka Developer Tools (F12) untuk melihat data yang diambil di console
- **Debugging**: Data tersimpan di `window.__PDKI_DATA` dan `window.__PDKI_NOT_FOUND` di halaman PDKI
- **Batch Processing**: Untuk kode banyak, disarankan membagi menjadi batch kecil (misalnya 20-30 kode per batch)
- **Export Berkali-kali**: Data tersimpan di Chrome Storage, jadi bisa export berkali-kali tanpa perlu scrape ulang
- **Clear Data**: Untuk menghapus data, bisa clear Chrome Storage atau refresh halaman PDKI

### 📧 Kontak & Informasi

**Dibuat oleh:** ariefhyda  
**GitHub:** [https://github.com/ariefhyda](https://github.com/ariefhyda)  
**Repository:** [https://github.com/ariefhyda/PDKI-Auto-Fetch](https://github.com/ariefhyda/PDKI-Auto-Fetch)

---

**Versi:** 1.0  
**Manifest Version:** 3  
**Browser Support:** Google Chrome (terbaru)  
**License:** Lihat file LICENSE di repository (jika ada)

