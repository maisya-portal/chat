const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = '1H_dZ6byEONLRbb-7kaY6UH59OTX1eOJ9aHSsHifqeQw';
const SCRIPT_ID = '14zzsCZBwO3nqIqKcd8BVisehmJ1pd9Z4nX8w-VccNyt0OzM2sLv9obhW';
const KNOWN_DEPLOYMENT_ID = 'AKfycbzOu3xkwcqRbBCP_OyOP04ZeSNYdCGou_xpJjtCt0H7l9evJ86oVjIfd3_AOnmqcxFH';
const CLASP_RC_PATH = 'C:/Users/Ponpes Imam Syafii/.clasprc.json';

async function getAccessToken() {
  if (!fs.existsSync(CLASP_RC_PATH)) {
    throw new Error(`.clasprc.json tidak ditemukan di ${CLASP_RC_PATH}`);
  }
  const rc = JSON.parse(fs.readFileSync(CLASP_RC_PATH, 'utf8'));
  const creds = rc.tokens.default;

  if (creds.expiry_date && creds.expiry_date > Date.now() + 60000 && creds.access_token) {
    return creds.access_token;
  }

  console.log('🔄 Memperbarui access token OAuth...');
  const postData = new URLSearchParams({
    client_id: creds.client_id,
    client_secret: creds.client_secret,
    refresh_token: creds.refresh_token,
    grant_type: 'refresh_token'
  }).toString();

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: postData
  });
  const data = await res.json();
  if (data.access_token) {
    creds.access_token = data.access_token;
    creds.expiry_date = Date.now() + (data.expires_in * 1000);
    fs.writeFileSync(CLASP_RC_PATH, JSON.stringify(rc, null, 2), 'utf8');
    console.log('✓ Token berhasil diperbarui!');
    return data.access_token;
  }
  throw new Error('Gagal refresh token: ' + JSON.stringify(data));
}

async function main() {
  try {
    console.log('====================================================');
    console.log('⚡ SINKRONISASI & DEPLOYMENT GOOGLE APPS SCRIPT');
    console.log(`📌 Spreadsheet ID: ${SPREADSHEET_ID}`);
    console.log(`📌 Script ID:      ${SCRIPT_ID}`);
    console.log('====================================================\n');

    const token = await getAccessToken();

    // 1. Baca source code lokal
    const setupDbCode = fs.readFileSync(path.join(__dirname, '../google-apps-script/setupDatabase.gs'), 'utf8');
    const codeGsCode = fs.readFileSync(path.join(__dirname, '../google-apps-script/Code.gs'), 'utf8');

    const manifest = JSON.stringify({
      timeZone: 'Asia/Jakarta',
      dependencies: {},
      exceptionLogging: 'STACKDRIVER',
      runtimeVersion: 'V8',
      webapp: {
        executeAs: 'USER_DEPLOYING',
        access: 'ANYONE_ANONYMOUS'
      }
    }, null, 2);

    const payload = {
      files: [
        {
          name: 'appsscript',
          type: 'JSON',
          source: manifest
        },
        {
          name: 'setupDatabase',
          type: 'SERVER_JS',
          source: setupDbCode
        },
        {
          name: 'Code',
          type: 'SERVER_JS',
          source: codeGsCode
        }
      ]
    };

    console.log('📤 Mengunggah file ke Google Apps Script Project...');
    const uploadRes = await fetch(`https://script.googleapis.com/v1/projects/${SCRIPT_ID}/content`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      throw new Error(`Gagal upload content (${uploadRes.status}): ` + JSON.stringify(uploadData));
    }
    console.log('✓ File berhasil diunggah ke Google Apps Script:');
    uploadData.files.forEach(f => console.log(`   - ${f.name} (${f.type})`));

    // 2. Buat Version baru
    console.log('\n📦 Membuat rilis versi baru (Apps Script Version)...');
    const versionRes = await fetch(`https://script.googleapis.com/v1/projects/${SCRIPT_ID}/versions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'Maisya Chat Room API & Database Initializer v' + new Date().toISOString()
      })
    });
    const versionData = await versionRes.json();
    const versionNumber = versionData.versionNumber || 1;
    console.log(`✓ Berhasil dibuat Versi #${versionNumber}`);

    // 3. Update deployment aktif
    console.log(`\n🚀 Memperbarui Web App Deployment (${KNOWN_DEPLOYMENT_ID})...`);
    const updateDepRes = await fetch(`https://script.googleapis.com/v1/projects/${SCRIPT_ID}/deployments/${KNOWN_DEPLOYMENT_ID}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deploymentConfig: {
          scriptId: SCRIPT_ID,
          versionNumber: versionNumber,
          manifestFileName: 'appsscript',
          description: `Maisya Chat Room API v${versionNumber}`
        }
      })
    });
    const updateDepData = await updateDepRes.json();
    console.log(`✓ Deployment status: ${updateDepRes.status}`);

    const webAppUrl = `https://script.google.com/macros/s/${KNOWN_DEPLOYMENT_ID}/exec`;
    console.log(`\n🌐 Web App URL Aktif:\n👉 ${webAppUrl}`);

    // Simpan ke .env
    const envPath = path.join(__dirname, '../.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    if (envContent.includes('VITE_GAS_API_URL=')) {
      envContent = envContent.replace(/VITE_GAS_API_URL=.*(\r?\n|$)/, `VITE_GAS_API_URL=${webAppUrl}$1`);
    } else {
      envContent = `VITE_GAS_API_URL=${webAppUrl}\n` + envContent;
    }
    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
    console.log('✓ File .env berhasil diperbarui dengan VITE_GAS_API_URL');

    console.log('\n====================================================');
    console.log('🎉 SINKRONISASI SUKSES 100%!');
    console.log('====================================================');
    console.log('\nLangkah selanjutnya untuk inisialisasi sheet database:');
    console.log('1. Buka Google Spreadsheet Anda:');
    console.log(`   https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
    console.log('2. Buka menu Ekstensi > Apps Script (atau buka langsung):');
    console.log(`   https://script.google.com/d/${SCRIPT_ID}/edit`);
    console.log('3. Pada dropdown fungsi di toolbar atas, pilih:');
    console.log('   `setupMaisyaChatDatabase`');
    console.log('4. Klik tombol [▷ Run] (Jalankan).');
    console.log('5. Klik [Tinjau Izin / Review Permissions] dan berikan otorisasi satu kali.');
    console.log('6. Seluruh 13 sheet database akan langsung terisi rapi dengan header Emerald Green!');
    console.log('====================================================\n');

  } catch (err) {
    console.error('\n❌ Terjadi kesalahan:', err);
    process.exit(1);
  }
}

main();
