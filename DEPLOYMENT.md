# 🚀 Deployment Guide: Build Android APK via GitHub

Panduan lengkap untuk mengubah aplikasi pencatatan keuangan ini menjadi APK Android menggunakan GitHub Actions.

## 📋 Prerequisites

1. **Akun GitHub** - untuk hosting repository
2. **Akun Expo** - untuk build service (gratis)
3. **Backend yang sudah di-deploy** - URL production backend

## 🔧 Setup Langkah demi Langkah

### 1. Push Code ke GitHub

```bash
# Clone atau fork repository ini
git clone <your-github-repo-url>
cd financial-records-app

# Atau jika sudah ada, push changes
git add .
git commit -m "Initial commit - Financial Records App"
git push origin main
```

### 2. Setup Expo Account & Token

1. Daftar di [expo.dev](https://expo.dev)
2. Install EAS CLI: `npm install -g @expo/eas-cli`
3. Login: `eas login`
4. Generate access token: `eas whoami` → Account Settings → Access Tokens
5. Copy token untuk GitHub Secrets

### 3. Setup GitHub Secrets

Di GitHub repository → Settings → Secrets and Variables → Actions:

**Required Secrets:**
- `EXPO_TOKEN`: Access token dari Expo
- `BACKEND_URL`: URL backend production (contoh: `https://your-app.emergent.sh`)

**Optional Secrets:**
- `GOOGLE_SERVICES_JSON`: Untuk Firebase (jika digunakan)
- `ANDROID_KEYSTORE`: Untuk signed builds

### 4. Deploy Backend First

**Option A: Deploy via Emergent**
```bash
# Di platform Emergent, gunakan tombol Deploy
# Backend akan mendapat URL seperti: https://your-app.emergent.sh
```

**Option B: Deploy ke Railway/Render/Heroku**
```bash
# Setup deployment sesuai provider pilihan
# Update environment variables untuk MongoDB
```

### 5. Update Frontend Configuration

Update file `frontend/.env.production`:
```bash
EXPO_PUBLIC_BACKEND_URL=https://your-deployed-backend-url.com
```

### 6. Trigger Build via GitHub Actions

**Manual Trigger:**
1. Go to GitHub repository → Actions tab
2. Select "Build Android APK" workflow  
3. Click "Run workflow"
4. Choose build type: `preview` (APK) atau `production` (AAB)

**Auto Trigger:**
- Push ke branch `main` akan otomatis trigger build preview
- Manual dispatch untuk production builds

### 7. Download APK

1. Build akan berjalan ~5-15 menit
2. Check progress di GitHub Actions tab
3. Setelah selesai, login ke [expo.dev](https://expo.dev)
4. Go to Projects → Your App → Builds
5. Download APK file

### 8. Install & Test

```bash
# Transfer APK ke Android device
adb install app-release.apk

# Atau manual:
# 1. Enable "Unknown Sources" di Android Settings
# 2. Transfer APK via USB/email/cloud
# 3. Tap APK file untuk install
```

## 📱 Build Types

### Preview Build (APK)
- ✅ Quick development testing
- ✅ Install langsung di device
- ✅ Debugging enabled
- ❌ Tidak untuk production

### Production Build (AAB) 
- ✅ Optimized untuk Play Store
- ✅ Smaller file size
- ✅ Signed dengan release key
- ❌ Perlu Google Play Console untuk distribute

## 🔄 Workflow Otomatis

File `.github/workflows/build-android.yml` sudah dikonfigurasi untuk:

- **Auto Build on Push**: Setiap push ke main = build preview APK
- **Manual Production Build**: Via GitHub Actions interface
- **Environment Setup**: Otomatis setup Node.js, Expo, EAS
- **Notifications**: Comment di PR dengan build status

## 🐛 Troubleshooting

### Build Gagal
```bash
# Check logs di GitHub Actions
# Common issues:
1. Invalid EXPO_TOKEN
2. Backend URL tidak accessible
3. Missing dependencies di package.json
4. EAS configuration error
```

### APK tidak bisa install
```bash
# Solutions:
1. Enable "Install unknown apps" di Android
2. Check file corruption (re-download APK)
3. Clear space di device storage
4. Try different transfer method
```

### App crash setelah install
```bash
# Debug steps:
1. Check backend URL accessibility dari mobile network
2. Verify API endpoints working
3. Check console logs via USB debugging
4. Test with development build first
```

## 🚀 Next Steps

### Publish ke Google Play Store

1. **Setup Play Console Account** ($25 one-time)
2. **Build Production AAB**:
   ```bash
   # Trigger production build via GitHub Actions
   # Download .aab file from Expo
   ```
3. **Upload to Play Console**
4. **Fill App Information** (screenshots, description)
5. **Submit for Review**

### Advanced Features

- **Auto-increment version**: Update `version` & `versionCode` di app.json
- **Code signing**: Setup keystore untuk consistent signatures
- **Multiple environments**: Staging, production builds
- **Automatic deployment**: Auto-deploy dari GitHub releases

## 📞 Support

Jika ada issues:
1. Check GitHub Actions logs
2. Verify Expo dashboard untuk build details  
3. Test backend API accessibility
4. Check mobile device compatibility

---

**🎉 Selamat! Aplikasi pencatatan keuangan Anda siap di-distribute sebagai APK Android!**