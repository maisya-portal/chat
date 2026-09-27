# Panduan Setup Google Spreadsheet & Google Apps Script (DB_MAISYA_CHAT)
**Pondok Pesantren Imam Syafi'i Brebes - Maisya Chat Room**

---

### Informasi Tautan Proyek Anda:
- **Spreadsheet ID:** `1H_dZ6byEONLRbb-7kaY6UH59OTX1eOJ9aHSsHifqeQw`
- **Spreadsheet URL:** [Buka Google Spreadsheet](https://docs.google.com/spreadsheets/d/1H_dZ6byEONLRbb-7kaY6UH59OTX1eOJ9aHSsHifqeQw/edit)
- **Script Project ID:** `14zzsCZBwO3nqIqKcd8BVisehmJ1pd9Z4nX8w-VccNyt0OzM2sLv9obhW`
- **Apps Script Editor:** [Buka Google Apps Script](https://script.google.com/d/14zzsCZBwO3nqIqKcd8BVisehmJ1pd9Z4nX8w-VccNyt0OzM2sLv9obhW/edit)
- **Production Web App API URL:**
  ```
  https://script.google.com/macros/s/AKfycbzOu3xkwcqRbBCP_OyOP04ZeSNYdCGou_xpJjtCt0H7l9evJ86oVjIfd3_AOnmqcxFH/exec
  ```

---

## Status Sinkronisasi Otomatis: SUKSES ✅

Seluruh kode backend berikut telah **otomatis diunggah (push)** langsung ke project Apps Script Anda:
1. `setupDatabase.gs` (Fungsi `setupMaisyaChatDatabase` untuk membuat 13 sheet tabel + seed data + menu khusus)
2. `Code.gs` (Backend API lengkap: Auth, Chat, Rooms, Drive Upload, Approval, Real-time Polling)
3. `appsscript.json` (Konfigurasi zona waktu `Asia/Jakarta`, runtime `V8`, dan Web App Access `ANYONE_ANONYMOUS`)
4. File `.env` pada proyek frontend lokal telah diisi dengan URL Web App produksi Anda.

---

## Langkah Terakhir: Eksekusi Fungsi Pembuatan Database (1 Menit)

Karena Google Apps Script mewajibkan otorisasi akun pemilik saat mengakses Spreadsheet pertama kali, Anda hanya perlu menjalankan fungsi ini sekali di Google Apps Script:

1. Buka Apps Script Editor Anda melalui tautan berikut:  
   👉 **[Buka Editor Apps Script](https://script.google.com/d/14zzsCZBwO3nqIqKcd8BVisehmJ1pd9Z4nX8w-VccNyt0OzM2sLv9obhW/edit)**
2. Pada dropdown pilihan fungsi di toolbar atas (sebelah tombol *Debug*), pilih fungsi:  
   **`setupMaisyaChatDatabase`**
3. Klik tombol **▷ Run** (Jalankan).
4. **Otorisasi Izin (Hanya 1x di awal):**
   - Jendela pop-up *"Authorization required"* akan muncul. Klik **Review permissions** / **Tinjau Izin**.
   - Pilih akun Google Anda.
   - Jika muncul peringatan *"Google hasn't verified this app"*, klik tautan kecil **Advanced** (Lanjutan) di kiri bawah, lalu klik **Go to ... (unsafe)**.
   - Klik **Allow** (Izinkan).
5. Tunggu 5-10 detik hingga Execution Log menampilkan:  
   `=== Inisialisasi Database Maisya Chat Room Sukses! ===`
6. Buka kembali Google Spreadsheet Anda:  
   👉 **[Lihat Spreadsheet DB_MAISYA_CHAT](https://docs.google.com/spreadsheets/d/1H_dZ6byEONLRbb-7kaY6UH59OTX1eOJ9aHSsHifqeQw/edit)**  
   Semua **13 sheet tabel** sudah otomatis terbuat dengan header hijau *Dark Emerald (#064E3B)*, baris pertama dibekukan, dan data awal (*seed*) telah siap!

---

## 13 Tabel yang Dibuat Otomatis

| No | Nama Sheet Tabel | Fungsi Utama |
| :---: | :--- | :--- |
| 1 | `tb_users` | Data akun pengguna, status aktif, status approval, nomor WA, dan foto |
| 2 | `tb_roles` | Master level role (Super Admin, Admin, Musyrif, Staff, Peserta) |
| 3 | `tb_permissions` | Master 18 izin akses granular sistem |
| 4 | `tb_role_permissions` | Pemetaan izin default untuk tiap role |
| 5 | `tb_user_permissions` | Override izin khusus per pengguna |
| 6 | `tb_rooms` | Data channel percakapan (publik / kode passcode) |
| 7 | `tb_room_members` | Daftar keanggotaan pengguna di dalam room |
| 8 | `tb_messages` | Riwayat pesan teks dan gambar |
| 9 | `tb_message_revisions` | Log riwayat revisi/edit pesan |
| 10 | `tb_room_permissions` | Pengaturan izin per ruangan |
| 11 | `tb_screen_share_sessions` | Sesi WebRTC screen sharing |
| 12 | `tb_user_activity_logs` | Audit trail aktivitas login, room, registrasi |
| 13 | `tb_settings` | Konfigurasi parameter sistem & Google Drive |

---

## Akun Login Super Admin Bawaan

| Username / Nama | Password / Kode Login | Role | Keterangan |
| :--- | :--- | :--- | :--- |
| **iftahadmin** | `iftah010387` | Super Admin | Akses Penuh: Kelola User, Approval, Kelola Room, Dashboard Admin |

> Untuk registrasi akun baru (Musyrif, Staff, Peserta), pendaftaran dapat dilakukan langsung lewat tombol **Daftar Akun Baru**. Setelah mendaftar, akun berstatus *Pending* dan dapat disetujui (Approved) oleh `iftahadmin` melalui **Dashboard Admin > Tab Persetujuan User**.
