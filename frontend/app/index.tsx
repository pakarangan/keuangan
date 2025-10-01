import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface User {
  id: string;
  username: string;
  email: string;
  company_name: string;
}

interface FinancialSummary {
  total_aset: number;
  total_utang: number;
  total_pendapatan: number;
  total_modal: number;
  total_biaya: number;
  net_income: number;
}

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadFinancialSummary();
    }
  }, [isAuthenticated, token]);

  const checkAuthStatus = async () => {
    // In a real app, you would check for stored token
    setLoading(false);
  };

  const login = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoginLoading(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.access_token);
        setUser(data.user);
        setIsAuthenticated(true);
        setUsername('');
        setPassword('');
      } else {
        Alert.alert('Login Failed', data.detail || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const loadFinancialSummary = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/financial-summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      } else {
        console.error('Failed to load financial summary');
      }
    } catch (error) {
      console.error('Error loading financial summary:', error);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setSummary(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.loginContainer}>
            <View style={styles.headerContainer}>
              <MaterialIcons name="account-balance" size={60} color="#2196F3" />
              <Text style={styles.appTitle}>Pencatatan Keuangan</Text>
              <Text style={styles.appSubtitle}>Kelola keuangan bisnis Anda dengan mudah</Text>
            </View>

            <View style={styles.loginForm}>
              <Text style={styles.formTitle}>Masuk ke Akun Anda</Text>
              
              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.loginButton, loginLoading && styles.loginButtonDisabled]}
                onPress={login}
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Masuk</Text>
                )}
              </TouchableOpacity>

              <View style={styles.registerPrompt}>
                <Text style={styles.registerText}>Belum punya akun? </Text>
                <TouchableOpacity>
                  <Text style={styles.registerLink}>Daftar di sini</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Fitur Aplikasi:</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <MaterialIcons name="photo-camera" size={16} color="#4CAF50" />
                  <Text style={styles.featureText}>Scan Receipt</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="assessment" size={16} color="#4CAF50" />
                  <Text style={styles.featureText}>Laporan Keuangan</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="file-download" size={16} color="#4CAF50" />
                  <Text style={styles.featureText}>Export PDF/Excel</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Selamat datang, {user?.username}!</Text>
            <Text style={styles.companyText}>{user?.company_name}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <MaterialIcons name="logout" size={24} color="#f44336" />
          </TouchableOpacity>
        </View>

        {summary && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Ringkasan Keuangan</Text>
            
            <View style={styles.summaryGrid}>
              <View style={[styles.summaryCard, styles.assetCard]}>
                <MaterialIcons name="account-balance-wallet" size={24} color="#4CAF50" />
                <Text style={styles.summaryLabel}>Total Aset</Text>
                <Text style={styles.summaryAmount}>{formatCurrency(summary.total_aset)}</Text>
              </View>

              <View style={[styles.summaryCard, styles.liabilityCard]}>
                <MaterialIcons name="credit-card" size={24} color="#f44336" />
                <Text style={styles.summaryLabel}>Total Utang</Text>
                <Text style={styles.summaryAmount}>{formatCurrency(summary.total_utang)}</Text>
              </View>

              <View style={[styles.summaryCard, styles.revenueCard]}>
                <MaterialIcons name="trending-up" size={24} color="#2196F3" />
                <Text style={styles.summaryLabel}>Pendapatan</Text>
                <Text style={styles.summaryAmount}>{formatCurrency(summary.total_pendapatan)}</Text>
              </View>

              <View style={[styles.summaryCard, styles.expenseCard]}>
                <MaterialIcons name="trending-down" size={24} color="#FF9800" />
                <Text style={styles.summaryLabel}>Biaya</Text>
                <Text style={styles.summaryAmount}>{formatCurrency(summary.total_biaya)}</Text>
              </View>
            </View>

            <View style={[styles.netIncomeCard, summary.net_income >= 0 ? styles.profitCard : styles.lossCard]}>
              <MaterialIcons 
                name={summary.net_income >= 0 ? "monetization-on" : "money-off"} 
                size={32} 
                color={summary.net_income >= 0 ? "#4CAF50" : "#f44336"} 
              />
              <Text style={styles.netIncomeLabel}>Laba Bersih</Text>
              <Text style={[styles.netIncomeAmount, summary.net_income >= 0 ? styles.profit : styles.loss]}>
                {formatCurrency(summary.net_income)}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Aksi Cepat</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="add-circle" size={32} color="#2196F3" />
              <Text style={styles.actionText}>Tambah Transaksi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="photo-camera" size={32} color="#4CAF50" />
              <Text style={styles.actionText}>Scan Receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="assessment" size={32} color="#FF9800" />
              <Text style={styles.actionText}>Lihat Laporan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="account-balance" size={32} color="#9C27B0" />
              <Text style={styles.actionText}>Kelola Akun</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 16,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  loginForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  featuresContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  companyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    minWidth: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
  },
  assetCard: {
    backgroundColor: '#E8F5E8',
  },
  liabilityCard: {
    backgroundColor: '#FFEBEE',
  },
  revenueCard: {
    backgroundColor: '#E3F2FD',
  },
  expenseCard: {
    backgroundColor: '#FFF3E0',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
  netIncomeCard: {
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  profitCard: {
    backgroundColor: '#E8F5E8',
  },
  lossCard: {
    backgroundColor: '#FFEBEE',
  },
  netIncomeLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  netIncomeAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  profit: {
    color: '#4CAF50',
  },
  loss: {
    color: '#f44336',
  },
  actionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: '48%',
    alignItems: 'center',
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});