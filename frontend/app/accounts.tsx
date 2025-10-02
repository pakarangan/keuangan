import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';

interface Account {
  id: string;
  name: string;
  category: string;
  code?: string;
  balance: string;
  created_at: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  account_name: string;
  account_id: string;
}

const CATEGORY_COLORS = {
  'Aset': '#4CAF50',
  'Utang': '#f44336',
  'Pendapatan': '#2196F3',
  'Modal': '#9C27B0',
  'Biaya': '#FF9800',
};

const CATEGORY_ICONS = {
  'Aset': 'account-balance-wallet',
  'Utang': 'credit-card',
  'Pendapatan': 'trending-up',
  'Modal': 'account-balance',
  'Biaya': 'trending-down',
};

export default function Accounts() {
  const params = useLocalSearchParams();
  const token = params.token as string;
  const userString = params.user as string;
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccountTransactions = async (accountId: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/transactions?account_id=${accountId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAccounts();
    if (selectedAccount) {
      await loadAccountTransactions(selectedAccount.id);
    }
    setRefreshing(false);
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const selectAccount = (account: Account) => {
    setSelectedAccount(account);
    loadAccountTransactions(account.id);
  };

  const renderAccountItem = ({ item }: { item: Account }) => {
    const categoryColor = CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS];
    const categoryIcon = CATEGORY_ICONS[item.category as keyof typeof CATEGORY_ICONS];
    
    return (
      <TouchableOpacity
        style={styles.accountItem}
        onPress={() => selectAccount(item)}
      >
        <View style={styles.accountIconContainer}>
          <MaterialIcons 
            name={categoryIcon as any} 
            size={24} 
            color={categoryColor} 
          />
        </View>
        <View style={styles.accountDetails}>
          <Text style={styles.accountName}>{item.name}</Text>
          <Text style={styles.accountCategory}>{item.category}</Text>
          {item.code && <Text style={styles.accountCode}>Kode: {item.code}</Text>}
        </View>
        <View style={styles.accountBalance}>
          <Text style={[styles.balanceAmount, { color: categoryColor }]}>
            {formatCurrency(item.balance)}
          </Text>
          <MaterialIcons name="chevron-right" size={20} color="#666" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const amount = parseFloat(item.amount);
    const isPositive = amount > 0;
    
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
        </View>
        <Text style={[
          styles.transactionAmount,
          { color: isPositive ? '#4CAF50' : '#f44336' }
        ]}>
          {isPositive ? '+' : ''}{formatCurrency(item.amount)}
        </Text>
      </View>
    );
  };

  if (selectedAccount) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => setSelectedAccount(null)} 
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedAccount.name}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.accountHeader}>
          <View style={styles.accountInfo}>
            <Text style={styles.accountHeaderName}>{selectedAccount.name}</Text>
            <Text style={styles.accountHeaderCategory}>{selectedAccount.category}</Text>
          </View>
          <Text style={styles.accountHeaderBalance}>
            {formatCurrency(selectedAccount.balance)}
          </Text>
        </View>

        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Riwayat Transaksi</Text>
            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/add-transaction',
                params: { token, user: userString }
              })}
            >
              <MaterialIcons name="add" size={24} color="#2196F3" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={transactions}
            renderItem={renderTransactionItem}
            keyExtractor={item => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="receipt" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Belum ada transaksi</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelola Akun</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={accounts}
        renderItem={renderAccountItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.accountsList}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="account-balance" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Belum ada akun</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  accountsList: {
    padding: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  accountIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  accountCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  accountCode: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  accountBalance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  accountInfo: {
    flex: 1,
  },
  accountHeaderName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  accountHeaderCategory: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  accountHeaderBalance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  transactionsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});