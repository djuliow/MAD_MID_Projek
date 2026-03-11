// File ini berfungsi untuk fitur pemesanan ruangan diskusi oleh mahasiswa.
// Mahasiswa dapat melihat daftar ruangan, status ketersediaan real-time, dan melakukan booking pada jam tertentu.

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, TextInput, Alert, ScrollView } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { useUser } from '../../hooks/useUser';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// Sub-komponen untuk menampilkan jam-jam yang sudah dipesan hari ini pada suatu ruangan
function OccupiedSlots({ roomId }: { roomId: any }) {
  const { colors } = useTheme();
  const occupied = useQuery(api.rooms.getActiveBookingsToday, { roomId });

  if (!occupied || occupied.length === 0) return null;

  return (
    <View style={styles.occupiedContainer}>
      <Text style={[styles.occupiedTitle, { color: colors.danger }]}>Jadwal Terisi Hari Ini:</Text>
      <View style={styles.slotsRow}>
        {occupied.map((slot) => {
          const start = new Date(slot.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar' });
          const end = new Date(slot.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar' });
          return (
            <View key={slot._id} style={styles.slotBadge}>
              <Text style={styles.slotText}>{start} - {end}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function StudentRoomBooking() {
  const { colors } = useTheme();
  const { user } = useUser();
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Memperbarui waktu setiap menit untuk memastikan status ketersediaan ruangan akurat secara real-time
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const rooms = useQuery(api.rooms.getRooms, {});
  const allBookings = useQuery(api.rooms.getAllBookings, {}); // Untuk mengecek status occupied real-time

  const bookRoom = useMutation(api.rooms.bookRoom);

  // Membuka modal pemesanan untuk ruangan tertentu
  const handleOpenBooking = (room: any) => {
    setSelectedRoom(room);
    setModalVisible(true);
  };

  // Fungsi untuk memvalidasi jam dan mengirim pesanan ruangan ke Convex
  const handleConfirmBooking = async () => {
    if (!user?._id || !selectedRoom) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const startTimestamp = new Date().setHours(startH, startM, 0, 0);
    const endTimestamp = new Date().setHours(endH, endM, 0, 0);

    if (endTimestamp <= startTimestamp) {
      Alert.alert("Error", "Jam selesai harus setelah jam mulai.");
      return;
    }

    setLoading(true);
    try {
      await bookRoom({
        id_room: selectedRoom._id,
        id_user: user._id as any,
        booking_date: today.getTime(),
        start_time: startTimestamp,
        end_time: endTimestamp,
      });

      Alert.alert("Success", `Berhasil membooking ${selectedRoom.room_name}`);
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert("Booking Gagal", error.message || "Ruangan sudah terisi pada jam tersebut.");
    } finally {
      setLoading(false);
    }
  };

  if (rooms === undefined || allBookings === undefined) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Study Rooms</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Pesan ruangan untuk belajar atau diskusi kelompok</Text>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const facilities = item.facilities.split(',').map(f => f.trim());
          
          // Mengecek apakah saat ini ruangan sedang dipakai berdasarkan jadwal yang aktif
          const isCurrentlyOccupied = allBookings.some(b => 
            b.id_room === item._id && 
            b.status === 'active' &&
            now >= b.start_time && 
            now < b.end_time
          );

          return (
            <View style={[
              styles.card, 
              { backgroundColor: colors.surface, borderColor: isCurrentlyOccupied ? colors.danger + '40' : colors.border },
              isCurrentlyOccupied && { opacity: 0.9 }
            ]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.roomName, { color: colors.text }]}>{item.room_name}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.locationText, { color: colors.textMuted }]}>{item.location}</Text>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: isCurrentlyOccupied ? colors.danger + '20' : colors.success + '20' }
                ]}>
                  <Text style={[
                    styles.statusText, 
                    { color: isCurrentlyOccupied ? colors.danger : colors.success }
                  ]}>
                    {isCurrentlyOccupied ? 'Occupied' : 'Available'}
                  </Text>
                </View>
              </View>

              <OccupiedSlots roomId={item._id} />

              <View style={styles.facilitiesContainer}>
                <View style={styles.facilitiesList}>
                  {facilities.map((facility, index) => (
                    <View key={index} style={[styles.facilityTag, { backgroundColor: colors.bg }]}>
                      <Text style={[styles.facilityText, { color: colors.text }]}>{facility}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                style={[
                  styles.bookButton, 
                  { backgroundColor: colors.primary }
                ]}
                onPress={() => handleOpenBooking(item)}
              >
                <Text style={styles.bookButtonText}>Book Room</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Booking Ruangan</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={[styles.roomInfo, { color: colors.text }]}>{selectedRoom?.room_name}</Text>
              <OccupiedSlots roomId={selectedRoom?._id} />

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Jam Mulai (HH:mm)</Text>
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]} 
                  value={startTime} 
                  onChangeText={setStartTime}
                  placeholder="09:00"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Jam Selesai (HH:mm)</Text>
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]} 
                  value={endTime} 
                  onChangeText={setEndTime}
                  placeholder="11:00"
                />
              </View>

              <TouchableOpacity 
                style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                onPress={handleConfirmBooking}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmButtonText}>Konfirmasi Pesanan</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 13, marginTop: 4 },
  listContent: { paddingHorizontal: 20, paddingVertical: 16 },
  card: { borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  roomName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  
  // Occupied Slots
  occupiedContainer: { marginVertical: 10, padding: 10, backgroundColor: '#fff5f5', borderRadius: 10 },
  occupiedTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  slotsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  slotBadge: { backgroundColor: '#feb2b2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  slotText: { fontSize: 11, fontWeight: 'bold', color: '#9b2c2c' },

  facilitiesContainer: { marginBottom: 20, marginTop: 10 },
  facilitiesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  facilityTag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  facilityText: { fontSize: 11 },
  bookButton: { height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  bookButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 24, height: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  roomInfo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 },
  confirmButton: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  confirmButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
