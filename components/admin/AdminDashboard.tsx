// File ini berfungsi sebagai dashboard utama untuk admin (pustakawan).
// Menampilkan ringkasan statistik, manajemen absensi, log pengunjung, status ruangan real-time, dan aktivitas terbaru.

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { useUser } from '../../hooks/useUser';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import AdminAttendanceCode from './AdminAttendanceCode';
import AdminVisitorLogs from './AdminVisitorLogs';
import AdminRoomLiveStatus from './AdminRoomLiveStatus';
import { AdminActivityHistory } from './AdminActivityHistory';

export function AdminDashboard() {
  const { colors } = useTheme();
  const { userName } = useUser();
  const [isHistoryVisible, setHistoryVisible] = useState(false);

  // Mengambil statistik global dan aktivitas terbaru dari Convex
  const stats = useQuery(api.admin.getStats, {});
  const activities = useQuery(api.admin.getRecentActivities, {});

  if (stats === undefined || activities === undefined) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.textMuted }]}>Staff Portal</Text>
          <Text style={[styles.nameText, { color: colors.text }]}>{userName}</Text>
        </View>
        <TouchableOpacity style={[styles.notificationBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Grid statistik untuk ringkasan cepat data perpustakaan */}
        <View style={styles.statsGrid}>
          <StatCard title="Total Books" value={stats.totalBooks} icon="book-outline" color="#461691" />
          <StatCard title="Borrowed" value={stats.borrowedBooks} icon="swap-horizontal-outline" color="#f59e0b" />
          <StatCard title="Available" value={stats.availableBooks} icon="checkmark-circle-outline" color="#10b981" />
          <StatCard title="Reservations" value={stats.activeReservations} icon="calendar-outline" color="#3b82f6" />
        </View>

        <AdminAttendanceCode />

        <AdminVisitorLogs />

        <AdminRoomLiveStatus />

        {/* Section untuk menampilkan aktivitas transaksi terbaru */}
        <View style={[styles.section, { paddingBottom: 40 }]}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="time-outline" size={20} color={colors.text} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            </View>
            <TouchableOpacity onPress={() => setHistoryVisible(true)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            {activities.length > 0 ? (
               activities.map(activity => {
                let iconName: any = 'swap-horizontal-outline';
                let iconColor = colors.primary;
                let bgColor = colors.primary + '20';

                if (activity.action === 'Borrowed') {
                  iconName = 'arrow-up-outline';
                  iconColor = colors.warning;
                  bgColor = colors.warning + '20';
                } else if (activity.action === 'Returned') {
                  iconName = 'arrow-down-outline';
                  iconColor = colors.success;
                  bgColor = colors.success + '20';
                } else if (activity.action === 'Reserved') {
                  iconName = 'bookmark-outline';
                  iconColor = '#3b82f6';
                  bgColor = '#3b82f620';
                } else if (activity.action === 'Room Booked') {
                  iconName = 'business-outline';
                  iconColor = '#8b5cf6';
                  bgColor = '#8b5cf620';
                } else if (activity.action === 'Room Finished') {
                  iconName = 'checkmark-done-outline';
                  iconColor = colors.success;
                  bgColor = colors.success + '20';
                } else if (activity.action === 'Room Cancelled') {
                  iconName = 'close-circle-outline';
                  iconColor = colors.danger;
                  bgColor = colors.danger + '20';
                }

                return (
                  <View key={activity.id} style={[styles.activityItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.activityIcon, { backgroundColor: bgColor }]}>
                      <Ionicons name={iconName} size={20} color={iconColor} />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={[styles.activityTitle, { color: colors.text }]}>
                        <Text style={{ fontWeight: 'bold' }}>{activity.studentName}</Text> {activity.action.toLowerCase()} {activity.bookTitle}
                      </Text>
                      <Text style={[styles.activityTime, { color: colors.textMuted }]}>{activity.time}</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyActivity}>
                <Ionicons name="receipt-outline" size={40} color={colors.textMuted + '50'} />
                <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 8 }}>No transactions yet.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal 
        visible={isHistoryVisible} 
        animationType="slide"
        onRequestClose={() => setHistoryVisible(false)}
      >
        <AdminActivityHistory onClose={() => setHistoryVisible(false)} />
      </Modal>
    </SafeAreaView>
  );
}

// Sub-komponen untuk menampilkan kartu statistik individu
function StatCard({ title, value, icon, color }: { title: string, value: number, icon: any, color: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.textMuted }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeText: { fontSize: 14 },
  nameText: { fontSize: 20, fontWeight: 'bold' },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '46%',
    padding: 16,
    borderRadius: 20,
    margin: '2%',
    borderWidth: 1,
    elevation: 2,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  statTitle: { fontSize: 12, fontWeight: '600' },
  section: { marginTop: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAll: { fontSize: 14, fontWeight: '600' },
  activityList: { paddingHorizontal: 20 },
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
  emptyActivity: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 30, 
    backgroundColor: 'rgba(0,0,0,0.02)', 
    borderRadius: 20, 
    borderStyle: 'dashed', 
    borderWidth: 1, 
    borderColor: '#ccc' 
  }
});
