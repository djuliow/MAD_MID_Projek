import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { BORROWED_BOOKS } from '../../constants/data';
import { Image } from 'expo-image';

export function AdminBorrowManagement() {
  const { colors } = useTheme();

  const isDueSoon = (dueDate: string) => {
    const today = new Date('2026-03-08'); 
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Borrow Management</Text>
      </View>

      <FlatList
        data={BORROWED_BOOKS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const dueSoon = isDueSoon(item.dueDate);
          return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: dueSoon ? colors.warning : colors.border }]}>
              <Image source={{ uri: item.cover }} style={styles.cover} contentFit="cover" />
              <View style={styles.info}>
                <View style={styles.topInfo}>
                  <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                  <View style={[styles.statusTag, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.statusTagText, { color: colors.primary }]}>Borrowed</Text>
                  </View>
                </View>
                
                <View style={styles.adminDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="person-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.detailText, { color: colors.textMuted }]}>Student: <Text style={{ color: colors.text, fontWeight: '600' }}>Derill</Text></Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.detailText, { color: colors.textMuted }]}>Due: <Text style={{ color: dueSoon ? colors.danger : colors.text, fontWeight: '600' }}>{item.dueDate}</Text></Text>
                  </View>
                </View>

                <TouchableOpacity style={[styles.returnBtn, { backgroundColor: colors.primary }]}>
                  <Text style={styles.returnBtnText}>Confirm Return</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 20, paddingVertical: 16 },
  card: { flexDirection: 'row', borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, elevation: 2 },
  cover: { width: 100, height: 150 },
  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  topInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookTitle: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 8 },
  statusTagText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  adminDetails: { gap: 4 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 13 },
  returnBtn: { height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  returnBtnText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
});
