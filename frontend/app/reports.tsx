import React, { useState } from 'react';
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

export default function Reports() {
  const params = useLocalSearchParams();
  const token = params.token as string;
  const userString = params.user as string;
  
  const [loading, setLoading] = useState<string | null>(null);

  const downloadReport = async (type: 'profit-loss' | 'balance-sheet', format: 'pdf' | 'excel') => {
    const loadingKey = `${type}-${format}`;
    setLoading(loadingKey);

    try {
      let url = '';
      const today = new Date().toISOString().split('T')[0];
      const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

      if (type === 'profit-loss') {
        url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/reports/profit-loss/${format}?start_date=${startOfYear}&end_date=${today}`;
      } else {
        url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/reports/balance-sheet/${format}?report_date=${today}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // For web, we can't directly download files, but we can show success message
        Alert.alert('Success', `${format.toUpperCase()} report generated successfully!`);
      } else {
        Alert.alert('Error', 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const reportTypes = [
    {
      id: 'profit-loss',
      title: 'Laporan Laba Rugi',
      description: 'Ringkasan pendapatan dan pengeluaran',
      icon: 'assessment',
      color: '#4CAF50',
    },
    {
      id: 'balance-sheet',
      title: 'Neraca',
      description: 'Posisi aset, kewajiban, dan modal',
      icon: 'account-balance',
      color: '#2196F3',
    },
  ];

  const formatOptions = [
    {
      format: 'pdf',
      title: 'Download PDF',
      icon: 'picture-as-pdf',
      color: '#f44336',
    },
    {
      format: 'excel',
      title: 'Download Excel',
      icon: 'grid-on',
      color: '#4CAF50',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Laporan Keuangan</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jenis Laporan</Text>
          <Text style={styles.sectionSubtitle}>
            Pilih laporan yang ingin Anda download
          </Text>
        </View>

        {reportTypes.map((report) => (
          <View key={report.id} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={styles.reportInfo}>
                <View style={[styles.reportIcon, { backgroundColor: `${report.color}20` }]}>
                  <MaterialIcons 
                    name={report.icon as any} 
                    size={32} 
                    color={report.color} 
                  />
                </View>
                <View style={styles.reportDetails}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportDescription}>{report.description}</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionButtons}>
              {formatOptions.map((option) => (
                <TouchableOpacity
                  key={option.format}
                  style={[styles.downloadButton, { borderColor: option.color }]}
                  onPress={() => downloadReport(report.id as any, option.format as any)}
                  disabled={loading !== null}
                >
                  {loading === `${report.id}-${option.format}` ? (
                    <ActivityIndicator size="small" color={option.color} />
                  ) : (
                    <>
                      <MaterialIcons 
                        name={option.icon as any} 
                        size={20} 
                        color={option.color} 
                      />
                      <Text style={[styles.downloadButtonText, { color: option.color }]}>
                        {option.title}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.infoCard}>
          <MaterialIcons name="info" size={24} color="#2196F3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Informasi Laporan</Text>
            <Text style={styles.infoText}>
              • Laporan Laba Rugi menampilkan data dari awal tahun sampai hari ini{'\n'}
              • Neraca menampilkan posisi keuangan per tanggal hari ini{'\n'}
              • File PDF cocok untuk presentasi dan cetak{'\n'}
              • File Excel cocok untuk analisis lebih lanjut
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitur Lainnya</Text>
          
          <TouchableOpacity style={styles.featureButton}>
            <MaterialIcons name="date-range" size={24} color="#FF9800" />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Laporan Custom</Text>
              <Text style={styles.featureDescription}>Pilih periode laporan sesuai kebutuhan</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureButton}>
            <MaterialIcons name="email" size={24} color="#9C27B0" />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Kirim via Email</Text>
              <Text style={styles.featureDescription}>Kirim laporan langsung ke email</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureButton}>
            <MaterialIcons name="schedule" size={24} color="#607D8B" />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Laporan Terjadwal</Text>
              <Text style={styles.featureDescription}>Atur laporan otomatis bulanan</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportHeader: {
    marginBottom: 16,
  },
  reportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reportDetails: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  featureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureInfo: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});