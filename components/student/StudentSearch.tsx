import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import BookCard from '../BookCard';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function StudentSearch() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const books = useQuery(api.books.getBooks, {});

  if (books === undefined) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Search Books</Text>
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
        <TouchableOpacity style={[styles.filterBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="options-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBooks}
        keyExtractor={item => item._id}
        renderItem={({ item }) => <BookCard book={item} horizontal />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Ionicons name="search-outline" size={64} color={colors.textMuted} />
            <Text style={{ color: colors.text, fontSize: 18, marginTop: 10 }}>No books found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  searchSection: { flexDirection: 'row', paddingHorizontal: 20, marginVertical: 16, gap: 12 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56,
    borderRadius: 16, borderWidth: 1,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16 },
  filterBtn: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
});
