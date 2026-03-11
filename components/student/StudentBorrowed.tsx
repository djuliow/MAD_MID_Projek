// File ini menampilkan daftar buku yang sedang dipinjam oleh mahasiswa.
// Mahasiswa dapat melihat detail buku, tanggal peminjaman, dan tanggal jatuh tempo pengembalian.

import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useUser } from '../../hooks/useUser';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function StudentBorrowed() {
  const { colors } = useTheme();
  const { user } = useUser();

  // Mengambil data peminjaman buku milik mahasiswa yang sedang login
  const borrowedData = useQuery(api.borrow.getBorrowedBooksByUser, 
    user ? { userId: user._id } : "skip"
  );

  // Menyaring hanya buku yang statusnya masih dipinjam (borrowed)
  const activeBorrows = borrowedData?.filter(b => b.status === 'borrowed') || [];

  // Mengecek apakah buku mendekati batas waktu pengembalian (3 hari sebelumnya)
  const isDueSoon = (dueDateTimestamp: number) => {
    const today = Date.now();
    const diffTime = dueDateTimestamp - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
     return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="lock-closed-outline" size={64} color={colors.textMuted} />
        <Text style={{ color: colors.text, marginTop: 10 }}>Please login to see your borrowed books</Text>
      </View>
    );
  }

  if (borrowedData === undefined) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Books</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Books you are currently holding</Text>
      </View>

      <FlatList
        data={activeBorrows}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 80, paddingHorizontal: 40 }}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.surface }]}>
              <Ionicons name="book-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>No Active Loans</Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 10 }}>
              You don't have any books with you right now. Visit the library to pick up your reservations!
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          if (!item.book || !item.copy) return null;
          const dueSoon = isDueSoon(item.due_date);
          const isOverdue = Date.now() > item.due_date;

          return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: isOverdue ? colors.danger : (dueSoon ? colors.warning : colors.border) }]}>
              <Image source={{ uri: item.book.cover_image }} style={styles.cover} contentFit="cover" />
              <View style={styles.info}>
                <View>
                  <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>{item.book.title}</Text>
                  <View style={styles.copyBadge}>
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>Copy: {item.copy.copy_code}</Text>
                  </View>
                </View>
                
                <View style={styles.datesContainer}>
                  <View style={styles.dateBox}>
                    <Text style={[styles.dateLabel, { color: colors.textMuted }]}>BORROWED</Text>
                    <Text style={[styles.dateText, { color: colors.text }]}>{formatDate(item.borrow_date)}</Text>
                  </View>
                  <View style={styles.dateBox}>
                    <Text style={[styles.dateLabel, { color: isOverdue ? colors.danger : colors.textMuted }]}>
                      {isOverdue ? 'OVERDUE' : 'DUE DATE'}
                    </Text>
                    <Text style={[styles.dateText, { color: isOverdue || dueSoon ? colors.danger : colors.text, fontWeight: 'bold' }]}>
                      {formatDate(item.due_date)}
                    </Text>
                  </View>
                </View>

                {/* Banner status peminjaman (Telat, Segera Kembali, atau Aman) */}
                {isOverdue ? (
                  <View style={[styles.statusBanner, { backgroundColor: colors.danger + '15' }]}>
                    <Ionicons name="alert-circle" size={16} color={colors.danger} />
                    <Text style={[styles.statusBannerText, { color: colors.danger }]}>Please return immediately!</Text>
                  </View>
                ) : dueSoon ? (
                  <View style={[styles.statusBanner, { backgroundColor: colors.warning + '15' }]}>
                    <Ionicons name="time" size={16} color={colors.warning} />
                    <Text style={[styles.statusBannerText, { color: colors.warning }]}>Return in a few days</Text>
                  </View>
                ) : (
                  <View style={[styles.statusBanner, { backgroundColor: colors.success + '15' }]}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={[styles.statusBannerText, { color: colors.success }]}>Keep reading!</Text>
                  </View>
                )}
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
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  listContent: { paddingHorizontal: 20, paddingVertical: 16 },
  card: { flexDirection: 'row', borderRadius: 20, marginBottom: 20, overflow: 'hidden', borderWidth: 1, elevation: 3, height: 180 },
  cover: { width: 120, height: '100%' },
  info: { flex: 1, padding: 16, justifyContent: 'space-between' },
  bookTitle: { fontSize: 16, fontWeight: 'bold', lineHeight: 22 },
  copyBadge: { backgroundColor: 'rgba(0,0,0,0.05)', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  datesContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  dateBox: { flex: 1 },
  dateLabel: { fontSize: 9, fontWeight: 'bold', marginBottom: 2 },
  dateText: { fontSize: 13 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 6 },
  statusBannerText: { fontSize: 12, fontWeight: 'bold' },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' }
});
