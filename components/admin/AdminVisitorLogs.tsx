// File ini menampilkan daftar singkat log pengunjung (absensi) hari ini untuk admin.
// Menampilkan nama mahasiswa, ID, tanggal kunjungan, dan poin yang diperoleh.
// Juga menyediakan akses ke laporan pengunjung yang lebih detail.

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';
import { AdminVisitorReports } from './AdminVisitorReports';

const AdminVisitorLogs = () => {
  const { colors } = useTheme();
  const [isReportVisible, setReportVisible] = useState(false);
  // Mengambil data absensi mahasiswa hari ini
  const visitorLogs = useQuery(api.attendance.getAllAttendance);

  // Merender setiap item log pengunjung
  const renderItem = ({ item }: { item: any }) => {
    const formattedDate = new Date(item.date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return (
      <View style={[styles.logItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {item.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[styles.userName, { color: colors.text }]}>{item.userName}</Text>
            <Text style={[styles.studentId, { color: colors.textMuted }]}>ID: {item.studentId}</Text>
          </View>
        </View>
        <View style={styles.visitInfo}>
          <Text style={[styles.visitDate, { color: colors.text }]}>{formattedDate}</Text>
          <View style={styles.pointBadge}>
            <Ionicons name="star" size={10} color="#f57f17" />
            <Text style={styles.pointValue}>+{item.points_earned}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pengunjung Hari Ini</Text>
          {visitorLogs && visitorLogs.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{visitorLogs.length}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          onPress={() => setReportVisible(true)}
        >
          <Text style={{ fontSize: 12, color: colors.primary, fontWeight: 'bold' }}>Detail Report</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {visitorLogs === undefined ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
      ) : visitorLogs.length > 0 ? (
        <View style={styles.listContainer}>
          {visitorLogs.slice(0, 10).map((log: any) => (
             <View key={log._id}>
                {renderItem({ item: log })}
             </View>
          ))}
          {visitorLogs.length > 10 && (
            <Text style={[styles.moreText, { color: colors.textMuted }]}>Menampilkan 10 riwayat terbaru...</Text>
          )}
        </View>
      ) : (
        <Text style={styles.emptyText}>Belum ada absensi hari ini.</Text>
      )}

      <Modal 
        visible={isReportVisible} 
        animationType="slide"
        onRequestClose={() => setReportVisible(false)}
      >
        <AdminVisitorReports onClose={() => setReportVisible(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 20, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  countBadge: { 
    backgroundColor: '#1976d2', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  countText: { 
    color: 'white', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  listContainer: { gap: 10 },
  logItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 14, 
    borderWidth: 1 
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: 'bold', fontSize: 16 },
  userName: { fontSize: 14, fontWeight: 'bold' },
  studentId: { fontSize: 11 },
  visitInfo: { alignItems: 'flex-end' },
  visitDate: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  pointBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff9c4', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 10 
  },
  pointValue: { marginLeft: 4, fontSize: 10, fontWeight: 'bold', color: '#f57f17' },
  emptyText: { textAlign: 'center', color: '#999', marginVertical: 20, fontStyle: 'italic' },
  moreText: { textAlign: 'center', fontSize: 11, marginTop: 10 }
});

export default AdminVisitorLogs;
