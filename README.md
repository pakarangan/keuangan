# 📱 Financial Records App - Aplikasi Pencatatan Keuangan

Aplikasi pencatatan keuangan lengkap dengan fitur OCR receipt scanning, laporan PDF/Excel export, dan manajemen akun komprehensif.

## ✨ Fitur Utama

### 🔐 Authentication & Dashboard
- Login/Register dengan JWT authentication
- Dashboard real-time financial summary
- User company profile management

### 💰 Transaction Management  
- Input transaksi manual atau via OCR receipt scanning
- Auto-categorization berdasarkan akun
- History transaksi dengan filter dan search
- Balance auto-update untuk setiap transaksi

### 📊 Account Management
- 5 kategori akun: **Aset**, **Utang**, **Pendapatan**, **Modal**, **Biaya**
- Default accounts auto-creation untuk new users
- Balance tracking per account
- Transaction history per account

### 📸 Receipt OCR Scanning
- Camera/gallery integration untuk capture receipt
- EasyOCR processing untuk ekstrak data otomatis
- Auto-fill transaction form dengan data hasil scan
- Support Indonesian dan English text recognition

### 📄 Financial Reports
- **Laporan Laba Rugi** (Profit & Loss Statement)
- **Neraca** (Balance Sheet)  
- Export ke PDF dan Excel format
- Custom date range selection
- Ready untuk keperluan pajak dan audit

### 📱 Mobile-First Experience
- Native Android/iOS experience dengan Expo
- Touch-friendly interface design
- Responsive layout untuk berbagai screen size
- Offline capability untuk basic operations

## 🚀 Tech Stack

- **Frontend**: Expo React Native + TypeScript
- **Backend**: FastAPI + Pydantic
- **Database**: MongoDB dengan Motor (async driver)
- **Authentication**: JWT tokens
- **OCR**: EasyOCR untuk receipt processing
- **Reports**: ReportLab (PDF) + OpenPyXL (Excel)
- **Build**: GitHub Actions + EAS Build

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB running
- Expo CLI

### Local Development
```bash
# 1. Clone repository
git clone <your-repo-url>
cd financial-records-app

# 2. Backend setup
cd backend
pip install -r requirements.txt
python server.py

# 3. Frontend setup  
cd ../frontend
yarn install
expo start

# 4. Open Expo Go app and scan QR code
```

## 📱 Build Android APK

### Quick Start dengan Script
```bash
# Jalankan automated deployment script
chmod +x deploy-android.sh
./deploy-android.sh
```

### Manual Build via GitHub Actions

1. **Push ke GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Android build"
   git push origin main
   ```

2. **Setup GitHub Secrets**:
   - `EXPO_TOKEN`: Token dari expo.dev account
   - `BACKEND_URL`: Production backend URL

3. **Trigger Build**:
   - Go to GitHub → Actions → "Build Android APK"
   - Click "Run workflow"
   - Choose build type (preview/production)

4. **Download APK**:
   - Check Expo dashboard setelah build complete
   - Download APK dan install di Android device

### Manual Build via EAS CLI
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build APK (for testing)
cd frontend
eas build --platform android --profile preview

# Build AAB (for Play Store)
eas build --platform android --profile production
```

## 🔧 Deployment Options

### Backend Deployment
- **Emergent Platform** (recommended): One-click deploy
- **Railway**: Automated deployment dari GitHub  
- **Render**: Free tier dengan PostgreSQL option
- **Heroku**: Classic PaaS dengan add-ons

### Frontend Distribution
- **Direct APK**: Install langsung di Android devices
- **Google Play Store**: Publish untuk public distribution
- **Enterprise Distribution**: Internal company deployment
- **Expo Updates**: OTA updates tanpa app store

## 🧪 Testing

### Test Credentials
- **Username**: `testuser`
- **Password**: `password123`
- **Company**: `PT Test Company`

### API Testing
```bash
# Health check
curl http://localhost:8001/api/health

# Login test
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## 📋 API Documentation

Backend menyediakan RESTful API dengan endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login dengan JWT

### Accounts
- `GET /api/accounts` - List user accounts
- `POST /api/accounts` - Create new account

### Transactions  
- `GET /api/transactions` - List transactions (dengan filter)
- `POST /api/transactions` - Create transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Reports
- `GET /api/financial-summary` - Real-time financial summary
- `GET /api/reports/profit-loss/pdf` - Generate PDF profit & loss
- `GET /api/reports/profit-loss/excel` - Generate Excel profit & loss
- `GET /api/reports/balance-sheet/pdf` - Generate PDF balance sheet

### OCR
- `POST /api/ocr/extract-receipt` - Extract text dari receipt image

## 🔍 Troubleshooting

### Common Issues

**Build fails di GitHub Actions**:
- Check EXPO_TOKEN validity
- Verify backend URL accessibility
- Check EAS configuration

**APK tidak bisa install**:
- Enable "Install unknown apps" di Android Settings
- Check file corruption, re-download APK
- Clear storage space

**App crash after install**:
- Verify backend production URL accessible
- Check API endpoint responses
- Test dengan development build dulu

## 📞 Support & Contributing

- **Documentation**: Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk deployment guide
- **Issues**: Report bugs via GitHub Issues
- **Contributing**: Fork repository dan submit PR

## 📄 License

MIT License - see LICENSE file untuk details.

---

**🎉 Selamat menggunakan Financial Records App! Kelola keuangan bisnis Anda dengan mudah dan profesional.**

