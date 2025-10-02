#!/bin/bash

# 🚀 Android APK Deployment Script
# Script otomatis untuk build APK Android dari GitHub

echo "📱 Financial Records App - Android Deployment"
echo "=============================================="

# Check if required tools are installed
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 tidak terinstall. Silakan install terlebih dahulu."
        exit 1
    fi
}

echo "🔍 Checking required tools..."
check_command "git"
check_command "node"
check_command "npm"

# Setup directories
FRONTEND_DIR="./frontend"
BACKEND_DIR="./backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Check if backend is deployed
print_step "Step 1: Backend Deployment Check"
read -p "Apakah backend sudah di-deploy dan dapat diakses? (y/n): " backend_deployed

if [ "$backend_deployed" != "y" ]; then
    print_warning "Silakan deploy backend terlebih dahulu:"
    echo "- Deploy via Emergent platform"
    echo "- Atau deploy ke Railway/Render/Heroku"
    echo "- Catat URL production backend"
    exit 1
fi

# Step 2: Get backend URL
print_step "Step 2: Backend URL Configuration"
read -p "Masukkan URL backend production (contoh: https://your-app.emergent.sh): " backend_url

if [ -z "$backend_url" ]; then
    print_error "Backend URL tidak boleh kosong!"
    exit 1
fi

# Step 3: Install EAS CLI if not exists
print_step "Step 3: Setup EAS CLI"
if ! command -v eas &> /dev/null; then
    echo "Installing EAS CLI..."
    npm install -g @expo/eas-cli
fi

print_success "EAS CLI ready"

# Step 4: Setup frontend environment
print_step "Step 4: Configure Frontend Environment"
cd $FRONTEND_DIR

# Create production environment file
cat > .env.production << EOF
EXPO_PUBLIC_BACKEND_URL=$backend_url
EOF

print_success "Environment configured with backend URL: $backend_url"

# Step 5: Install dependencies
print_step "Step 5: Installing Dependencies"
if [ -f "yarn.lock" ]; then
    yarn install
elif [ -f "package-lock.json" ]; then
    npm install
else
    npm install
fi

print_success "Dependencies installed"

# Step 6: Expo/EAS Setup
print_step "Step 6: Expo Account Setup"
echo "Pastikan Anda sudah memiliki akun Expo di https://expo.dev"
read -p "Sudah login ke Expo? Jika belum, jalankan 'eas login' (y/n): " expo_login

if [ "$expo_login" != "y" ]; then
    echo "Menjalankan eas login..."
    eas login
fi

# Step 7: Build APK
print_step "Step 7: Building Android APK"
echo "Pilih tipe build:"
echo "1. Preview (APK - untuk testing)"
echo "2. Production (AAB - untuk Play Store)"
read -p "Pilih opsi (1/2): " build_type

case $build_type in
    1)
        print_step "Building Preview APK..."
        eas build --platform android --profile preview
        ;;
    2)
        print_step "Building Production AAB..."
        eas build --platform android --profile production
        ;;
    *)
        print_error "Pilihan tidak valid!"
        exit 1
        ;;
esac

# Step 8: Instructions
print_success "Build process started!"
echo ""
echo "📋 Next Steps:"
echo "1. Build akan berjalan di cloud (5-15 menit)"
echo "2. Monitor progress di: https://expo.dev/accounts/[your-username]/projects"
echo "3. Setelah selesai, download APK/AAB dari dashboard Expo"
echo "4. Install APK di Android device untuk testing"
echo ""
echo "🔗 Useful Links:"
echo "- Expo Dashboard: https://expo.dev"
echo "- Build Documentation: https://docs.expo.dev/build/introduction/"
echo "- GitHub Actions: https://github.com/[your-username]/[your-repo]/actions"
echo ""
print_success "Deployment script completed!"

cd ..