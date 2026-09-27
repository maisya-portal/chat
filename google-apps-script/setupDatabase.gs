/**
 * ============================================================================
 * MAISYA CHAT ROOM - DATABASE INITIALIZER & SEEDER
 * Spreadsheet ID: 1H_dZ6byEONLRbb-7kaY6UH59OTX1eOJ9aHSsHifqeQw
 * Pondok Pesantren Imam Syafi'i Brebes
 * ============================================================================
 * 
 * FUNGSI INI OTOMATIS:
 * 1. Membuat seluruh 13 sheet tabel yang dibutuhkan sistem.
 * 2. Memberi header kolom lengkap dengan styling Emerald Green (#064E3B) & font putih tebal.
 * 3. Membekukan (freeze) baris header pertama.
 * 4. Memasukkan data awal (seed) lengkap: Roles, Permissions, Role-Permissions,
 *    Super Admin (iftahadmin), default Rooms, Member assignments, dan Settings.
 * 5. Menambahkan menu khusus di Google Sheets "🌿 Maisya Room" untuk kemudahan eksekusi.
 */

// ID Google Spreadsheet Utama
const SPREADSHEET_ID = "1H_dZ6byEONLRbb-7kaY6UH59OTX1eOJ9aHSsHifqeQw";

/**
 * Mendapatkan referensi Spreadsheet aktif atau buka berdasarkan ID
 */
function getDatabaseSpreadsheet() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {
    // Berjalan di luar konteks container spreadsheet (standalone / Web App)
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * Menu otomatis saat Spreadsheet dibuka di Google Sheets UI
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu("🌿 Maisya Room")
      .addItem("⚡ Inisialisasi / Buat Semua Sheet Database", "setupMaisyaChatDatabase")
      .addSeparator()
      .addItem("🔄 Reset / Update Header Tabel", "setupMaisyaChatDatabase")
      .addToUi();
  } catch (e) {
    // Mode headless atau trigger web app
  }
}

/**
 * FUNGSI UTAMA: Membuat semua sheet database & mengisi seed data
 */
function setupMaisyaChatDatabase() {
  const ss = getDatabaseSpreadsheet();
  
  Logger.log("=== Memulai Inisialisasi Database Maisya Chat Room ===");
  Logger.log("Target Spreadsheet: " + ss.getName() + " (" + ss.getId() + ")");
  
  // 1. Definisikan Schema 13 Tabel Lengkap
  const tables = {
    "tb_users": [
      "id_user", "nama", "kode_login", "username", "role_id", 
      "status_aktif", "foto_url", "created_at", "updated_at",
      "approval_status", "no_wa", "keterangan"
    ],
    "tb_roles": [
      "id_role", "nama_role", "deskripsi", "status_aktif"
    ],
    "tb_permissions": [
      "id_permission", "nama_permission", "deskripsi"
    ],
    "tb_role_permissions": [
      "id_role", "id_permission"
    ],
    "tb_user_permissions": [
      "id_user", "id_permission", "is_allowed"
    ],
    "tb_rooms": [
      "id_room", "nama_room", "deskripsi", "kode_room", "foto_url", 
      "created_by", "status_aktif", "membutuhkan_kode", "created_at", "updated_at"
    ],
    "tb_room_members": [
      "id_member", "id_room", "id_user", "joined_at", "status"
    ],
    "tb_messages": [
      "id_message", "id_room", "id_user", "message_type", "content", 
      "file_id", "file_url", "file_name", "reply_to_id", "edited_at", 
      "deleted_at", "created_at", "updated_at"
    ],
    "tb_message_revisions": [
      "id_revision", "id_message", "old_content", "edited_by", "edited_at"
    ],
    "tb_room_permissions": [
      "id_room", "permission_name", "is_allowed"
    ],
    "tb_screen_share_sessions": [
      "id_session", "id_room", "id_user", "started_at", "ended_at", "status"
    ],
    "tb_user_activity_logs": [
      "id_log", "id_user", "activity", "id_room", "created_at"
    ],
    "tb_settings": [
      "setting_key", "setting_value", "description"
    ]
  };

  const headerBgColor = "#064E3B"; // Dark Emerald Maisya
  const headerFontColor = "#FFFFFF";
  const createdSheets = [];

  // 2. Buat atau sesuaikan setiap sheet
  for (const sheetName in tables) {
    let sheet = ss.getSheetByName(sheetName);
    const headers = tables[sheetName];
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      Logger.log(`+ Dibuat sheet baru: ${sheetName}`);
      createdSheets.push(sheetName);
    } else {
      Logger.log(`* Sheet sudah ada: ${sheetName}`);
    }

    // Set Header jika baris 1 masih kosong atau berbeda
    const existingHeader = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeader[0] || existingHeader[0] === "") {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Styling Header
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground(headerBgColor);
      headerRange.setFontColor(headerFontColor);
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
  }

  // Hapus Sheet1 default bawaan Google Sheets jika masih ada dan kosong
  const defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Sheet 1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try { 
      if (defaultSheet.getLastRow() <= 1 && defaultSheet.getLastColumn() <= 1) {
        ss.deleteSheet(defaultSheet); 
        Logger.log("- Sheet1 default berhasil dibersihkan");
      }
    } catch(e) {}
  }

  // 3. Masukkan Seed Data Awal (jika tabel masih kosong)
  seedInitialData(ss);

  Logger.log("=== Inisialisasi Database Maisya Chat Room Sukses! ===");
  
  return {
    success: true,
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    sheetsCount: Object.keys(tables).length,
    sheets: Object.keys(tables),
    createdSheets: createdSheets,
    message: "Alhamdulillah! Seluruh 13 sheet database Maisya Chat Room berhasil dibuat dan siap digunakan.",
    timestamp: new Date().toISOString()
  };
}

/**
 * Pengisian Data Awal (Seed Data)
 */
function seedInitialData(ss) {
  const now = new Date().toISOString();

  // 1. tb_roles
  const roleSheet = ss.getSheetByName("tb_roles");
  if (roleSheet && roleSheet.getLastRow() <= 1) {
    const roles = [
      ["ROLE_SUPERADMIN", "Super Admin", "Akses kendali penuh seluruh sistem Maisya", true],
      ["ROLE_ADMIN", "Admin", "Pengelola operasional pengguna, room, dan moderasi", true],
      ["ROLE_STAFF", "Staff TU / Sarpras", "Staff administrasi & operasional pesantren", true],
      ["ROLE_MUSYRIF", "Musyrif / Asatidzah", "Pembimbing santri, pengajar, dan pemateri", true],
      ["ROLE_PESERTA", "Peserta / Santri", "Peserta room dan santri pesantren", true]
    ];
    roleSheet.getRange(2, 1, roles.length, roles[0].length).setValues(roles);
    Logger.log("✓ Seed tb_roles berhasil");
  }

  // 2. tb_permissions
  const permSheet = ss.getSheetByName("tb_permissions");
  if (permSheet && permSheet.getLastRow() <= 1) {
    const permissions = [
      ["view_dashboard", "Lihat Dashboard Admin", "Izin membuka panel administrasi sistem"],
      ["manage_users", "Kelola Pengguna", "Tambah, edit, ganti status aktif, dan ubah kode login user"],
      ["manage_roles", "Kelola Role", "Ubah role dan hak akses global"],
      ["manage_permissions", "Kelola Permission", "Atur override permission per user"],
      ["create_room", "Buat Room Baru", "Membuat room percakapan baru"],
      ["edit_room", "Edit Room", "Mengubah nama, deskripsi, dan kode passcode room"],
      ["delete_room", "Hapus / Nonaktifkan Room", "Menghapus atau menonaktifkan ruang percakapan"],
      ["join_room", "Bergabung Room", "Masuk ke dalam room percakapan"],
      ["send_message", "Kirim Pesan Teks", "Mengirimkan pesan teks ke dalam room"],
      ["send_image", "Kirim Gambar", "Mengunggah gambar ke Google Drive dan membagikannya ke room"],
      ["edit_own_message", "Edit Pesan Sendiri", "Mengubah isi pesan yang dikirim oleh diri sendiri"],
      ["delete_own_message", "Hapus Pesan Sendiri", "Melakukan soft-delete pada pesan milik sendiri"],
      ["edit_any_message", "Edit Semua Pesan", "Kemampuan moderator mengubah pesan user lain"],
      ["delete_any_message", "Hapus Semua Pesan", "Kemampuan moderator menghapus pesan user lain"],
      ["copy_message", "Salin Pesan", "Menyalin isi teks pesan ke clipboard"],
      ["remove_participant", "Keluarkan Peserta", "Mengeluarkan peserta lain dari room"],
      ["screen_share", "Berbagi Layar", "Memulai sesi WebRTC screen sharing"],
      ["manage_room_settings", "Pengaturan Room", "Mengatur izin dan mode privasi room"]
    ];
    permSheet.getRange(2, 1, permissions.length, permissions[0].length).setValues(permissions);
    Logger.log("✓ Seed tb_permissions berhasil");
  }

  // 3. tb_role_permissions
  const rolePermSheet = ss.getSheetByName("tb_role_permissions");
  if (rolePermSheet && rolePermSheet.getLastRow() <= 1) {
    const allPerms = [
      "view_dashboard", "manage_users", "manage_roles", "manage_permissions",
      "create_room", "edit_room", "delete_room", "join_room", "send_message",
      "send_image", "edit_own_message", "delete_own_message", "edit_any_message",
      "delete_any_message", "copy_message", "remove_participant", "screen_share",
      "manage_room_settings"
    ];
    
    let rpRows = [];
    // SUPER ADMIN: semua permission
    allPerms.forEach(p => rpRows.push(["ROLE_SUPERADMIN", p]));
    
    // ADMIN: hampir semua kecuali kelola superadmin role
    allPerms.filter(p => p !== "manage_roles").forEach(p => rpRows.push(["ROLE_ADMIN", p]));

    // MUSYRIF: join, send msg, send img, edit own, delete own, copy, screen share
    ["join_room", "send_message", "send_image", "edit_own_message", "delete_own_message", "copy_message", "screen_share"].forEach(p => {
      rpRows.push(["ROLE_MUSYRIF", p]);
    });

    // STAFF: join, send msg, send img, edit own, delete own, copy
    ["join_room", "send_message", "send_image", "edit_own_message", "delete_own_message", "copy_message"].forEach(p => {
      rpRows.push(["ROLE_STAFF", p]);
    });

    // PESERTA: join, send msg, send img, edit own, delete own, copy
    ["join_room", "send_message", "send_image", "edit_own_message", "delete_own_message", "copy_message"].forEach(p => {
      rpRows.push(["ROLE_PESERTA", p]);
    });

    rolePermSheet.getRange(2, 1, rpRows.length, 2).setValues(rpRows);
    Logger.log("✓ Seed tb_role_permissions berhasil");
  }

  // 4. tb_users (Super Admin Utama: iftahadmin / iftah010387)
  const userSheet = ss.getSheetByName("tb_users");
  if (userSheet && userSheet.getLastRow() <= 1) {
    const users = [
      [
        "USR_ADMIN_IFTAH",
        "iftahadmin",
        hashPassword("iftah010387"),
        "iftahadmin",
        "ROLE_SUPERADMIN",
        true,
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        now,
        now,
        "approved",
        "08123456789",
        "Super Admin Utama Sistem Maisya"
      ]
    ];
    userSheet.getRange(2, 1, users.length, users[0].length).setValues(users);
    Logger.log("✓ Seed tb_users berhasil");
  }

  // 5. tb_rooms
  const roomSheet = ss.getSheetByName("tb_rooms");
  if (roomSheet && roomSheet.getLastRow() <= 1) {
    const rooms = [
      [
        "ROOM_PENGUMUMAN",
        "Pengumuman Resmi Pesantren",
        "Kanal resmi pengumuman, agenda kegiatan, dan maklumat pimpinan pondok.",
        "",
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80",
        "USR_ADMIN_IFTAH",
        true,
        false, // Terbuka tanpa kode
        now,
        now
      ],
      [
        "ROOM_MUSYRIF",
        "Forum Musyrif & Asatidzah",
        "Koordinasi harian pengasuhan santri, ibadah, dan evaluasi asrama.",
        "MUSYRIF26",
        "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=150&auto=format&fit=crop&q=80",
        "USR_ADMIN_IFTAH",
        true,
        true, // Butuh passcode
        now,
        now
      ],
      [
        "ROOM_TAHFIZH",
        "Halaqah Tahfizh Al-Qur'an",
        "Pencatatan setoran hafalan, mutaba'ah ziyadah, dan muraja'ah santri.",
        "TAHFIZH26",
        "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=150&auto=format&fit=crop&q=80",
        "USR_ADMIN_IFTAH",
        true,
        true,
        now,
        now
      ],
      [
        "ROOM_SARPRAS_TU",
        "Sarana Prasarana & Tata Usaha",
        "Pelaporan fasilitas, logistik, pengadaan barang, dan administrasi umum.",
        "SARPRAS26",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&auto=format&fit=crop&q=80",
        "USR_ADMIN_IFTAH",
        true,
        true,
        now,
        now
      ]
    ];
    roomSheet.getRange(2, 1, rooms.length, rooms[0].length).setValues(rooms);
    Logger.log("✓ Seed tb_rooms berhasil");
  }

  // 6. tb_room_members
  const memberSheet = ss.getSheetByName("tb_room_members");
  if (memberSheet && memberSheet.getLastRow() <= 1) {
    const members = [
      ["MBR_001", "ROOM_PENGUMUMAN", "USR_ADMIN_IFTAH", now, "active"],
      ["MBR_002", "ROOM_MUSYRIF", "USR_ADMIN_IFTAH", now, "active"],
      ["MBR_003", "ROOM_TAHFIZH", "USR_ADMIN_IFTAH", now, "active"],
      ["MBR_004", "ROOM_SARPRAS_TU", "USR_ADMIN_IFTAH", now, "active"]
    ];
    memberSheet.getRange(2, 1, members.length, members[0].length).setValues(members);
    Logger.log("✓ Seed tb_room_members berhasil");
  }

  // 7. tb_messages
  const msgSheet = ss.getSheetByName("tb_messages");
  if (msgSheet && msgSheet.getLastRow() <= 1) {
    const initialMessages = [
      [
        "MSG_001",
        "ROOM_PENGUMUMAN",
        "USR_ADMIN_IFTAH",
        "text",
        "Bismillah. Ahlan wa Sahlan di Maisya Chat Room Pesantren Imam Syafi'i Brebes. Seluruh komunikasi internal terenkripsi dan tercatat rapi.",
        "", "", "", "", "", "", now, now
      ],
      [
        "MSG_002",
        "ROOM_MUSYRIF",
        "USR_ADMIN_IFTAH",
        "text",
        "Assalamu'alaikum warahmatullah. Forum Musyrif & Asatidzah aktif. Mari gunakan room ini untuk koordinasi harian santri.",
        "", "", "", "", "", "", now, now
      ]
    ];
    msgSheet.getRange(2, 1, initialMessages.length, initialMessages[0].length).setValues(initialMessages);
    Logger.log("✓ Seed tb_messages berhasil");
  }

  // 8. tb_settings
  const settingSheet = ss.getSheetByName("tb_settings");
  if (settingSheet && settingSheet.getLastRow() <= 1) {
    const settings = [
      ["app_name", "Maisya Chat Room", "Nama platform internal pesantren"],
      ["pesantren_name", "Pondok Pesantren Imam Syafi'i Brebes", "Lembaga induk"],
      ["spreadsheet_id", SPREADSHEET_ID, "ID Google Spreadsheet Database"],
      ["max_upload_size_mb", "5", "Batas maksimal ukuran file gambar (MB)"],
      ["polling_interval_ms", "2500", "Interval polling aktif (milidetik)"],
      ["allow_screen_share", "true", "Status global izin fitur WebRTC screen sharing"],
      ["drive_folder_name", "Maisya_Chat_Uploads", "Nama folder target penyimpanan gambar di Google Drive"]
    ];
    settingSheet.getRange(2, 1, settings.length, settings[0].length).setValues(settings);
    Logger.log("✓ Seed tb_settings berhasil");
  }
}

/**
 * Utility Hash SHA-256 untuk Google Apps Script
 */
function hashPassword(plainText) {
  if (!plainText) return "";
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, plainText.toString(), Utilities.Charset.UTF_8);
  let txtHash = "";
  for (let i = 0; i < rawHash.length; i++) {
    let hashVal = rawHash[i];
    if (hashVal < 0) hashVal += 256;
    let byteStr = hashVal.toString(16);
    if (byteStr.length === 1) byteStr = "0" + byteStr;
    txtHash += byteStr;
  }
  return txtHash;
}
