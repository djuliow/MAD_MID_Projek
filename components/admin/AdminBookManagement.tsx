import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, ScrollView, Alert } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function AdminBookManagement() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState('');
  const [isbn, setIsbn] = useState('');
  const [shelf, setShelf] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [totalCopies, setTotalCopies] = useState('');

  const books = useQuery(api.books.getBooks, {});
  const addBook = useMutation(api.books.addBook);

  const filteredBooks = books?.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBook = async () => {
    if (!title || !author || !isbn || !totalCopies) {
      Alert.alert("Error", "Please fill in all required fields (Title, Author, ISBN, and Stock)");
      return;
    }

    setLoading(true);
    try {
      await addBook({
        title,
        author,
        publisher,
        year: parseInt(year) || new Date().getFullYear(),
        category,
        isbn,
        description,
        shelf_location: shelf,
        cover_image: coverImage || 'https://via.placeholder.com/150?text=No+Cover',
        total_copies: parseInt(totalCopies),
      });

      Alert.alert("Success", "New book and copies have been added to the catalog");
      setModalVisible(false);
      resetForm();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add book");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle(''); setAuthor(''); setPublisher(''); setYear('');
    setCategory(''); setIsbn(''); setShelf(''); setDescription('');
    setCoverImage(''); setTotalCopies('');
  };

  if (books === undefined) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={[styles.adminCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.adminCardMain}>
              <Image source={{ uri: item.cover_image }} style={styles.adminCover} contentFit="cover" />
              <View style={styles.adminInfo}>
                <Text style={[styles.adminBookTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.adminAuthor, { color: colors.textMuted }]}>{item.author}</Text>
                <Text style={[styles.adminMeta, { color: colors.textMuted }]}>{item.category} • Shelf {item.shelf_location}</Text>
                <View style={styles.stockRow}>
                  <Ionicons name="copy-outline" size={14} color={colors.primary} />
                  <Text style={[styles.stockText, { color: colors.primary }]}>{item.available_copies} / {item.total_copies} Available</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.textMuted, marginTop: 20 }}>No books found</Text>}
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="#ffffff" />
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Book</Text>
            <TouchableOpacity onPress={handleAddBook} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={[styles.saveBtnText, { color: colors.primary }]}>Save</Text>}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={title} onChangeText={setTitle} placeholder="e.g. The Great Gatsby" placeholderTextColor={colors.textMuted} />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.text }]}>Author *</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={author} onChangeText={setAuthor} placeholder="Author name" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={[styles.label, { color: colors.text }]}>ISBN *</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={isbn} onChangeText={setIsbn} placeholder="ISBN number" placeholderTextColor={colors.textMuted} />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.text }]}>Category</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={category} onChangeText={setCategory} placeholder="e.g. Fiction" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={[styles.label, { color: colors.text }]}>Stock *</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={totalCopies} onChangeText={setTotalCopies} placeholder="Qty" keyboardType="numeric" placeholderTextColor={colors.textMuted} />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.text }]}>Shelf Location</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={shelf} onChangeText={setShelf} placeholder="e.g. A-10" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={[styles.label, { color: colors.text }]}>Year</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={year} onChangeText={setYear} placeholder="e.g. 2024" keyboardType="numeric" placeholderTextColor={colors.textMuted} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Cover Image URL</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={coverImage} onChangeText={setCoverImage} placeholder="https://..." placeholderTextColor={colors.textMuted} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Description</Text>
              <TextInput 
                style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} 
                value={description} onChangeText={setDescription} 
                placeholder="Book summary..." 
                multiline numberOfLines={4} 
                placeholderTextColor={colors.textMuted}
                textAlignVertical="top"
              />
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  searchSection: { paddingHorizontal: 20, marginVertical: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56, borderRadius: 16, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  adminCard: { borderRadius: 20, marginBottom: 16, borderWidth: 1, overflow: 'hidden', elevation: 2 },
  adminCardMain: { flexDirection: 'row', padding: 12 },
  adminCover: { width: 80, height: 110, borderRadius: 12 },
  adminInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  adminBookTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  adminAuthor: { fontSize: 14, marginBottom: 4 },
  adminMeta: { fontSize: 12, marginBottom: 8 },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stockText: { fontSize: 13, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  
  // Modal Styles
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  closeBtn: { width: 40, height: 40, justifyContent: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  saveBtnText: { fontSize: 16, fontWeight: 'bold' },
  formContent: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputRow: { flexDirection: 'row', marginBottom: 0 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  input: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 },
  textArea: { height: 120, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
});
