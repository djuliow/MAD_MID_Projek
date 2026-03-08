import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { ROOMS } from '../../constants/data';

export function StudentRoomBooking() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Study Rooms</Text>
      </View>

      <FlatList
        data={ROOMS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.roomName, { color: colors.text }]}>{item.name}</Text>
                <View style={styles.capacityRow}>
                  <Ionicons name="people-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.capacityText, { color: colors.textMuted }]}>Up to {item.capacity} people</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'Available' ? colors.success + '20' : colors.danger + '20' }]}>
                <Text style={[styles.statusText, { color: item.status === 'Available' ? colors.success : colors.danger }]}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.facilitiesContainer}>
              <Text style={[styles.facilitiesTitle, { color: colors.text }]}>Facilities:</Text>
              <View style={styles.facilitiesList}>
                {item.facilities.map((facility, index) => (
                  <View key={index} style={[styles.facilityTag, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.facilityText, { color: colors.text }]}>{facility}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.bookButton, { backgroundColor: item.status === 'Available' ? colors.primary : colors.textMuted }]}
              disabled={item.status !== 'Available'}
            >
              <Text style={styles.bookButtonText}>{item.status === 'Available' ? 'Book Room' : 'Unavailable'}</Text>
            </TouchableOpacity>
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
  card: { borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  roomName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  capacityRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  capacityText: { fontSize: 14 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  facilitiesContainer: { marginBottom: 20 },
  facilitiesTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  facilitiesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  facilityTag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  facilityText: { fontSize: 12 },
  bookButton: { height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  bookButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});
