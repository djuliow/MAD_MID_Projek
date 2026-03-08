import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { RESERVATIONS } from '../../constants/data';

export function AdminRoomManagement() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Room Reservations</Text>
      </View>

      <FlatList
        data={RESERVATIONS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.adminCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.adminCardHeader}>
              <View>
                <Text style={[styles.roomName, { color: colors.text }]}>{item.roomName}</Text>
                <Text style={[styles.studentName, { color: colors.textMuted }]}>Reserved by: <Text style={{ color: colors.text }}>{item.studentName}</Text></Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'Approved' ? colors.success + '20' : colors.warning + '20' }]}>
                <Text style={[styles.statusText, { color: item.status === 'Approved' ? colors.success : colors.warning }]}>{item.status}</Text>
              </View>
            </View>

            <View style={[styles.reservationDetails, { backgroundColor: colors.bg }]}>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                <Text style={[styles.detailText, { color: colors.text }]}>{item.date}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color={colors.primary} />
                <Text style={[styles.detailText, { color: colors.text }]}>{item.timeSlot}</Text>
              </View>
            </View>

            <View style={styles.adminActions}>
              <TouchableOpacity style={[styles.adminActionBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.adminActionText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.adminActionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.danger }]}>
                <Text style={[styles.adminActionText, { color: colors.danger }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 20, paddingVertical: 16 },
  adminCard: { borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, elevation: 2 },
  adminCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  roomName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  studentName: { fontSize: 14 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  reservationDetails: { flexDirection: 'row', padding: 12, borderRadius: 12, gap: 20, marginBottom: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 14, fontWeight: '500' },
  adminActions: { flexDirection: 'row', gap: 12 },
  adminActionBtn: { flex: 1, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  adminActionText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
});
