// File ini berfungsi untuk menampilkan laporan pengunjung berdasarkan rentang tanggal tertentu.
// Admin dapat memfilter data absensi mahasiswa untuk keperluan pelaporan atau analisis kunjungan perpustakaan.

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, TextInput } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';

interface AdminVisitorReportsProps {
  onClose: () => void;
}

export function AdminVisitorReports({ onClose }: AdminVisitorReportsProps) {
  const { colors } = useTheme();
  
  // Mendapatkan tanggal hari ini dalam format YYYY-MM-DD sesuai zona waktu WITA
  const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Makassar', year: 'numeric', month: '2-digit', day: '2-digit' };
  const today = new Intl.DateTimeFormat('en-CA', options).format(new Date());

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // Query untuk mengambil data absensi berdasarkan rentang tanggal yang dipilih
  const logs = useQuery(api.attendance.getAttendanceByRange, { startDate, endDate });

  const renderItem = ({ item }: { item: any }) => {
    const formattedDate = new Date(item.date).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    return (
      <View style={[styles.logItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.userName}</Text>
          <Text style={[styles.studentId, { color: colors.textMuted }]}>ID: {item.studentId}</Text>
        </View>
        <View style={styles.visitInfo}>
          <Text style={[styles.visitDate, { color: colors.text }]}>{formattedDate}</Text>
          <View style={styles.pointBadge}>
            <Text style={styles.pointValue}>+{item.points_earned} Poin</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Visitor Reports</Text>
      </View>

      <View style={styles.filterSection}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Dari Tanggal:</Text>
          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Sampai Tanggal:</Text>
          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD"
          />
        </View>
      </View>

      <View style={styles.summaryBox}>
        <Text style={[styles.summaryText, { color: colors.text }]}>
          Total Pengunjung: <Text style={{ fontWeight: 'bold', color: colors.primary }}>{logs?.length || 0}</Text>
        </Text>
      </View>

      {logs === undefined ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: colors.textMuted, marginTop: 50 }}>
              Tidak ada data pengunjung untuk rentang ini.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  closeBtn: { marginRight: 15 },
  title: { fontSize: 22, fontWeight: 'bold' },
  filterSection: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 15 },
  inputGroup: { flex: 1 },
  label: { fontSize: 12, marginBottom: 6, fontWeight: '600' },
  input: { height: 45, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  summaryBox: { paddingHorizontal: 20, marginBottom: 15 },
  summaryText: { fontSize: 16 },
  listContainer: { padding: 20 },
  logItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: 'bold' },
  studentId: { fontSize: 12, marginTop: 2 },
  visitInfo: { alignItems: 'flex-end' },
  visitDate: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  pointBadge: { backgroundColor: '#fff9c4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  pointValue: { fontSize: 10, fontWeight: 'bold', color: '#f57f17' },
});
