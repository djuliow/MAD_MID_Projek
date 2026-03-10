import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { useUser } from '../../hooks/useUser';
import { Ionicons } from '@expo/vector-icons';
import BookCard from '../BookCard';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import StudentAttendanceCheckIn from './StudentAttendanceCheckIn';

export function StudentHome() {
  const { colors } = useTheme();
  const { user } = useUser();

  const books = useQuery(api.books.getBooks, {});
  const latestBooks = useQuery(api.books.getLatestBooks, { limit: 5 });
  const userData = useQuery(api.users.getUserById, { id: user?._id as any });

  if (books === undefined || latestBooks === undefined || userData === undefined) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const recommendedBooks = books.slice(0, 5);
  const newBooks = books.slice(5, 10);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.textMuted }]}>Welcome,</Text>
          <Text style={[styles.nameText, { color: colors.text }]}>{user?.name}</Text>
        </View>
        <View style={styles.pointsContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.pointsText}>{userData?.library_points ?? 0} Poin</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={20} color={colors.textMuted} />
            <TextInput 
              placeholder="Search for books, authors..." 
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
            />
            <TouchableOpacity>
              <Ionicons name="options-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <StudentAttendanceCheckIn />

        {books.length > 0 ? (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended Books</Text>
                <TouchableOpacity>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                {recommendedBooks.map(book => (
                  <BookCard key={book._id} book={book} />
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>New Books</Text>
                <TouchableOpacity>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.verticalList}>
                {latestBooks.length > 0 ? latestBooks.map(book => (
                  <BookCard key={book._id} book={book} horizontal />
                )) : (
                   <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 10 }}>No more books yet.</Text>
                )}
              </View>
            </View>
          </>
        ) : (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Ionicons name="book-outline" size={64} color={colors.textMuted} />
            <Text style={{ color: colors.text, fontSize: 18, marginTop: 10 }}>No books available</Text>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeText: { fontSize: 14 },
  nameText: { fontSize: 20, fontWeight: 'bold' },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9c4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fbc02d',
  },
  pointsText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f57f17',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  searchSection: { paddingHorizontal: 20, marginVertical: 20 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16 },
  section: { marginTop: 10 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAll: { fontSize: 14, fontWeight: '600' },
  horizontalScroll: { paddingLeft: 20, paddingRight: 4 },
  verticalList: { paddingHorizontal: 20 },
});
