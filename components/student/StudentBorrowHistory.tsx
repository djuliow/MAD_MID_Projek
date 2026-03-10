import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from '../../hooks/useUser';

export function StudentBorrowHistory({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  const { user } = useUser();

  const history = useQuery(api.borrow.getBorrowHistory, 
    user ? { userId: user._id } : "skip"
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (history === undefined) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Borrow History</Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <Ionicons name="time-outline" size={64} color={colors.textMuted} />
            <Text style={{ color: colors.text, fontSize: 18, marginTop: 10 }}>No history found</Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 5 }}>Books you've returned will appear here.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Image source={{ uri: item.book?.cover_image }} style={styles.bookCover} contentFit="cover" />
            <View style={styles.historyInfo}>
              <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>{item.book?.title || "Unknown Book"}</Text>
              <Text style={[styles.author, { color: colors.textMuted }]}>{item.book?.author}</Text>
              
              <View style={styles.datesRow}>
                <View style={styles.dateItem}>
                  <Text style={[styles.dateLabel, { color: colors.textMuted }]}>BORROWED</Text>
                  <Text style={[styles.dateValue, { color: colors.text }]}>{formatDate(item.borrow_date)}</Text>
                </View>
                <View style={styles.dateItem}>
                  <Text style={[styles.dateLabel, { color: colors.textMuted }]}>RETURNED</Text>
                  <Text style={[styles.dateValue, { color: colors.success, fontWeight: 'bold' }]}>{item.return_date ? formatDate(item.return_date) : '-'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, gap: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 20, paddingVertical: 16 },
  historyCard: { flexDirection: 'row', borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, elevation: 2 },
  bookCover: { width: 80, height: 110 },
  historyInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  bookTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  author: { fontSize: 13, marginBottom: 8 },
  datesRow: { flexDirection: 'row', gap: 20 },
  dateItem: { gap: 2 },
  dateLabel: { fontSize: 9, fontWeight: 'bold' },
  dateValue: { fontSize: 12 },
});
