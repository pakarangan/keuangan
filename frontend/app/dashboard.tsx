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
import { useLocalSearchParams, router } from 'expo-router';

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

export default function Dashboard() {
  const params = useLocalSearchParams();
  const token = params.token as string;
  const userString = params.user as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        setUser(userData);
        loadFinancialSummary();
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.replace('/');
      }
    } else {
      router.replace('/');
    }
  }, [userString]);

  const loadFinancialSummary = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/financial-summary', {
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
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', onPress: () => router.replace('/') },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const navigateToAddTransaction = () => {
    router.push({
      pathname: '/add-transaction',
      params: { token, user: userString }
    });
  };

  const navigateToAccounts = () => {
    router.push({
      pathname: '/accounts',
      params: { token, user: userString }
    });
  };

  const navigateToReports = () => {
    router.push({
      pathname: '/reports',
      params: { token, user: userString }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
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
            <TouchableOpacity style={styles.actionButton} onPress={navigateToAddTransaction}>
              <MaterialIcons name="add-circle" size={32} color="#2196F3" />
              <Text style={styles.actionText}>Tambah Transaksi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="photo-camera" size={32} color="#4CAF50" />
              <Text style={styles.actionText}>Scan Receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={navigateToReports}>
              <MaterialIcons name="assessment" size={32} color="#FF9800" />
              <Text style={styles.actionText}>Lihat Laporan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={navigateToAccounts}>
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