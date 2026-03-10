import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '../../hooks/useUser';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';
import BookCard from '../BookCard';

interface StudentFavoritesProps {
  onClose: () => void;
}

export function StudentFavorites({ onClose }: StudentFavoritesProps) {
  const { colors } = useTheme();
  const { user } = useUser();
  const favorites = useQuery(api.favorites.getFavoritesByUser, { userId: user?._id as any });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Favorite Books</Text>
      </View>

      {favorites === undefined ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item: any) => item._id}
          renderItem={({ item }) => (
            <View style={styles.itemWrapper}>
              <BookCard book={item} horizontal />
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Belum ada buku favorit.</Text>
          <Text style={styles.emptySub}>Cari buku yang kamu suka dan ketuk ikon hati!</Text>
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
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  itemWrapper: { marginBottom: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginTop: 15 },
  emptySub: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 5 },
});
