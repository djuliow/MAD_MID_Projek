import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';

const AdminRoomLiveStatus = () => {
  const { colors } = useTheme();
  const now = Date.now();
  
  const allBookings = useQuery(api.rooms.getAllBookings);
  const updateStatus = useMutation(api.rooms.updateBookingStatus);

  // 1. Ambil yang SEDANG berlangsung
  const activeNow = allBookings?.filter(b => 
    b.status === 'active' && 
    now >= b.start_time && 
    now < b.end_time
  );

  // 2. Ambil yang AKAN DATANG hari ini
  const upcomingToday = allBookings?.filter(b => 
    b.status === 'active' && 
    b.start_time > now && 
    b.start_time < (now + 24 * 60 * 60 * 1000)
  );

  const handleFinish = async (bookingId: any, roomName: string) => {
    Alert.alert(
      "Selesaikan Pemakaian",
      `Apakah pemakaian ${roomName} sudah selesai?`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Ya, Selesai", 
          onPress: async () => {
            await updateStatus({ bookingId, status: 'completed' });
          }
        }
      ]
    );
  };

  const renderBooking = (booking: any, isLive: boolean) => (
    <View key={booking._id} style={[
      styles.liveCard, 
      { backgroundColor: colors.surface, borderColor: isLive ? colors.danger : colors.border }
    ]}>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.roomName, { color: colors.text }]}>{booking.room?.room_name}</Text>
          {isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.dot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
        <Text style={[styles.userName, { color: colors.textMuted }]}>User: {booking.user?.name}</Text>
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={12} color={isLive ? colors.danger : colors.primary} />
          <Text style={[styles.timeText, { color: isLive ? colors.danger : colors.primary }]}>
            {new Date(booking.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar' })} - {new Date(booking.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar' })}
          </Text>
        </View>
      </View>
      
      {isLive ? (
        <TouchableOpacity 
          style={[styles.finishBtn, { backgroundColor: colors.success }]}
          onPress={() => handleFinish(booking._id, booking.room?.room_name)}
        >
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.upcomingBadge}>
          <Text style={styles.upcomingText}>Upcoming</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="pulse-outline" size={20} color={colors.danger} />
        <Text style={[styles.title, { color: colors.text }]}>Room Monitoring (WITA)</Text>
      </View>

      {allBookings === undefined ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (activeNow?.length || 0) + (upcomingToday?.length || 0) > 0 ? (
        <View style={styles.list}>
          {activeNow?.map(b => renderBooking(b, true))}
          {upcomingToday?.map(b => renderBooking(b, false))}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={{ color: colors.textMuted, fontSize: 13, fontStyle: 'italic' }}>Tidak ada jadwal untuk saat ini.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 20, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: 'bold' },
  list: { gap: 10 },
  liveCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 15, borderWidth: 1, borderLeftWidth: 4 },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roomName: { fontSize: 15, fontWeight: 'bold' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffebee', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#f44336' },
  liveText: { fontSize: 9, fontWeight: 'bold', color: '#f44336' },
  userName: { fontSize: 12, marginTop: 2 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  timeText: { fontSize: 11, fontWeight: 'bold' },
  finishBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  finishText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  upcomingBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#e3f2fd' },
  upcomingText: { color: '#1976d2', fontSize: 10, fontWeight: 'bold' },
  emptyBox: { padding: 15, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 12, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ddd' }
});

export default AdminRoomLiveStatus;
