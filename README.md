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
- `popup.js` - Logika popup
- `content.js` - Script untuk scraping data
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
     - Klik tombol "Cari"
     - Klik pada hasil pencarian untuk melihat detail
   - Langkah ini diperlukan agar ekstensi dapat berfungsi dengan baik

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
   - Tunggu sampai muncul notifikasi "Selesai!"
   - **Jangan tutup atau refresh halaman PDKI** saat proses berjalan

4. **Export Data**
   - Setelah proses selesai, klik **"Export JSON"** atau **"Export CSV"**
   - File akan terunduh otomatis:
     - `pdki.json` untuk format JSON
     - `pdki.csv` untuk format CSV/Excel

### Format Output

**JSON Format:**
```json
[
  {
    "kode": "1234567890",
    "nomorPencatatan": "...",
    "tanggalPencatatan": "...",
    "status": "...",
    "judul": "...",
    "pemegang": [...],
    "pencipta": [...],
    ...
  }
]
```

**CSV Format:**
- Semua data dalam format tabel
- Array (pemegang, pencipta, konsultan) diubah menjadi string dengan separator `;`

## Cara Kerja

### Arsitektur Ekstensi

Ekstensi ini menggunakan **Manifest V3** dengan komponen berikut:

1. **Content Script (`content.js`)**
   - Berjalan di halaman PDKI
   - Mengambil data dari DOM
   - Menjalankan proses scraping otomatis

2. **Popup (`popup.html` + `popup.js`)**
   - Interface pengguna
   - Mengirim perintah ke content script
   - Menangani export data

3. **Storage**
   - Menyimpan data hasil scraping
   - Menggunakan Chrome Storage API

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
   - Jika link tidak ditemukan, akan retry maksimal 3 kali
   - Setiap retry menunggu elemen muncul dengan timeout 8 detik

4. **Data Collection**
   - Data yang diambil:
     - Nomor Pencatatan
     - Tanggal Pencatatan
     - Status
     - Judul
     - Uraian Ciptaan
     - Jenis Ciptaan
     - Pemegang (array)
     - Pencipta (array)
     - Konsultan (array)
     - Data tambahan dari grid

5. **Error Handling**
   - Kode yang gagal dicatat dalam `window.__PDKI_NOT_FOUND`
   - Notifikasi menampilkan daftar kode yang gagal

### Teknologi yang Digunakan

- **Chrome Extensions API**
  - `chrome.tabs` - Mengakses tab browser
  - `chrome.scripting` - Menjalankan script di halaman
  - `chrome.storage` - Menyimpan data
  - `chrome.downloads` - Mengunduh file

- **JavaScript Features**
  - Async/Await untuk operasi asynchronous
  - DOM Manipulation untuk scraping
  - Event handling untuk interaksi

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

- Ekstensi hanya berjalan di domain `pdki-indonesia.dgip.go.id`
- Data hanya disimpan di browser lokal (Chrome Storage)
- Tidak ada data yang dikirim ke server eksternal
- Semua proses berjalan di sisi client (browser)

### ⚡ Performa

- **Delay antar request**: 500ms - 2 detik
- **Timeout per elemen**: 8 detik
- **Retry maksimal**: 3 kali per kode
- **Rekomendasi**: Jangan scrape lebih dari 50 kode sekaligus untuk menghindari timeout

### 🐛 Troubleshooting

**Masalah: Link hasil tidak ditemukan**
- Solusi: Pastikan sudah melakukan inisialisasi dengan pencarian manual
- Solusi: Tunggu beberapa detik dan coba lagi
- Solusi: Refresh halaman PDKI dan lakukan inisialisasi ulang

**Masalah: Data tidak muncul di export**
- Solusi: Pastikan proses scraping sudah selesai (tunggu notifikasi)
- Solusi: Cek console browser untuk error
- Solusi: Coba export lagi setelah proses selesai

**Masalah: Ekstensi tidak berfungsi**
- Solusi: Pastikan ekstensi sudah diaktifkan di `chrome://extensions/`
- Solusi: Reload ekstensi (klik icon reload di chrome://extensions/)
- Solusi: Pastikan halaman PDKI sudah terbuka dan sudah diinisialisasi

### 📝 Catatan Tambahan

- Ekstensi ini dibuat untuk keperluan pengambilan data secara efisien
- Gunakan dengan bijak dan sesuai dengan ketentuan penggunaan situs PDKI
- Data yang diambil adalah data publik yang tersedia di situs PDKI
- Ekstensi ini tidak mengubah atau memanipulasi data, hanya mengambil data yang sudah tersedia

### 📧 Kontak

Dibuat oleh: **ariefhyda**

---

**Versi**: 1.0  
**Manifest Version**: 3  
**Browser Support**: Google Chrome (terbaru)

