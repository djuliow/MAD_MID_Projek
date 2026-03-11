// File ini menampilkan riwayat lengkap aktivitas perpustakaan untuk admin.
// Mencakup data peminjaman, pengembalian, reservasi buku, dan pemesanan ruangan.

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';

interface AdminActivityHistoryProps {
  onClose: () => void;
}

export function AdminActivityHistory({ onClose }: AdminActivityHistoryProps) {
  const { colors } = useTheme();
  // Mengambil semua data aktivitas dari backend Convex
  const activities = useQuery(api.admin.getAllActivities);

  // Merender setiap item aktivitas dengan ikon dan warna yang sesuai dengan jenis aksi
  const renderItem = ({ item }: { item: any }) => {
    let iconName: any = 'swap-horizontal-outline';
    let iconColor = colors.primary;
    let bgColor = colors.primary + '20';

    if (item.action === 'Borrowed') {
      iconName = 'arrow-up-outline';
      iconColor = colors.warning;
      bgColor = colors.warning + '20';
    } else if (item.action === 'Returned') {
      iconName = 'arrow-down-outline';
      iconColor = colors.success;
      bgColor = colors.success + '20';
    } else if (item.action === 'Reserved') {
      iconName = 'bookmark-outline';
      iconColor = '#3b82f6';
      bgColor = '#3b82f620';
    } else if (item.action === 'Room Booked') {
      iconName = 'business-outline';
      iconColor = '#8b5cf6';
      bgColor = '#8b5cf620';
    } else if (item.action === 'Room Finished') {
      iconName = 'checkmark-done-outline';
      iconColor = colors.success;
      bgColor = colors.success + '20';
    } else if (item.action === 'Room Cancelled') {
      iconName = 'close-circle-outline';
      iconColor = colors.danger;
      bgColor = colors.danger + '20';
    }

    return (
      <View style={[styles.activityItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.activityIcon, { backgroundColor: bgColor }]}>
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>
        <View style={styles.activityInfo}>
          <Text style={[styles.activityTitle, { color: colors.text }]}>
            <Text style={{ fontWeight: 'bold' }}>{item.studentName}</Text> {item.action.toLowerCase()} {item.bookTitle}
          </Text>
          <Text style={[styles.activityTime, { color: colors.textMuted }]}>{item.time}</Text>
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
        <Text style={[styles.title, { color: colors.text }]}>Library Activity Log</Text>
      </View>

      {activities === undefined ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : activities.length > 0 ? (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No transactions found.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 20 
  },
  closeBtn: { marginRight: 15 },
  title: { fontSize: 22, fontWeight: 'bold' },
  listContainer: { padding: 20 },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 14, lineHeight: 20 },
  activityTime: { fontSize: 12, marginTop: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginTop: 15 },
});
