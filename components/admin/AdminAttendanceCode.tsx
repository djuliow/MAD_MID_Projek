// File ini berfungsi untuk mengelola kode absensi harian bagi mahasiswa.
// Admin dapat membuat satu kode unik per hari yang memberikan sejumlah poin kepada mahasiswa yang melakukan check-in.

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AdminAttendanceCode = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [code, setCode] = useState('');
  const [points, setPoints] = useState('10');
  const createCode = useMutation(api.attendance.createDailyCode);
  const currentCode = useQuery(api.attendance.getDailyCode);

  // Fungsi untuk membuka/menutup panel dropdown
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  // Fungsi untuk menyimpan kode absensi baru ke database
  const handleCreateCode = async () => {
    if (!code.trim()) {
      Alert.alert('Input Kosong', 'Silakan tentukan kode unik.');
      return;
    }
    
    const pointsNum = parseInt(points);
    if (isNaN(pointsNum) || pointsNum <= 0) {
      Alert.alert('Poin Tidak Valid', 'Masukkan angka poin yang benar.');
      return;
    }

    try {
      await createCode({ code: code.trim().toUpperCase(), points: pointsNum });
      Alert.alert('Berhasil!', `Kode "${code.toUpperCase()}" telah diaktifkan untuk hari ini.`);
      setCode('');
      setIsExpanded(false);
      Keyboard.dismiss();
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Terjadi kesalahan.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header / Dropdown Toggle */}
      <TouchableOpacity 
        style={styles.headerToggle} 
        onPress={toggleExpand} 
        activeOpacity={0.7}
      >
        <View style={styles.headerTitleRow}>
          <View style={[styles.iconCircle, { backgroundColor: currentCode ? '#e8f5e9' : '#fff3e0' }]}>
            <Ionicons name="key" size={18} color={currentCode ? '#2e7d32' : '#ff9800'} />
          </View>
          <View>
            <Text style={styles.titleText}>Manajemen Absensi</Text>
            <Text style={styles.subtitleText}>
              {currentCode ? `Kode Hari Ini: ${currentCode.code}` : 'Belum ada kode aktif hari ini'}
            </Text>
          </View>
        </View>
        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#666" />
      </TouchableOpacity>

      {/* Konten Dropdown (Collapsible) */}
      {isExpanded && (
        <View style={styles.expandableContent}>
          <View style={styles.divider} />
          
          {currentCode ? (
            <View style={styles.lockedContainer}>
              <View style={styles.lockedInfo}>
                <Ionicons name="lock-closed-outline" size={40} color="#2e7d32" />
                <Text style={styles.lockedTitle}>Kode Telah Terkunci</Text>
                <Text style={styles.lockedSub}>
                  Kode harian hanya dapat dibuat satu kali per hari. Kode aktif saat ini adalah:
                </Text>
                <View style={styles.activeCodeBadge}>
                   <Text style={styles.activeCodeText}>{currentCode.code}</Text>
                   <Text style={styles.activePointsText}>{currentCode.points_value} Poin</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.warningNote}>
                *Perhatian: Kode hanya bisa dibuat sekali dan tidak dapat diubah lagi setelah disimpan.
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Kode Harian Baru</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: SENIN-CERIA"
                  value={code}
                  onChangeText={setCode}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Jumlah Poin</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan angka (contoh: 10)"
                  value={points}
                  onChangeText={setPoints}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleCreateCode}>
                <Text style={styles.submitButtonText}>Aktifkan Kode Sekarang</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    backgroundColor: 'white', 
    borderRadius: 16, 
    marginHorizontal: 20, 
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    overflow: 'hidden'
  },
  headerToggle: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  titleText: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  subtitleText: { fontSize: 12, color: '#666', marginTop: 2 },
  
  expandableContent: { padding: 16, paddingTop: 0 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 16 },
  
  // Locked View Styles
  lockedContainer: { padding: 10, alignItems: 'center' },
  lockedInfo: { alignItems: 'center', gap: 8 },
  lockedTitle: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32', marginTop: 10 },
  lockedSub: { fontSize: 13, color: '#666', textAlign: 'center', paddingHorizontal: 20 },
  activeCodeBadge: { 
    backgroundColor: '#e8f5e9', 
    paddingHorizontal: 25, 
    paddingVertical: 12, 
    borderRadius: 12, 
    marginTop: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a5d6a7'
  },
  activeCodeText: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32' },
  activePointsText: { fontSize: 14, color: '#4caf50', marginTop: 4, fontWeight: '600' },

  // Form View Styles
  formContainer: { gap: 15 },
  warningNote: { fontSize: 12, color: '#d32f2f', backgroundColor: '#ffebee', padding: 10, borderRadius: 8, fontStyle: 'italic' },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8 },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 12, 
    borderRadius: 10, 
    fontSize: 15,
    backgroundColor: '#fafafa'
  },
  submitButton: { 
    backgroundColor: '#1976d2', 
    padding: 14, 
    borderRadius: 10, 
    alignItems: 'center',
    marginTop: 8
  },
  submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 15 }
});

export default AdminAttendanceCode;
