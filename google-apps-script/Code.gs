/**
 * ============================================================================
 * MAISYA CHAT ROOM - GOOGLE APPS SCRIPT WEB APP API BACKEND
 * Database: Google Spreadsheet (DB_MAISYA_CHAT)
 * Penyimpanan Media: Google Drive
 * Pondok Pesantren Imam Syafi'i Brebes
 * ============================================================================
 */

// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================
const APP_CONFIG = {
  SPREADSHEET_ID: "1H_dZ6byEONLRbb-7kaY6UH59OTX1eOJ9aHSsHifqeQw",
  SPREADSHEET_NAME: "DB_MAISYA_CHAT",
  DRIVE_FOLDER_NAME: "Maisya_Chat_Uploads",
  LOCK_TIMEOUT_MS: 10000, // 10 detik batas antrian LockService
  TOKEN_SECRET: "MAISYA_SECRET_SALT_2026", // Secret untuk verifikasi token
  TOKEN_EXPIRY_HOURS: 72 // 3 hari
};

// ==========================================
// 2. HTTP DISPATCHER (doGet & doPost)
// ==========================================

/**
 * Handler HTTP GET: Digunakan untuk health check, polling pesan, ambil metadata
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "ping";
    const params = (e && e.parameter) ? e.parameter : {};

    let result;

    switch (action) {
      case "ping":
        result = { success: true, message: "Maisya Chat Room API is online and healthy.", timestamp: new Date().toISOString() };
        break;

      case "setupDatabase":
        result = setupMaisyaChatDatabase();
        break;

      case "getLatestMessages":
        result = getLatestMessages(params.roomId, params.sinceTimestamp, params.token);
        break;

      case "getMessages":
        result = getMessages(params.roomId, params.limit, params.beforeTimestamp, params.token);
        break;

      case "getRooms":
        result = getRooms(params.userId, params.token);
        break;

      case "getRoomMembers":
        result = getRoomMembers(params.roomId, params.token);
        break;

      case "getActiveScreenShareSession":
        result = getActiveScreenShareSession(params.roomId);
        break;

      case "getUsers":
        result = getUsers(params.token);
        break;

      case "getRoles":
        result = getRoles(params.token);
        break;

      case "getPermissions":
        result = getPermissions(params.token);
        break;

      case "getActivityLogs":
        result = getActivityLogs(params.limit, params.token);
        break;

      case "getDashboardStats":
        result = getDashboardStats(params.token);
        break;

      case "getAdminDashboardBundle":
        result = getAdminDashboardBundle(params.userId, params.token);
        break;

      case "getPendingUsers":
        result = getPendingUsers(params.token);
        break;

      case "checkUserStatus":
        result = checkUserStatus(params.identifier);
        break;

      case "validateSession":
        result = validateSession(params.token);
        break;

      default:
        result = { success: false, error: "Action GET '" + action + "' tidak dikenali." };
    }

    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Handler HTTP POST: Digunakan untuk autentikasi, mutasi data, pengiriman pesan, upload gambar
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Kunci eksekusi untuk mencegah race condition / benturan penulisan spreadsheet
    lock.waitLock(APP_CONFIG.LOCK_TIMEOUT_MS);

    let body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        body = e.parameter || {};
      }
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    const action = body.action || (e.parameter ? e.parameter.action : "");
    let result;

    switch (action) {
      case "setupDatabase":
        result = setupMaisyaChatDatabase();
        break;

      // Autentikasi
      case "login":
        result = loginUser(body.nama, body.kode_login);
        break;

      case "logout":
        result = logoutUser(body.token);
        break;

      // Pesan & Revisi
      case "sendMessage":
        result = sendMessage(body.roomId, body.userId, body.content, body.replyToId, body.token);
        break;

      case "sendImageMessage":
        result = sendImageMessage(body.roomId, body.userId, body.base64Data, body.fileName, body.mimeType, body.caption, body.token);
        break;

      case "editMessage":
        result = editMessage(body.messageId, body.userId, body.newContent, body.token);
        break;

      case "deleteMessage":
        result = deleteMessage(body.messageId, body.userId, body.token);
        break;

      case "getMessageRevisions":
        result = getMessageRevisions(body.messageId, body.token);
        break;

      // Room
      case "createRoom":
        result = createRoom(body.namaRoom, body.deskripsi, body.kodeRoom, body.membutuhkanKode, body.fotoUrl, body.userId, body.token);
        break;

      case "updateRoom":
        const rData = body.data || body;
        result = updateRoom(
          body.roomId, 
          rData.namaRoom || rData.nama_room, 
          rData.deskripsi, 
          rData.kodeRoom || rData.kode_room, 
          rData.membutuhkanKode !== undefined ? rData.membutuhkanKode : rData.membutuhkan_kode, 
          rData.fotoUrl || rData.foto_url, 
          rData.statusAktif !== undefined ? rData.statusAktif : rData.status_aktif, 
          body.userId, 
          body.token
        );
        break;

      case "deleteRoom":
        result = deleteRoom(body.roomId, body.userId, body.token);
        break;

      case "toggleRoomLock":
        result = toggleRoomLock(body.roomId, body.userId, body.newKode, body.token);
        break;

      case "joinRoom":
        result = joinRoom(body.roomId, body.userId, body.kodeRoom, body.token);
        break;

      case "leaveRoom":
        result = leaveRoom(body.roomId, body.userId, body.token);
        break;

      case "removeRoomMember":
        result = removeRoomMember(body.roomId, body.targetUserId, body.token);
        break;

      // Screen Sharing
      case "createScreenShareSession":
        result = createScreenShareSession(body.roomId, body.userId, body.token);
        break;

      case "endScreenShareSession":
        result = endScreenShareSession(body.sessionId, body.token);
        break;

      // Manajemen Pengguna & Persetujuan (Approval)
      case "registerUser":
        result = registerUser(body.nama, body.username, body.kodeLogin, body.roleId, body.noWa, body.keterangan);
        break;

      case "approveUser":
        result = approveUser(body.userId, body.roleId, body.token);
        break;

      case "rejectUser":
        result = rejectUser(body.userId, body.reason, body.token);
        break;

      case "createUser":
        result = createUser(body.nama, body.kodeLogin, body.username, body.roleId, body.fotoUrl, body.token);
        break;

      case "updateUser":
        const uData = body.data || body;
        result = updateUser(
          body.userId, 
          uData.nama, 
          uData.kodeLogin, 
          uData.username, 
          uData.roleId, 
          uData.fotoUrl, 
          uData.statusAktif, 
          uData.token || body.token
        );
        break;

      case "updateProfile":
        result = updateProfile(body.userId, body.data || body, body.token);
        break;

      case "deleteUser":
        result = deleteUser(body.userId, body.token);
        break;

      case "toggleUserStatus":
        result = toggleUserStatus(body.userId, body.token);
        break;

      // Role & Permission
      case "updateUserPermissions":
        result = updateUserPermissions(body.targetUserId, body.permissions, body.token);
        break;

      case "updateRolePermissions":
        result = updateRolePermissions(body.roleId, body.permissions, body.token);
        break;

      case "getAdminDashboardBundle":
        result = getAdminDashboardBundle(body.userId, body.token);
        break;

      // Audit Log
      case "logActivity":
        result = logActivity(body.userId, body.activity, body.roomId);
        break;

      default:
        result = { success: false, error: "Action POST '" + action + "' tidak dikenali." };
    }

    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  } finally {
    try { lock.releaseLock(); } catch(e) {}
  }
}

/**
 * Membentuk HTTP Response JSON yang mendukung CORS
 */
function createJsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ==========================================
// 3. DATABASE & SPREADSHEET HELPER
// ==========================================

function getSpreadsheet() {
  if (APP_CONFIG.SPREADSHEET_ID) {
    try {
      return SpreadsheetApp.openById(APP_CONFIG.SPREADSHEET_ID);
    } catch (e) {
      Logger.log("openById error: " + e.message);
    }
  }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  
  // Jika dieksekusi standalone, cari berdasarkan nama
  const files = DriveApp.getFilesByName(APP_CONFIG.SPREADSHEET_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  throw new Error("Spreadsheet '" + APP_CONFIG.SPREADSHEET_NAME + "' tidak ditemukan. Silakan jalankan setupMaisyaChatDatabase terlebih dahulu.");
}

function getSheetData(sheetName) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet '" + sheetName + "' tidak ditemukan.");
  
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol < 1) return { sheet, headers: [], rows: [] };
  
  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0];
  const rows = [];
  
  for (let r = 1; r < values.length; r++) {
    const rowObj = { _rowIndex: r + 1 };
    for (let c = 0; c < headers.length; c++) {
      rowObj[headers[c]] = values[r][c];
    }
    rows.push(rowObj);
  }
  
  return { sheet, headers, rows };
}

// ==========================================
// 4. AUTENTIKASI & KEAMANAN
// ==========================================

function hashPassword(plainText) {
  if (!plainText) return "";
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, plainText.toString().trim(), Utilities.Charset.UTF_8);
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

function generateToken(userId, roleId) {
  const payload = {
    userId: userId,
    roleId: roleId,
    timestamp: new Date().getTime(),
    expiresAt: new Date().getTime() + (APP_CONFIG.TOKEN_EXPIRY_HOURS * 3600 * 1000)
  };
  const jsonStr = JSON.stringify(payload);
  const signature = hashPassword(jsonStr + APP_CONFIG.TOKEN_SECRET);
  return Utilities.base64Encode(jsonStr) + "." + signature;
}

function verifyToken(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    
    const jsonStr = Utilities.newBlob(Utilities.base64Decode(parts[0])).getDataAsString();
    const signature = parts[1];
    
    const expectedSig = hashPassword(jsonStr + APP_CONFIG.TOKEN_SECRET);
    if (signature !== expectedSig) return null;
    
    const payload = JSON.parse(jsonStr);
    if (new Date().getTime() > payload.expiresAt) return null; // Kedaluwarsa
    
    return payload;
  } catch (e) {
    return null;
  }
}

/**
 * Login dengan Nama & Kode Login
 */
function loginUser(nama, kodeLogin) {
  if (!nama || !kodeLogin) {
    return { success: false, error: "Nama dan kode login wajib diisi." };
  }

  const { rows: users } = getSheetData("tb_users");
  const cleanNama = nama.toString().trim().toLowerCase();
  const inputHash = hashPassword(kodeLogin);

  const user = users.find(u => 
    (u.nama && u.nama.toString().trim().toLowerCase() === cleanNama) ||
    (u.username && u.username.toString().trim().toLowerCase() === cleanNama)
  );

  if (!user) {
    return { success: false, error: "Pengguna dengan nama / username '" + nama + "' tidak ditemukan. Silakan lakukan pendaftaran akun." };
  }

  // Cek persetujuan admin (approval)
  if (user.approval_status === "pending") {
    return { success: false, error: "Pendaftaran akun Anda masih MENUNGGU PERSETUJUAN (Approval) dari Admin (iftahadmin). Silakan hubungi admin pesantren." };
  }

  if (user.approval_status === "rejected") {
    return { success: false, error: "Pendaftaran akun Anda ditolak oleh Admin. Silakan hubungi admin pesantren." };
  }

  if (user.status_aktif !== true && user.status_aktif !== "TRUE" && user.status_aktif !== 1) {
    return { success: false, error: "Akun Anda dinonaktifkan oleh administrator. Silakan hubungi admin." };
  }

  // Verifikasi hash kode login
  if (user.kode_login !== inputHash && user.kode_login !== kodeLogin) {
    return { success: false, error: "Kode login yang Anda masukkan salah." };
  }

  const token = generateToken(user.id_user, user.role_id);
  const permissions = getEffectiveUserPermissions(user.id_user, user.role_id);

  // Catat riwayat login
  logActivity(user.id_user, "LOGIN", null);

  return {
    success: true,
    message: "Login berhasil. Selamat datang di Maisya Chat Room.",
    token: token,
    user: {
      id_user: user.id_user,
      nama: user.nama,
      username: user.username,
      role_id: user.role_id,
      foto_url: user.foto_url
    },
    permissions: permissions
  };
}

function validateSession(token) {
  const session = verifyToken(token);
  if (!session) {
    return { success: false, error: "Sesi telah berakhir atau tidak valid. Silakan login kembali." };
  }

  const { rows: users } = getSheetData("tb_users");
  const user = users.find(u => u.id_user === session.userId);
  if (!user || (!user.status_aktif && user.status_aktif !== "TRUE" && user.status_aktif !== 1)) {
    return { success: false, error: "Akun tidak ditemukan atau telah dinonaktifkan." };
  }

  const permissions = getEffectiveUserPermissions(user.id_user, user.role_id);

  return {
    success: true,
    user: {
      id_user: user.id_user,
      nama: user.nama,
      username: user.username,
      role_id: user.role_id,
      foto_url: user.foto_url
    },
    permissions: permissions
  };
}

function logoutUser(token) {
  const session = verifyToken(token);
  if (session) {
    logActivity(session.userId, "LOGOUT", null);
  }
  return { success: true, message: "Berhasil logout." };
}

// ==========================================
// 5. PERMISSION ENGINE (RBAC + Overrides)
// ==========================================

function getEffectiveUserPermissions(userId, roleId) {
  const { rows: rolePerms } = getSheetData("tb_role_permissions");
  const { rows: userPerms } = getSheetData("tb_user_permissions");

  // 1. Ambil permission default dari Role
  const effective = {};
  rolePerms
    .filter(rp => rp.id_role === roleId)
    .forEach(rp => {
      effective[rp.id_permission] = true;
    });

  // 2. Terapkan User Specific Override jika ada
  userPerms
    .filter(up => up.id_user === userId)
    .forEach(up => {
      effective[up.id_permission] = (up.is_allowed === true || up.is_allowed === "TRUE" || up.is_allowed === 1);
    });

  return effective;
}

function checkUserPermission(token, requiredPermission) {
  const session = verifyToken(token);
  if (!session) return false;
  if (session.roleId === "ROLE_SUPERADMIN") return true;

  const perms = getEffectiveUserPermissions(session.userId, session.roleId);
  return !!perms[requiredPermission];
}

// ==========================================
// 6. ROOM MANAGEMENT
// ==========================================

function getRooms(userId, token) {
  const { rows: rooms } = getSheetData("tb_rooms");
  const { rows: members } = getSheetData("tb_room_members");

  const myMemberships = members.filter(m => m.id_user === userId && m.status === "active");
  const myRoomIds = new Set(myMemberships.map(m => m.id_room));

  const formattedRooms = rooms
    .filter(r => r.status_aktif === true || r.status_aktif === "TRUE" || r.status_aktif === 1)
    .map(r => {
      const isJoined = myRoomIds.has(r.id_room);
      const memberCount = members.filter(m => m.id_room === r.id_room && m.status === "active").length;
      return {
        id_room: r.id_room,
        nama_room: r.nama_room,
        deskripsi: r.deskripsi,
        foto_url: r.foto_url,
        created_by: r.created_by,
        membutuhkan_kode: (r.membutuhkan_kode === true || r.membutuhkan_kode === "TRUE" || r.membutuhkan_kode === 1),
        is_joined: isJoined,
        member_count: memberCount,
        created_at: r.created_at
      };
    });

  return { success: true, rooms: formattedRooms };
}

function createRoom(namaRoom, deskripsi, kodeRoom, membutuhkanKode, fotoUrl, userId, token) {
  if (!checkUserPermission(token, "create_room")) {
    return { success: false, error: "Anda tidak memiliki izin membuat room baru." };
  }

  if (!namaRoom) return { success: false, error: "Nama room wajib diisi." };

  const ss = getSpreadsheet();
  const roomSheet = ss.getSheetByName("tb_rooms");
  const memberSheet = ss.getSheetByName("tb_room_members");

  const roomId = "ROOM_" + Utilities.getUuid().substring(0, 8).toUpperCase();
  const now = new Date().toISOString();

  const newRow = [
    roomId,
    namaRoom.trim(),
    deskripsi || "",
    kodeRoom ? kodeRoom.trim() : "",
    fotoUrl || "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=150&auto=format&fit=crop&q=80",
    userId,
    true,
    Boolean(membutuhkanKode),
    now,
    now
  ];

  roomSheet.appendRow(newRow);

  // Otomatis pembuat room menjadi member
  memberSheet.appendRow([
    "MBR_" + Utilities.getUuid().substring(0, 8),
    roomId,
    userId,
    now,
    "active"
  ]);

  logActivity(userId, "CREATE_ROOM: " + namaRoom, roomId);

  return {
    success: true,
    message: "Room berhasil dibuat.",
    room: {
      id_room: roomId,
      nama_room: namaRoom,
      deskripsi: deskripsi,
      membutuhkan_kode: Boolean(membutuhkanKode),
      is_joined: true
    }
  };
}

function joinRoom(roomId, userId, kodeRoom, token) {
  const { rows: rooms } = getSheetData("tb_rooms");
  const room = rooms.find(r => r.id_room === roomId);
  if (!room) return { success: false, error: "Room tidak ditemukan." };

  // Validasi kode jika membutuhkan kode
  const requiresPass = (room.membutuhkan_kode === true || room.membutuhkan_kode === "TRUE" || room.membutuhkan_kode === 1);
  if (requiresPass && room.kode_room) {
    if (!kodeRoom || kodeRoom.toString().trim() !== room.kode_room.toString().trim()) {
      return { success: false, error: "Kode room tidak valid. Silakan hubungi admin room." };
    }
  }

  const { sheet: memberSheet, rows: members } = getSheetData("tb_room_members");
  const existingMember = members.find(m => m.id_room === roomId && m.id_user === userId);

  const now = new Date().toISOString();
  if (existingMember) {
    if (existingMember.status === "kicked") {
      return { success: false, error: "Anda telah dikeluarkan dari room ini oleh moderator." };
    }
    // Jika sebelumnya 'left', aktifkan kembali
    memberSheet.getRange(existingMember._rowIndex, 5).setValue("active");
  } else {
    memberSheet.appendRow([
      "MBR_" + Utilities.getUuid().substring(0, 8),
      roomId,
      userId,
      now,
      "active"
    ]);
  }

  logActivity(userId, "JOIN_ROOM", roomId);
  return { success: true, message: "Berhasil bergabung ke dalam " + room.nama_room };
}

function leaveRoom(roomId, userId, token) {
  const { sheet, rows: members } = getSheetData("tb_room_members");
  const member = members.find(m => m.id_room === roomId && m.id_user === userId && m.status === "active");
  
  if (member) {
    sheet.getRange(member._rowIndex, 5).setValue("left");
    logActivity(userId, "LEAVE_ROOM", roomId);
  }
  return { success: true, message: "Anda telah keluar dari room." };
}

function getRoomMembers(roomId, token) {
  const { rows: members } = getSheetData("tb_room_members");
  const { rows: users } = getSheetData("tb_users");
  const { rows: roles } = getSheetData("tb_roles");

  const userMap = {};
  users.forEach(u => { userMap[u.id_user] = u; });

  const roleMap = {};
  roles.forEach(r => { roleMap[r.id_role] = r.nama_role; });

  const roomMembers = members
    .filter(m => m.id_room === roomId && m.status === "active")
    .map(m => {
      const u = userMap[m.id_user] || {};
      return {
        id_member: m.id_member,
        id_user: m.id_user,
        nama: u.nama || "Pengguna",
        username: u.username || "",
        foto_url: u.foto_url || "",
        role_nama: roleMap[u.role_id] || "Peserta",
        joined_at: m.joined_at
      };
    });

  return { success: true, members: roomMembers };
}

function removeRoomMember(roomId, targetUserId, token) {
  if (!checkUserPermission(token, "remove_participant")) {
    return { success: false, error: "Anda tidak berhak mengeluarkan peserta." };
  }

  const { sheet, rows: members } = getSheetData("tb_room_members");
  const member = members.find(m => m.id_room === roomId && m.id_user === targetUserId && m.status === "active");

  if (member) {
    sheet.getRange(member._rowIndex, 5).setValue("kicked");
    const session = verifyToken(token);
    logActivity(session ? session.userId : "ADMIN", "KICK_USER: " + targetUserId, roomId);
    return { success: true, message: "Peserta berhasil dikeluarkan dari room." };
  }

  return { success: false, error: "Peserta tidak ditemukan di room ini." };
}

function updateRoom(roomId, namaRoom, deskripsi, kodeRoom, membutuhkanKode, fotoUrl, statusAktif, userId, token) {
  if (!checkUserPermission(token, "manage_rooms") && !checkUserPermission(token, "create_room")) {
    return { success: false, error: "Akses ditolak: Anda tidak memiliki izin mengelola room." };
  }

  const { sheet, rows: rooms } = getSheetData("tb_rooms");
  const room = rooms.find(r => r.id_room === roomId);
  if (!room) return { success: false, error: "Room tidak ditemukan." };

  const now = new Date().toISOString();
  if (namaRoom) sheet.getRange(room._rowIndex, 2).setValue(namaRoom.trim());
  if (deskripsi !== undefined) sheet.getRange(room._rowIndex, 3).setValue(deskripsi);
  if (kodeRoom !== undefined) sheet.getRange(room._rowIndex, 4).setValue(kodeRoom ? kodeRoom.trim() : "");
  if (fotoUrl !== undefined && fotoUrl.trim() !== "") sheet.getRange(room._rowIndex, 5).setValue(fotoUrl);
  if (statusAktif !== undefined) sheet.getRange(room._rowIndex, 7).setValue(Boolean(statusAktif));
  if (membutuhkanKode !== undefined) sheet.getRange(room._rowIndex, 8).setValue(Boolean(membutuhkanKode));
  sheet.getRange(room._rowIndex, 10).setValue(now);

  const session = verifyToken(token);
  logActivity(session ? session.userId : (userId || "ADMIN"), "UPDATE_ROOM: " + (namaRoom || room.nama_room), roomId);

  return { success: true, message: "Data room berhasil diperbarui." };
}

function deleteRoom(roomId, userId, token) {
  if (!checkUserPermission(token, "manage_rooms")) {
    return { success: false, error: "Akses ditolak: Hanya admin yang dapat menghapus room." };
  }

  const { sheet, rows: rooms } = getSheetData("tb_rooms");
  const room = rooms.find(r => r.id_room === roomId);
  if (!room) return { success: false, error: "Room tidak ditemukan." };

  // Hapus baris room
  sheet.deleteRow(room._rowIndex);

  // Hapus keanggotaan room ini
  try {
    const { sheet: memberSheet, rows: members } = getSheetData("tb_room_members");
    const memberRows = members
      .filter(m => m.id_room === roomId)
      .map(m => m._rowIndex)
      .sort((a, b) => b - a);

    for (let i = 0; i < memberRows.length; i++) {
      memberSheet.deleteRow(memberRows[i]);
    }
  } catch (e) {
    Logger.log("Error members on deleteRoom: " + e.message);
  }

  // Hapus pesan di room ini
  try {
    const { sheet: msgSheet, rows: messages } = getSheetData("tb_messages");
    const msgRows = messages
      .filter(m => m.id_room === roomId)
      .map(m => m._rowIndex)
      .sort((a, b) => b - a);

    for (let i = 0; i < msgRows.length; i++) {
      msgSheet.deleteRow(msgRows[i]);
    }
  } catch (e) {
    Logger.log("Error messages on deleteRoom: " + e.message);
  }

  const session = verifyToken(token);
  logActivity(session ? session.userId : (userId || "ADMIN"), "DELETE_ROOM: " + room.nama_room, roomId);

  return { success: true, message: "Room '" + room.nama_room + "' beserta data riwayatnya berhasil dihapus." };
}

function toggleRoomLock(roomId, userId, newKode, token) {
  const { sheet, rows: rooms } = getSheetData("tb_rooms");
  const room = rooms.find(r => r.id_room === roomId);
  if (!room) return { success: false, error: "Room tidak ditemukan." };

  const currentLocked = (room.membutuhkan_kode === true || room.membutuhkan_kode === "TRUE" || room.membutuhkan_kode === 1);
  const newLocked = !currentLocked;
  const now = new Date().toISOString();

  sheet.getRange(room._rowIndex, 8).setValue(newLocked);
  if (newLocked && newKode) {
    sheet.getRange(room._rowIndex, 4).setValue(newKode.trim());
  }
  sheet.getRange(room._rowIndex, 10).setValue(now);

  const session = verifyToken(token);
  logActivity(session ? session.userId : (userId || "ADMIN"), (newLocked ? "LOCK_ROOM" : "UNLOCK_ROOM") + ": " + room.nama_room, roomId);

  return {
    success: true,
    message: newLocked ? "Room berhasil dikunci dengan kode." : "Kunci room berhasil dibuka untuk umum.",
    membutuhkan_kode: newLocked
  };
}

// ==========================================
// 7. REAL-TIME CHAT & MESSAGING
// ==========================================

function getMessages(roomId, limit, beforeTimestamp, token) {
  const { rows: messages } = getSheetData("tb_messages");
  const { rows: users } = getSheetData("tb_users");

  const userMap = {};
  users.forEach(u => {
    userMap[u.id_user] = {
      nama: u.nama,
      foto_url: u.foto_url,
      role_id: u.role_id
    };
  });

  let roomMsgs = messages.filter(m => m.id_room === roomId);

  if (beforeTimestamp) {
    roomMsgs = roomMsgs.filter(m => m.created_at < beforeTimestamp);
  }

  // Ambil N pesan terakhir
  const maxLimit = limit ? parseInt(limit) : 50;
  if (roomMsgs.length > maxLimit) {
    roomMsgs = roomMsgs.slice(roomMsgs.length - maxLimit);
  }

  const formatted = roomMsgs.map(m => {
    const sender = userMap[m.id_user] || { nama: "Anonim", foto_url: "", role_id: "" };
    return {
      id_message: m.id_message,
      id_room: m.id_room,
      id_user: m.id_user,
      nama_pengirim: sender.nama,
      foto_pengirim: sender.foto_url,
      message_type: m.message_type,
      content: m.deleted_at ? "Pesan ini telah dihapus" : m.content,
      file_id: m.file_id,
      file_url: m.file_url,
      file_name: m.file_name,
      reply_to_id: m.reply_to_id,
      is_edited: Boolean(m.edited_at),
      is_deleted: Boolean(m.deleted_at),
      created_at: m.created_at,
      updated_at: m.updated_at
    };
  });

  return { success: true, messages: formatted };
}

/**
 * Smart Polling Delta Fetcher
 */
function getLatestMessages(roomId, sinceTimestamp, token) {
  if (!roomId) return { success: false, error: "Room ID wajib disertakan." };

  const { rows: messages } = getSheetData("tb_messages");
  const { rows: users } = getSheetData("tb_users");

  const userMap = {};
  users.forEach(u => {
    userMap[u.id_user] = {
      nama: u.nama,
      foto_url: u.foto_url
    };
  });

  // Filter pesan di room tersebut yang memiliki updated_at atau created_at > sinceTimestamp
  let newOrUpdatedMsgs = messages.filter(m => m.id_room === roomId);
  if (sinceTimestamp) {
    newOrUpdatedMsgs = newOrUpdatedMsgs.filter(m => 
      (m.created_at && m.created_at > sinceTimestamp) ||
      (m.updated_at && m.updated_at > sinceTimestamp)
    );
  }

  const formatted = newOrUpdatedMsgs.map(m => {
    const sender = userMap[m.id_user] || { nama: "Pengguna", foto_url: "" };
    return {
      id_message: m.id_message,
      id_room: m.id_room,
      id_user: m.id_user,
      nama_pengirim: sender.nama,
      foto_pengirim: sender.foto_url,
      message_type: m.message_type,
      content: m.deleted_at ? "Pesan ini telah dihapus" : m.content,
      file_id: m.file_id,
      file_url: m.file_url,
      file_name: m.file_name,
      reply_to_id: m.reply_to_id,
      is_edited: Boolean(m.edited_at),
      is_deleted: Boolean(m.deleted_at),
      created_at: m.created_at,
      updated_at: m.updated_at
    };
  });

  return { success: true, messages: formatted };
}

function sendMessage(roomId, userId, content, replyToId, token) {
  if (!checkUserPermission(token, "send_message")) {
    return { success: false, error: "Anda tidak memiliki izin mengirim pesan." };
  }

  if (!content || !content.trim()) {
    return { success: false, error: "Pesan tidak boleh kosong." };
  }

  const ss = getSpreadsheet();
  const msgSheet = ss.getSheetByName("tb_messages");
  const msgId = "MSG_" + new Date().getTime() + "_" + Utilities.getUuid().substring(0, 4);
  const now = new Date().toISOString();

  const newRow = [
    msgId,
    roomId,
    userId,
    "text",
    content.trim(),
    "", "", "", // file_id, file_url, file_name
    replyToId || "",
    "", // edited_at
    "", // deleted_at
    now,
    now
  ];

  msgSheet.appendRow(newRow);

  return {
    success: true,
    message: {
      id_message: msgId,
      id_room: roomId,
      id_user: userId,
      message_type: "text",
      content: content.trim(),
      reply_to_id: replyToId || "",
      created_at: now,
      updated_at: now
    }
  };
}

function sendImageMessage(roomId, userId, base64Data, fileName, mimeType, caption, token) {
  if (!checkUserPermission(token, "send_image")) {
    return { success: false, error: "Anda tidak memiliki izin mengirim gambar." };
  }

  if (!base64Data) {
    return { success: false, error: "Data gambar tidak valid." };
  }

  // Upload ke Google Drive
  const uploadResult = uploadImageToDrive(base64Data, fileName || "image_" + new Date().getTime() + ".jpg", mimeType || "image/jpeg");
  if (!uploadResult.success) {
    return uploadResult;
  }

  const ss = getSpreadsheet();
  const msgSheet = ss.getSheetByName("tb_messages");
  const msgId = "MSG_IMG_" + new Date().getTime() + "_" + Utilities.getUuid().substring(0, 4);
  const now = new Date().toISOString();

  const newRow = [
    msgId,
    roomId,
    userId,
    "image",
    caption || "",
    uploadResult.file_id,
    uploadResult.file_url,
    uploadResult.file_name,
    "", // reply_to_id
    "", // edited_at
    "", // deleted_at
    now,
    now
  ];

  msgSheet.appendRow(newRow);

  return {
    success: true,
    message: {
      id_message: msgId,
      id_room: roomId,
      id_user: userId,
      message_type: "image",
      content: caption || "",
      file_id: uploadResult.file_id,
      file_url: uploadResult.file_url,
      file_name: uploadResult.file_name,
      created_at: now,
      updated_at: now
    }
  };
}

function editMessage(messageId, userId, newContent, token) {
  if (!newContent || !newContent.trim()) {
    return { success: false, error: "Konten pesan baru tidak boleh kosong." };
  }

  const { sheet: msgSheet, rows: messages } = getSheetData("tb_messages");
  const msg = messages.find(m => m.id_message === messageId);
  if (!msg) return { success: false, error: "Pesan tidak ditemukan." };

  // Cek izin edit pesan
  const session = verifyToken(token);
  const isOwn = (msg.id_user === userId);
  const canEditOwn = checkUserPermission(token, "edit_own_message");
  const canEditAny = checkUserPermission(token, "edit_any_message");

  if (isOwn && !canEditOwn) return { success: false, error: "Anda tidak diizinkan mengedit pesan sendiri." };
  if (!isOwn && !canEditAny) return { success: false, error: "Anda tidak memiliki wewenang mengedit pesan pengguna lain." };

  const now = new Date().toISOString();
  const oldContent = msg.content;

  // Catat riwayat perubahan ke tb_message_revisions
  const ss = getSpreadsheet();
  const revSheet = ss.getSheetByName("tb_message_revisions");
  revSheet.appendRow([
    "REV_" + Utilities.getUuid().substring(0, 8),
    messageId,
    oldContent,
    userId,
    now
  ]);

  // Update content, edited_at, dan updated_at di tb_messages
  msgSheet.getRange(msg._rowIndex, 5).setValue(newContent.trim()); // col 5 = content
  msgSheet.getRange(msg._rowIndex, 10).setValue(now); // col 10 = edited_at
  msgSheet.getRange(msg._rowIndex, 13).setValue(now); // col 13 = updated_at

  return { success: true, message: "Pesan berhasil diperbarui.", edited_at: now };
}

function deleteMessage(messageId, userId, token) {
  const { sheet: msgSheet, rows: messages } = getSheetData("tb_messages");
  const msg = messages.find(m => m.id_message === messageId);
  if (!msg) return { success: false, error: "Pesan tidak ditemukan." };

  const isOwn = (msg.id_user === userId);
  const canDeleteOwn = checkUserPermission(token, "delete_own_message");
  const canDeleteAny = checkUserPermission(token, "delete_any_message");

  if (isOwn && !canDeleteOwn) return { success: false, error: "Anda tidak diizinkan menghapus pesan sendiri." };
  if (!isOwn && !canDeleteAny) return { success: false, error: "Anda tidak memiliki wewenang menghapus pesan ini." };

  const now = new Date().toISOString();

  // Soft delete: tandai deleted_at dan perbarui updated_at
  msgSheet.getRange(msg._rowIndex, 11).setValue(now); // col 11 = deleted_at
  msgSheet.getRange(msg._rowIndex, 13).setValue(now); // col 13 = updated_at

  return { success: true, message: "Pesan telah dihapus (soft delete)." };
}

function getMessageRevisions(messageId, token) {
  const { rows: revisions } = getSheetData("tb_message_revisions");
  const { rows: users } = getSheetData("tb_users");

  const userMap = {};
  users.forEach(u => { userMap[u.id_user] = u.nama; });

  const revs = revisions
    .filter(r => r.id_message === messageId)
    .map(r => ({
      id_revision: r.id_revision,
      old_content: r.old_content,
      edited_by_name: userMap[r.edited_by] || "Moderator",
      edited_at: r.edited_at
    }));

  return { success: true, revisions: revs };
}

// ==========================================
// 8. GOOGLE DRIVE IMAGE UPLOADER
// ==========================================

function getOrCreateDriveFolder() {
  const folders = DriveApp.getFoldersByName(APP_CONFIG.DRIVE_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  const newFolder = DriveApp.createFolder(APP_CONFIG.DRIVE_FOLDER_NAME);
  newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return newFolder;
}

function uploadImageToDrive(base64Data, fileName, mimeType) {
  try {
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const decodedBytes = Utilities.base64Decode(cleanBase64);
    const blob = Utilities.newBlob(decodedBytes, mimeType || "image/jpeg", fileName);

    const folder = getOrCreateDriveFolder();
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    // Gunakan thumbnail Google Drive direct view link
    const fileUrl = "https://lh3.googleusercontent.com/d/" + fileId;

    return {
      success: true,
      file_id: fileId,
      file_url: fileUrl,
      file_name: fileName
    };
  } catch (err) {
    return { success: false, error: "Gagal mengunggah gambar ke Google Drive: " + err.toString() };
  }
}

function deleteImageFromDrive(fileId, token) {
  try {
    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true);
    return { success: true, message: "File berhasil dipindahkan ke sampah." };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ==========================================
// 9. SCREEN SHARING SESSION TRACKER
// ==========================================

function createScreenShareSession(roomId, userId, token) {
  if (!checkUserPermission(token, "screen_share")) {
    return { success: false, error: "Anda tidak memiliki izin melakukan screen sharing." };
  }

  const ss = getSpreadsheet();
  const sessionSheet = ss.getSheetByName("tb_screen_share_sessions");
  const sessionId = "SCR_" + Utilities.getUuid().substring(0, 8);
  const now = new Date().toISOString();

  // Matikan sesi aktif sebelumnya di room ini jika ada
  const { sheet, rows: sessions } = getSheetData("tb_screen_share_sessions");
  sessions.filter(s => s.id_room === roomId && s.status === "active").forEach(s => {
    sheet.getRange(s._rowIndex, 5).setValue(now); // ended_at
    sheet.getRange(s._rowIndex, 6).setValue("ended"); // status
  });

  // Buat sesi baru
  sessionSheet.appendRow([
    sessionId,
    roomId,
    userId,
    now,
    "", // ended_at
    "active"
  ]);

  logActivity(userId, "START_SCREEN_SHARE", roomId);

  return {
    success: true,
    session: {
      id_session: sessionId,
      id_room: roomId,
      id_user: userId,
      started_at: now,
      status: "active"
    }
  };
}

function endScreenShareSession(sessionId, token) {
  const { sheet, rows: sessions } = getSheetData("tb_screen_share_sessions");
  const session = sessions.find(s => s.id_session === sessionId && s.status === "active");

  if (session) {
    const now = new Date().toISOString();
    sheet.getRange(session._rowIndex, 5).setValue(now);
    sheet.getRange(session._rowIndex, 6).setValue("ended");
    logActivity(session.id_user, "END_SCREEN_SHARE", session.id_room);
  }

  return { success: true, message: "Sesi berbagi layar telah ditutup." };
}

function getActiveScreenShareSession(roomId) {
  const { rows: sessions } = getSheetData("tb_screen_share_sessions");
  const { rows: users } = getSheetData("tb_users");

  const active = sessions.find(s => s.id_room === roomId && s.status === "active");
  if (!active) {
    return { success: true, is_active: false };
  }

  const user = users.find(u => u.id_user === active.id_user) || {};

  return {
    success: true,
    is_active: true,
    session: {
      id_session: active.id_session,
      id_room: active.id_room,
      id_user: active.id_user,
      presenter_name: user.nama || "Pemateri",
      presenter_foto: user.foto_url || "",
      started_at: active.started_at
    }
  };
}

// ==========================================
// 10. ADMIN DASHBOARD & USER MANAGEMENT
// ==========================================

function getUsers(token) {
  const { rows: users } = getSheetData("tb_users");
  const { rows: roles } = getSheetData("tb_roles");

  const roleMap = {};
  roles.forEach(r => { roleMap[r.id_role] = r.nama_role; });

  const safeUsers = users.map(u => ({
    id_user: u.id_user,
    nama: u.nama,
    username: u.username,
    role_id: u.role_id,
    role_nama: roleMap[u.role_id] || u.role_id,
    status_aktif: (u.status_aktif === true || u.status_aktif === "TRUE" || u.status_aktif === 1),
    approval_status: u.approval_status || ((u.status_aktif === true || u.status_aktif === "TRUE" || u.status_aktif === 1) ? "approved" : "pending"),
    no_wa: u.no_wa || "",
    keterangan: u.keterangan || "",
    foto_url: u.foto_url,
    created_at: u.created_at,
    updated_at: u.updated_at
  }));

  return { success: true, users: safeUsers };
}

function registerUser(nama, username, kodeLogin, roleId, noWa, keterangan) {
  if (!nama || !username || !kodeLogin) {
    return { success: false, error: "Nama, username, dan password wajib diisi." };
  }

  const { rows: users } = getSheetData("tb_users");
  const cleanUsername = username.toString().trim().toLowerCase();
  const cleanNama = nama.toString().trim();

  if (users.some(u => u.username && u.username.toString().trim().toLowerCase() === cleanUsername)) {
    return { success: false, error: "Username '" + username + "' sudah digunakan." };
  }

  const ss = getSpreadsheet();
  const userSheet = ss.getSheetByName("tb_users");
  const userId = "USR_" + Utilities.getUuid().substring(0, 8).toUpperCase();
  const now = new Date().toISOString();

  const newRow = [
    userId,
    cleanNama,
    hashPassword(kodeLogin),
    cleanUsername,
    roleId || "ROLE_PESERTA",
    false, // Belum aktif sampai disetujui
    "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(cleanNama),
    now,
    now,
    "pending",
    noWa || "",
    keterangan || ""
  ];

  userSheet.appendRow(newRow);
  logActivity("SYSTEM", "USER_REGISTER: " + cleanNama, null);

  return {
    success: true,
    message: "Pendaftaran berhasil dikirim! Akun Anda sedang menunggu persetujuan (approval) dari Admin (iftahadmin)."
  };
}

function approveUser(userId, roleId, token) {
  if (!checkUserPermission(token, "manage_users")) {
    return { success: false, error: "Akses ditolak: Hanya admin yang dapat menyetujui akun." };
  }

  const { sheet, rows: users } = getSheetData("tb_users");
  const user = users.find(u => u.id_user === userId);
  if (!user) return { success: false, error: "Pengguna tidak ditemukan." };

  const now = new Date().toISOString();
  sheet.getRange(user._rowIndex, 6).setValue(true); // status_aktif = true
  sheet.getRange(user._rowIndex, 9).setValue(now);  // updated_at
  if (roleId) sheet.getRange(user._rowIndex, 5).setValue(roleId);
  if (sheet.getLastColumn() >= 10) {
    sheet.getRange(user._rowIndex, 10).setValue("approved");
  }

  const session = verifyToken(token);
  logActivity(session ? session.userId : "ADMIN", "APPROVE_USER: " + user.nama, null);

  return { success: true, message: "Akun " + user.nama + " berhasil disetujui & diaktifkan." };
}

function rejectUser(userId, reason, token) {
  if (!checkUserPermission(token, "manage_users")) {
    return { success: false, error: "Akses ditolak: Hanya admin yang dapat menolak pendaftaran." };
  }

  const { sheet, rows: users } = getSheetData("tb_users");
  const user = users.find(u => u.id_user === userId);
  if (!user) return { success: false, error: "Pengguna tidak ditemukan." };

  const now = new Date().toISOString();
  sheet.getRange(user._rowIndex, 6).setValue(false); // status_aktif = false
  sheet.getRange(user._rowIndex, 9).setValue(now);
  if (sheet.getLastColumn() >= 10) {
    sheet.getRange(user._rowIndex, 10).setValue("rejected");
  }

  const session = verifyToken(token);
  logActivity(session ? session.userId : "ADMIN", "REJECT_USER: " + user.nama, null);

  return { success: true, message: "Pendaftaran " + user.nama + " telah ditolak." };
}

/**
 * Memproses avatar URL agar aman dan tidak melebihi limit sel Google Sheets (50.000 karakter)
 */
function processAvatarUrl(rawUrl, userId, userName) {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  const trimmed = rawUrl.trim();
  if (!trimmed.startsWith("data:image")) {
    return trimmed; // URL online biasa
  }

  // Jika ukuran base64 aman di dalam sel spreadsheet (< 35.000 karakter)
  if (trimmed.length <= 35000) {
    return trimmed;
  }

  // Jika melebihi 35.000 karakter, simpan ke Google Drive
  try {
    const uploadRes = uploadImageToDrive(trimmed, "avatar_" + userId + "_" + new Date().getTime() + ".jpg", "image/jpeg");
    if (uploadRes && uploadRes.success && uploadRes.file_url) {
      return uploadRes.file_url;
    }
  } catch (err) {
    Logger.log("uploadAvatarToDrive error: " + err.message);
  }

  // Fallback aman avatar SVG Dicebear agar tidak melebihi 50.000 karakter
  return "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(userName || userId);
}

function createUser(nama, kodeLogin, username, roleId, fotoUrl, token) {
  if (!checkUserPermission(token, "manage_users")) {
    return { success: false, error: "Akses ditolak." };
  }

  if (!nama || !kodeLogin || !username || !roleId) {
    return { success: false, error: "Nama, kode login, username, dan role wajib diisi." };
  }

  const ss = getSpreadsheet();
  const userSheet = ss.getSheetByName("tb_users");
  const userId = "USR_" + Utilities.getUuid().substring(0, 8).toUpperCase();
  const now = new Date().toISOString();
  const safeFoto = fotoUrl ? processAvatarUrl(fotoUrl, userId, nama) : "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(nama);

  const newRow = [
    userId,
    nama.trim(),
    hashPassword(kodeLogin),
    username.trim().toLowerCase(),
    roleId,
    true,
    safeFoto,
    now,
    now
  ];

  userSheet.appendRow(newRow);

  const session = verifyToken(token);
  logActivity(session ? session.userId : "ADMIN", "CREATE_USER: " + nama, null);

  return { success: true, message: "Pengguna baru berhasil ditambahkan." };
}

function updateUser(userId, nama, kodeLogin, username, roleId, fotoUrl, statusAktif, token) {
  if (!checkUserPermission(token, "manage_users")) {
    return { success: false, error: "Akses ditolak." };
  }

  const { sheet, rows: users } = getSheetData("tb_users");
  const user = users.find(u => u.id_user === userId);
  if (!user) return { success: false, error: "Pengguna tidak ditemukan." };

  const now = new Date().toISOString();
  if (nama) sheet.getRange(user._rowIndex, 2).setValue(nama.trim());
  if (kodeLogin && kodeLogin.trim() !== "") {
    sheet.getRange(user._rowIndex, 3).setValue(hashPassword(kodeLogin.trim()));
  }
  if (username) sheet.getRange(user._rowIndex, 4).setValue(username.trim().toLowerCase());
  if (roleId) sheet.getRange(user._rowIndex, 5).setValue(roleId);
  if (statusAktif !== undefined) sheet.getRange(user._rowIndex, 6).setValue(Boolean(statusAktif));
  if (fotoUrl) {
    const safeFoto = processAvatarUrl(fotoUrl, user.id_user, user.nama);
    sheet.getRange(user._rowIndex, 7).setValue(safeFoto);
  }
  sheet.getRange(user._rowIndex, 9).setValue(now);

  return { success: true, message: "Data pengguna berhasil diperbarui." };
}

function toggleUserStatus(userId, token) {
  if (!checkUserPermission(token, "manage_users")) {
    return { success: false, error: "Akses ditolak." };
  }

  const { sheet, rows: users } = getSheetData("tb_users");
  const user = users.find(u => u.id_user === userId);
  if (!user) return { success: false, error: "Pengguna tidak ditemukan." };

  const currentStatus = (user.status_aktif === true || user.status_aktif === "TRUE" || user.status_aktif === 1);
  const newStatus = !currentStatus;

  sheet.getRange(user._rowIndex, 6).setValue(newStatus);
  sheet.getRange(user._rowIndex, 9).setValue(new Date().toISOString());

  return { success: true, message: "Status pengguna diubah menjadi " + (newStatus ? "Aktif" : "Nonaktif"), status_aktif: newStatus };
}

function deleteUser(userId, token) {
  if (!checkUserPermission(token, "manage_users")) {
    return { success: false, error: "Akses ditolak: Hanya admin yang dapat menghapus akun." };
  }

  if (!userId) {
    return { success: false, error: "ID Pengguna wajib disertakan." };
  }

  if (userId === "USR_ADMIN_IFTAH" || (userId && userId.toString().toLowerCase() === "iftahadmin")) {
    return { success: false, error: "Akun Super Admin Utama (iftahadmin) dilindungi dan tidak dapat dihapus demi integritas sistem." };
  }

  const { sheet, rows: users } = getSheetData("tb_users");
  const user = users.find(u => u.id_user === userId || u.username === userId);
  if (!user) {
    return { success: false, error: "Pengguna tidak ditemukan." };
  }

  if (user.username && user.username.toString().toLowerCase() === "iftahadmin") {
    return { success: false, error: "Akun Super Admin Utama (iftahadmin) dilindungi dan tidak dapat dihapus." };
  }

  // Hapus baris dari sheet tb_users
  sheet.deleteRow(user._rowIndex);

  // Hapus keanggotaan pengguna ini dari tb_room_members jika ada
  try {
    const { sheet: memberSheet, rows: members } = getSheetData("tb_room_members");
    const memberRows = members
      .filter(m => m.id_user === user.id_user)
      .map(m => m._rowIndex)
      .sort((a, b) => b - a);

    for (let i = 0; i < memberRows.length; i++) {
      memberSheet.deleteRow(memberRows[i]);
    }
  } catch (e) {
    Logger.log("Error hapus member room pada deleteUser: " + e.message);
  }

  const session = verifyToken(token);
  logActivity(session ? session.userId : "ADMIN", "DELETE_USER: " + user.nama + " (@" + user.username + ")", null);

  return { success: true, message: "Pengguna '" + user.nama + "' (@" + user.username + ") berhasil dihapus secara permanen." };
}

function updateProfile(userId, data, token) {
  const { sheet, rows: users } = getSheetData("tb_users");
  const user = users.find(u => u.id_user === userId);
  if (!user) return { success: false, error: "Pengguna tidak ditemukan." };

  const now = new Date().toISOString();
  if (data.nama && data.nama.trim()) {
    sheet.getRange(user._rowIndex, 2).setValue(data.nama.trim());
  }
  if (data.kodeLogin && data.kodeLogin.trim()) {
    sheet.getRange(user._rowIndex, 3).setValue(hashPassword(data.kodeLogin.trim()));
  }
  if (data.fotoUrl !== undefined && data.fotoUrl.trim()) {
    const safeFoto = processAvatarUrl(data.fotoUrl.trim(), user.id_user, user.nama);
    sheet.getRange(user._rowIndex, 7).setValue(safeFoto);
  }
  if (sheet.getLastColumn() >= 11 && data.noWa !== undefined) {
    sheet.getRange(user._rowIndex, 11).setValue(data.noWa.trim());
  }
  if (sheet.getLastColumn() >= 12 && data.keterangan !== undefined) {
    sheet.getRange(user._rowIndex, 12).setValue(data.keterangan.trim());
  }
  sheet.getRange(user._rowIndex, 9).setValue(now);

  return { success: true, message: "Profil berhasil diperbarui." };
}

function getPendingUsers(token) {
  const { rows: users } = getSheetData("tb_users");
  const pending = users
    .filter(u => u.approval_status === "pending" || u.status_aktif === false || u.status_aktif === "FALSE" || u.status_aktif === 0)
    .map(u => ({
      id_user: u.id_user,
      nama: u.nama,
      username: u.username,
      role_id: u.role_id,
      no_wa: u.no_wa || "",
      keterangan: u.keterangan || "",
      created_at: u.created_at,
      approval_status: u.approval_status || "pending"
    }));

  return { success: true, users: pending };
}

function checkUserStatus(identifier) {
  if (!identifier) return { success: false, error: "Username atau nomor WA wajib diisi." };
  const { rows: users } = getSheetData("tb_users");
  const clean = identifier.toString().trim().toLowerCase();
  const user = users.find(u => 
    (u.username && u.username.toString().trim().toLowerCase() === clean) ||
    (u.no_wa && u.no_wa.toString().trim() === clean) ||
    (u.id_user === identifier)
  );

  if (!user) {
    return { success: false, error: "Akun tidak ditemukan." };
  }

  return {
    success: true,
    user: {
      nama: user.nama,
      username: user.username,
      status_aktif: (user.status_aktif === true || user.status_aktif === "TRUE" || user.status_aktif === 1),
      approval_status: user.approval_status || ((user.status_aktif === true || user.status_aktif === "TRUE" || user.status_aktif === 1) ? "approved" : "pending")
    }
  };
}

function updateUserPermissions(targetUserId, permissions, token) {
  if (!checkUserPermission(token, "manage_roles")) {
    return { success: false, error: "Akses ditolak: Hanya admin yang dapat mengatur hak akses." };
  }
  return { success: true, message: "Hak akses pengguna berhasil diperbarui." };
}

function updateRolePermissions(roleId, permissions, token) {
  if (!checkUserPermission(token, "manage_roles")) {
    return { success: false, error: "Akses ditolak: Hanya admin yang dapat mengatur hak akses role." };
  }
  return { success: true, message: "Hak akses role berhasil diperbarui." };
}

function getRoles(token) {
  const { rows: roles } = getSheetData("tb_roles");
  return { success: true, roles: roles };
}

function getPermissions(token) {
  const { rows: permissions } = getSheetData("tb_permissions");
  return { success: true, permissions: permissions };
}

function getDashboardStats(token) {
  const { rows: users } = getSheetData("tb_users");
  const { rows: rooms } = getSheetData("tb_rooms");
  const { rows: messages } = getSheetData("tb_messages");

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status_aktif === true || u.status_aktif === "TRUE" || u.status_aktif === 1).length;
  const totalRooms = rooms.length;
  const totalMessages = messages.length;
  const totalImages = messages.filter(m => m.message_type === "image").length;

  return {
    success: true,
    stats: {
      totalUsers: totalUsers,
      activeUsers: activeUsers,
      totalRooms: totalRooms,
      totalMessages: totalMessages,
      totalImages: totalImages
    }
  };
}

/**
 * Super-fast Batch Bundle API: Membaca semua data dashboard dalam SATU kali akses spreadsheet
 */
function getAdminDashboardBundle(userId, token) {
  const ss = getSpreadsheet();
  
  const { rows: users } = getSheetData("tb_users");
  const { rows: roles } = getSheetData("tb_roles");
  const { rows: permissions } = getSheetData("tb_permissions");
  const { rows: rooms } = getSheetData("tb_rooms");
  const { rows: members } = getSheetData("tb_room_members");
  const { rows: messages } = getSheetData("tb_messages");
  const { rows: logs } = getSheetData("tb_user_activity_logs");

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status_aktif === true || u.status_aktif === "TRUE" || u.status_aktif === 1).length;
  const totalRooms = rooms.length;
  const totalMessages = messages.length;
  const totalImages = messages.filter(m => m.message_type === "image").length;

  const roleMap = {};
  roles.forEach(r => { roleMap[r.id_role] = r.nama_role; });

  const safeUsers = users.map(u => ({
    id_user: u.id_user,
    nama: u.nama,
    username: u.username,
    role_id: u.role_id,
    role_nama: roleMap[u.role_id] || u.role_id,
    status_aktif: (u.status_aktif === true || u.status_aktif === "TRUE" || u.status_aktif === 1),
    approval_status: u.approval_status || ((u.status_aktif === true || u.status_aktif === "TRUE" || u.status_aktif === 1) ? "approved" : "pending"),
    no_wa: u.no_wa || "",
    keterangan: u.keterangan || "",
    foto_url: u.foto_url,
    created_at: u.created_at,
    updated_at: u.updated_at
  }));

  const callerId = userId || "USR_ADMIN_IFTAH";
  const myMemberships = members.filter(m => m.id_user === callerId && m.status === "active");
  const myRoomIds = new Set(myMemberships.map(m => m.id_room));
  const formattedRooms = rooms
    .filter(r => r.status_aktif === true || r.status_aktif === "TRUE" || r.status_aktif === 1)
    .map(r => ({
      id_room: r.id_room,
      nama_room: r.nama_room,
      deskripsi: r.deskripsi,
      foto_url: r.foto_url,
      created_by: r.created_by,
      membutuhkan_kode: (r.membutuhkan_kode === true || r.membutuhkan_kode === "TRUE" || r.membutuhkan_kode === 1),
      is_joined: myRoomIds.has(r.id_room),
      member_count: members.filter(m => m.id_room === r.id_room && m.status === "active").length,
      created_at: r.created_at
    }));

  const userMap = {};
  users.forEach(u => { userMap[u.id_user] = u.nama; });
  const formattedLogs = logs.slice(Math.max(0, logs.length - 40)).reverse().map(l => ({
    id_log: l.id_log,
    id_user: l.id_user,
    user_name: userMap[l.id_user] || l.id_user,
    activity: l.activity,
    id_room: l.id_room,
    created_at: l.created_at
  }));

  return {
    success: true,
    stats: {
      totalUsers: totalUsers,
      activeUsers: activeUsers,
      totalRooms: totalRooms,
      totalMessages: totalMessages,
      totalImages: totalImages
    },
    users: safeUsers,
    rooms: formattedRooms,
    roles: roles,
    permissions: permissions,
    logs: formattedLogs
  };
}

// ==========================================
// 11. AUDIT LOGGING
// ==========================================

function logActivity(userId, activity, roomId) {
  try {
    const ss = getSpreadsheet();
    const logSheet = ss.getSheetByName("tb_user_activity_logs");
    if (!logSheet) return { success: false };

    const logId = "LOG_" + Utilities.getUuid().substring(0, 8);
    const now = new Date().toISOString();

    logSheet.appendRow([
      logId,
      userId || "ANONYMOUS",
      activity,
      roomId || "",
      now
    ]);

    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function getActivityLogs(limit, token) {
  if (!checkUserPermission(token, "view_dashboard")) {
    return { success: false, error: "Akses ditolak." };
  }

  const { rows: logs } = getSheetData("tb_user_activity_logs");
  const { rows: users } = getSheetData("tb_users");

  const userMap = {};
  users.forEach(u => { userMap[u.id_user] = u.nama; });

  const maxLimit = limit ? parseInt(limit) : 50;
  const sliced = logs.slice(Math.max(0, logs.length - maxLimit)).reverse();

  const formatted = sliced.map(l => ({
    id_log: l.id_log,
    id_user: l.id_user,
    user_name: userMap[l.id_user] || l.id_user,
    activity: l.activity,
    id_room: l.id_room,
    created_at: l.created_at
  }));

  return { success: true, logs: formatted };
}
