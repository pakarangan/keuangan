import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

interface Account {
  id: string;
  name: string;
  category: string;
  code?: string;
}

export default function AddTransaction() {
  const params = useLocalSearchParams();
  const token = params.token as string;
  const userString = params.user as string;
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/accounts', {
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
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera roll permission is needed to select images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const imageData = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setReceiptImage(imageData);
      
      // Process with OCR automatically
      Alert.alert(
        'Receipt OCR',
        'Ingin menggunakan OCR untuk mengekstrak data dari receipt?',
        [
          { text: 'Tidak', style: 'cancel' },
          { text: 'Ya, Scan', onPress: () => processWithOCR(imageData) },
        ]
      );
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const imageData = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setReceiptImage(imageData);
      
      // Process with OCR automatically
      Alert.alert(
        'Receipt OCR',
        'Ingin menggunakan OCR untuk mengekstrak data dari receipt?',
        [
          { text: 'Tidak', style: 'cancel' },
          { text: 'Ya, Scan', onPress: () => processWithOCR(imageData) },
        ]
      );
    }
  };

  const processWithOCR = async (imageBase64: string) => {
    try {
      const response = await fetch('http://localhost:8001/api/ocr/extract-receipt', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.extracted_data) {
          const { merchant_name, total_amount, date: extractedDate } = data.extracted_data;
          
          // Auto-fill form with extracted data
          if (merchant_name) {
            setDescription(merchant_name);
          }
          if (total_amount > 0) {
            setAmount(total_amount.toString());
          }
          if (extractedDate) {
            // Try to format the date
            try {
              const formattedDate = new Date(extractedDate).toISOString().split('T')[0];
              setDate(formattedDate);
            } catch (e) {
              // Keep original date if formatting fails
            }
          }
          
          Alert.alert(
            'OCR Berhasil!', 
            'Data dari receipt berhasil diekstrak. Silakan periksa dan edit jika diperlukan.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('OCR Error', 'Gagal mengekstrak data dari receipt.');
        }
      }
    } catch (error) {
      console.error('OCR Error:', error);
      Alert.alert('Error', 'Gagal memproses receipt dengan OCR.');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Scan Receipt',
      'Pilih cara untuk menambahkan receipt:',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Ambil Foto', onPress: takePhoto },
        { text: 'Pilih dari Gallery', onPress: pickImage },
      ]
    );
  };

  const saveTransaction = async () => {
    if (!selectedAccount || !description.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8001/api/transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: date,
          description: description.trim(),
          amount: amountNumber,
          account_id: selectedAccount.id,
          receipt_image: receiptImage,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Transaction saved successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.detail || 'Failed to save transaction');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Transaksi</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Akun <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity 
              style={styles.accountSelector}
              onPress={() => setShowAccountPicker(true)}
            >
              <Text style={[styles.accountText, !selectedAccount && styles.placeholder]}>
                {selectedAccount ? `${selectedAccount.name} (${selectedAccount.category})` : 'Pilih Akun'}
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tanggal <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.textInput}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Deskripsi <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Masukkan deskripsi transaksi"
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Jumlah <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.textInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Receipt (Opsional)</Text>
            {receiptImage ? (
              <View style={styles.imageContainer}>
                <Text style={styles.imageText}>Receipt image attached</Text>
                <TouchableOpacity onPress={() => setReceiptImage(null)}>
                  <MaterialIcons name="close" size={20} color="#f44336" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imageButton} onPress={showImagePicker}>
                <MaterialIcons name="camera-alt" size={24} color="#2196F3" />
                <Text style={styles.imageButtonText}>Tambah Receipt</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={saveTransaction}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showAccountPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAccountPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Akun</Text>
              <TouchableOpacity onPress={() => setShowAccountPicker(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.accountList}>
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={styles.accountItem}
                  onPress={() => {
                    setSelectedAccount(account);
                    setShowAccountPicker(false);
                  }}
                >
                  <View>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountCategory}>{account.category}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#666" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#f44336',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  accountSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  accountText: {
    fontSize: 16,
    color: '#333',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    gap: 8,
  },
  imageButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  imageText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  accountList: {
    maxHeight: 400,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  accountCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});