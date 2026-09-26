# Panduan Setup Google Spreadsheet & Google Apps Script (DB_MAISYA_CHAT)
**Pondok Pesantren Imam Syafi'i Brebes - Maisya Chat Room**

Dokumen ini memandu Anda langkah demi langkah dalam menghubungkan aplikasi **Maisya Chat Room** ke Google Spreadsheet asli dan men-deploy Google Apps Script sebagai Web App API.

---

## Langkah 1: Buat Google Spreadsheet Baru

1. Buka browser dan kunjungi [Google Sheets](https://sheets.new).
2. Ubah judul dokumen (di pojok kiri atas) menjadi:
   ```
   DB_MAISYA_CHAT
   ```
3. Biarkan spreadsheet dalam keadaan kosong.

---

## Langkah 2: Buka Apps Script & Inisialisasi Database

1. Pada Google Spreadsheet tersebut, klik menu bar bagian atas:
   **Extensions** > **Apps Script** (atau **Ekstensi** > **Apps Script**).
2. Sebuah tab baru Google Apps Script Editor akan terbuka.
3. Hapus kode default `function myFunction() {}`.
4. Buka file [setupDatabase.gs](file:///c:/Users/Ponpes%20Imam%20Syafii/OneDrive/Desktop/maisya-room/google-apps-script/setupDatabase.gs) yang telah kami buat di proyek ini.
5. Salin (**Copy**) seluruh isi kode dari file tersebut, lalu tempel (**Paste**) ke editor Apps Script.
6. Simpan proyek dengan menekan tombol **Ctrl + S** (atau ikon disket).
7. Di bagian toolbar atas editor Apps Script, pastikan fungsi yang terpilih adalah:
   `setupMaisyaChatDatabase`
8. Klik tombol **▷ Run** (Jalankan).
9. **Otorisasi Izin:**
   - Google akan menampilkan jendela pop-up "Authorization required". Klik **Review permissions** / **Tinjau Izin**.
   - Pilih akun Google Anda.
   - Jika muncul peringatan "Google hasn't verified this app", klik link kecil **Advanced** (Lanjutan) di kiri bawah, lalu klik **Go to Untitled project (unsafe)**.
   - Klik **Allow** (Izinkan).
10. Tunggu beberapa detik hingga proses selesai (Execution log menampilkan `=== Inisialisasi DB_MAISYA_CHAT Selesai Sukses! ===`).
11. Buka kembali tab Google Spreadsheet Anda: Anda akan melihat **13 sheet** lengkap (`tb_users`, `tb_roles`, `tb_rooms`, `tb_messages`, dst.) beserta header hijau emerald yang rapi dan data awal (seed).

---

## Langkah 3: Pasang Backend API (`Code.gs`)

1. Kembali ke tab Apps Script Editor.
2. Buat file script baru dengan mengklik tanda `+` di samping tulisan **Files**, lalu pilih **Script**.
3. Beri nama file: `Code` (atau ganti isi file `Code.gs` yang ada).
4. Buka file [Code.gs](file:///c:/Users/Ponpes%20Imam%20Syafii/OneDrive/Desktop/maisya-room/google-apps-script/Code.gs) di proyek lokal ini.
5. Salin (**Copy**) seluruh isinya dan tempel (**Paste**) ke file `Code.gs` di editor Apps Script.
6. Simpan dengan menekan **Ctrl + S**.

---

## Langkah 4: Deploy sebagai Web App

1. Di pojok kanan atas editor Apps Script, klik tombol biru **Deploy** > **New deployment**.
2. Di jendela yang muncul, klik ikon roda gigi ⚙️ di samping "Select type", lalu pilih **Web app**.
3. Isi konfigurasi deployment:
   - **Description**: `Maisya Chat Room API Production v1.0`
   - **Execute as**: **Me (emailanda@gmail.com)**
   - **Who has access**: **Anyone** *(PENTING: Pilih "Anyone" agar frontend dapat mengirim request API tanpa terbentur login Google pribadi)*.
4. Klik tombol **Deploy**.
5. Salin **Web app URL** yang dihasilkan.
   Format URL biasanya:
   `https://script.google.com/macros/s/AKfycbx.../exec`

---

## Langkah 5: Hubungkan ke Frontend Maisya Chat Room

1. Buka file `.env` di folder utama aplikasi `maisya-room`.
2. Tempel URL Web App yang Anda dapatkan:
   ```env
   VITE_GAS_API_URL=https://script.google.com/macros/s/AKfycbx.../exec
   ```
3. Restart development server jika sedang berjalan (`npm run dev`).
4. Selesai! Aplikasi kini tersambung 100% secara langsung ke Google Spreadsheet `DB_MAISYA_CHAT` Anda.

---

## Akun Bawaan untuk Login Awal

| Nama Pengguna | Kode Login | Role | Keterangan |
| :--- | :--- | :--- | :--- |
| **Admin Maisya** | `ADMIN2026` | Super Admin | Akses Dashboard Admin & semua room |
| **Ustadz Ahmad Fauzi** | `ISB2026` | Musyrif | Pemateri, Screen Sharing, Room Musyrif |
| **Staff TU Maisya** | `TU2026` | Staff TU | Room Sarpras & Tata Usaha |
| **Zaid bin Tsabit** | `SANTRI2026` | Peserta / Santri | Peserta Umum & Halaqah |
