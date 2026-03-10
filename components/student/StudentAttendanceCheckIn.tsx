import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '../../hooks/useUser';

const StudentAttendanceCheckIn = () => {
  const { user } = useUser();
  const [code, setCode] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const submitCode = useMutation(api.attendance.submitDailyCode);
  
  // Pastikan query hanya berjalan jika user._id sudah ada (menggunakan "skip")
  const history = useQuery(
    api.attendance.getAttendanceHistory, 
    user?._id ? { userId: user._id as any } : "skip"
  );
  
  // Cara yang lebih aman untuk mendapatkan tanggal hari ini dalam WITA
  const getTodayWITA = () => {
    const now = new Date();
    const witaDate = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    return witaDate.toISOString().split('T')[0];
  };

  const today = getTodayWITA();
  const alreadyCheckedIn = history?.some((h: any) => h.date === today);

  const handleSubmit = async () => {
    if (!user?._id) {
      Alert.alert('Error', 'Data user belum siap');
      return;
    }
    if (!code.trim()) {
      Alert.alert('Error', 'Masukkan kode harian');
      return;
    }

    try {
      const result = await submitCode({ 
        userId: user._id as any, 
        code: code.trim()
      });
      Alert.alert('Sukses', `Absensi berhasil! Anda mendapatkan ${result.points} poin.`);
      setCode('');
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Gagal melakukan absensi');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Presensi Kehadiran</Text>
      
      {alreadyCheckedIn ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>Anda sudah absen hari ini ✅</Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.openButton} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.openButtonText}>Masukkan Kode Kehadiran</Text>
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Masukkan Kode Harian</Text>
            <Text style={styles.modalSub}>Tanyakan kode hari ini pada pustakawan</Text>
            
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="KODE"
              autoCapitalize="characters"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]} 
                onPress={handleSubmit}
              >
                <Text style={styles.submitText}>Kirim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, margin: 10, backgroundColor: '#fff', borderRadius: 12, elevation: 2 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  successBox: { backgroundColor: '#e8f5e9', padding: 12, borderRadius: 8, alignItems: 'center' },
  successText: { color: '#2e7d32', fontWeight: 'bold' },
  openButton: { backgroundColor: '#1976d2', padding: 12, borderRadius: 8, alignItems: 'center' },
  openButtonText: { color: '#fff', fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 15, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  modalSub: { fontSize: 12, color: '#666', marginBottom: 20 },
  input: { borderBottomWidth: 2, borderBottomColor: '#1976d2', width: '100%', fontSize: 20, textAlign: 'center', padding: 10, marginBottom: 25 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 25, borderRadius: 8 },
  cancelButton: { backgroundColor: '#f5f5f5' },
  submitButton: { backgroundColor: '#1976d2' },
  cancelText: { color: '#666' },
  submitText: { color: 'white', fontWeight: 'bold' }
});

export default StudentAttendanceCheckIn;
