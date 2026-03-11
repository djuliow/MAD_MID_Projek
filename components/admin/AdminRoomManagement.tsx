// File ini berfungsi untuk mengelola status reservasi buku dan pemesanan ruangan.
// Admin dapat mengonfirmasi pengambilan buku (pick up) atau menyelesaikan penggunaan ruangan.

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function AdminRoomManagement() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'books' | 'rooms'>('books');

  // Mengambil data pemesanan ruangan dan reservasi buku dari Convex
  const roomBookings = useQuery(api.rooms.getAllBookings, {});
  const bookReservations = useQuery(api.reservation.getAllReservations, {});
  
  const updateRoomStatus = useMutation(api.rooms.updateBookingStatus);
  const updateBookStatus = useMutation(api.reservation.updateReservationStatus);
  const confirmPickup = useMutation(api.reservation.confirmPickup);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Makassar'
    });
  };

  // Fungsi untuk memperbarui status pemesanan ruangan (Selesai atau Batal)
  const handleRoomStatusUpdate = async (bookingId: any, roomName: string, status: 'completed' | 'cancelled') => {
    const actionText = status === 'completed' ? 'Selesaikan' : 'Batalkan';
    const confirmText = status === 'completed' ? 'Ya, Selesai' : 'Ya, Batalkan';

    Alert.alert(
      `${actionText} Pemakaian`,
      `Apakah Anda yakin ingin ${actionText.toLowerCase()} pesanan untuk ${roomName}?`,
      [
        { text: "Kembali", style: "cancel" },
        { 
          text: confirmText, 
          onPress: async () => {
            try {
              await updateRoomStatus({ bookingId, status });
              Alert.alert("Sukses", `Pesanan ruangan berhasil di${status === 'completed' ? 'selesaikan' : 'batalkan'}.`);
            } catch (error) {
              Alert.alert("Error", "Gagal memperbarui status.");
            }
          }
        }
      ]
    );
  };

  // Fungsi untuk memperbarui status reservasi buku (Diambil atau Kadaluwarsa)
  const handleBookStatusUpdate = async (reservationId: any, status: 'completed' | 'expired') => {
    try {
      if (status === 'completed') {
        await confirmPickup({ reservationId });
        Alert.alert("Success", "Book picked up and loan is now active!");
      } else {
        await updateBookStatus({ reservationId, status });
        Alert.alert("Success", `Reservation marked as ${status}`);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update reservation");
    }
  };

  if (roomBookings === undefined || bookReservations === undefined) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Reservations</Text>
      </View>

      {/* Pengalih Tab antara Reservasi Buku dan Ruangan */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'books' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('books')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'books' ? colors.primary : colors.textMuted }]}>Books</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'rooms' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('rooms')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'rooms' ? colors.primary : colors.textMuted }]}>Rooms</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'books' ? (
        <FlatList
          data={bookReservations}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Ionicons name="book-outline" size={64} color={colors.textMuted} />
              <Text style={{ color: colors.text, fontSize: 18, marginTop: 10 }}>No book reservations</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.adminCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.adminCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.roomName, { color: colors.text }]}>{item.book?.title || "Unknown Book"}</Text>
                  <Text style={[styles.studentName, { color: colors.textMuted }]}>Reserved by: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.user?.name || "Unknown"}</Text></Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? colors.warning + '20' : item.status === 'completed' ? colors.success + '20' : colors.danger + '20' }]}>
                  <Text style={[styles.statusText, { color: item.status === 'active' ? colors.warning : item.status === 'completed' ? colors.success : colors.danger, textTransform: 'capitalize' }]}>{item.status}</Text>
                </View>
              </View>

              <View style={[styles.reservationDetails, { backgroundColor: colors.bg }]}>
                <View style={styles.detailItem}>
                  <Ionicons name={item.type === 'take_home' ? "home-outline" : "business-outline"} size={16} color={colors.primary} />
                  <Text style={[styles.detailText, { color: colors.text, fontWeight: 'bold' }]}>
                    {item.type === 'take_home' ? 'Take Home' : 'Read in Library'}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={[styles.detailText, { color: colors.text }]}>Deadline: {formatDate(item.pickup_deadline)}</Text>
                </View>
              </View>

              {item.status === 'active' && (
                <View style={styles.adminActions}>
                  <TouchableOpacity 
                    style={[styles.adminActionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleBookStatusUpdate(item._id, 'completed')}
                  >
                    <Text style={styles.adminActionText}>Picked Up</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.adminActionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.danger }]}
                    onPress={() => handleBookStatusUpdate(item._id, 'expired')}
                  >
                    <Text style={[styles.adminActionText, { color: colors.danger }]}>Mark Expired</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      ) : (
        <FlatList
          data={roomBookings}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
              <Text style={{ color: colors.text, fontSize: 18, marginTop: 10 }}>No room reservations</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.adminCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.adminCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.roomName, { color: colors.text }]}>{item.room?.room_name || "Unknown Room"}</Text>
                  <Text style={[styles.studentName, { color: colors.textMuted }]}>Reserved by: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.user?.name || "Unknown"}</Text></Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? colors.warning + '20' : item.status === 'completed' ? colors.success + '20' : colors.danger + '20' }]}>
                  <Text style={[styles.statusText, { color: item.status === 'active' ? colors.warning : item.status === 'completed' ? colors.success : colors.danger, textTransform: 'capitalize' }]}>{item.status}</Text>
                </View>
              </View>

              <View style={[styles.reservationDetails, { backgroundColor: colors.bg }]}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={[styles.detailText, { color: colors.text }]}>{formatDate(item.booking_date)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={16} color={colors.primary} />
                  <Text style={[styles.detailText, { color: colors.text }]}>{formatTime(item.start_time)} - {formatTime(item.end_time)}</Text>
                </View>
              </View>

              {item.status === 'active' && (
                <View style={styles.adminActions}>
                  <TouchableOpacity 
                    style={[styles.adminActionBtn, { backgroundColor: colors.success }]}
                    onPress={() => handleRoomStatusUpdate(item._id, item.room?.room_name || "Ruangan", 'completed')}
                  >
                    <Text style={styles.adminActionText}>Finish</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.adminActionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.danger }]}
                    onPress={() => handleRoomStatusUpdate(item._id, item.room?.room_name || "Ruangan", 'cancelled')}
                  >
                    <Text style={[styles.adminActionText, { color: colors.danger }]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 10, gap: 20 },
  tab: { paddingVertical: 10, paddingHorizontal: 5 },
  tabText: { fontSize: 16, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 20, paddingVertical: 16 },
  adminCard: { borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, elevation: 2 },
  adminCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  roomName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  studentName: { fontSize: 14 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  reservationDetails: { flexDirection: 'row', padding: 12, borderRadius: 12, gap: 20, marginBottom: 16, flexWrap: 'wrap' },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 14, fontWeight: '500' },
  adminActions: { flexDirection: 'row', gap: 12 },
  adminActionBtn: { flex: 1, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  adminActionText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
});
