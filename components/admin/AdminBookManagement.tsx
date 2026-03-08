import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { BOOKS } from '../../constants/data';
import { Image } from 'expo-image';

export function AdminBookManagement() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = BOOKS.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Manage Books</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput 
            placeholder="Search for books, authors..." 
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredBooks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.adminCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.adminCardMain}>
              <Image source={{ uri: item.cover }} style={styles.adminCover} contentFit="cover" />
              <View style={styles.adminInfo}>
                <Text style={[styles.adminBookTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.adminAuthor, { color: colors.textMuted }]}>{item.author}</Text>
                <Text style={[styles.adminMeta, { color: colors.textMuted }]}>{item.category} • Shelf {item.shelf}</Text>
                <View style={styles.stockRow}>
                  <Ionicons name="copy-outline" size={14} color={colors.primary} />
                  <Text style={[styles.stockText, { color: colors.primary }]}>5 Copies Available</Text>
                </View>
              </View>
            </View>
            <View style={[styles.adminActions, { borderTopColor: colors.border }]}>
              <TouchableOpacity style={styles.adminActionBtn}>
                <Ionicons name="create-outline" size={18} color={colors.primary} />
                <Text style={[styles.adminActionText, { color: colors.primary }]}>Edit</Text>
              </TouchableOpacity>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <TouchableOpacity style={styles.adminActionBtn}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
                <Text style={[styles.adminActionText, { color: colors.danger }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]}>
        <Ionicons name="add" size={30} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  searchSection: { paddingHorizontal: 20, marginVertical: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  adminCard: {
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
  },
  adminCardMain: { flexDirection: 'row', padding: 12 },
  adminCover: { width: 80, height: 110, borderRadius: 12 },
  adminInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  adminBookTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  adminAuthor: { fontSize: 14, marginBottom: 4 },
  adminMeta: { fontSize: 12, marginBottom: 8 },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stockText: { fontSize: 13, fontWeight: '600' },
  adminActions: { flexDirection: 'row', borderTopWidth: 1, height: 44 },
  adminActionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  adminActionText: { fontSize: 14, fontWeight: '600' },
  divider: { width: 1, height: '60%', alignSelf: 'center' },
  fab: {
    position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', elevation: 5,
  },
});
