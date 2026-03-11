// File ini berfungsi untuk manajemen aset perpustakaan oleh admin.
// Mencakup penambahan, pengeditan, dan pencarian data buku serta ruangan belajar.

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, ScrollView, Alert, Switch } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

type ManagementMode = 'books' | 'rooms';

export function AdminBookManagement() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<ManagementMode>('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- BOOK FORM STATE ---
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
  const [isComingSoon, setIsComingSoon] = useState(false);

  // --- ROOM FORM STATE ---
  const [roomName, setRoomName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [facilities, setFacilities] = useState('');
  const [location, setLocation] = useState('');

  // --- QUERIES & MUTATIONS ---
  const books = useQuery(api.books.getBooks, {});
  const rooms = useQuery(api.rooms.getRooms, {});
  
  const addBook = useMutation(api.books.addBook);
  const updateBook = useMutation(api.books.updateBook);
  const addRoom = useMutation(api.rooms.addRoom);
  const updateRoom = useMutation(api.rooms.updateRoom);

  const filteredBooks = books?.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRooms = rooms?.filter(room => 
    room.room_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fungsi untuk mengisi form dengan data buku yang akan diedit
  const handleOpenEditBook = (book: any) => {
    setMode('books');
    setEditingId(book._id);
    setTitle(book.title);
    setAuthor(book.author);
    setPublisher(book.publisher || '');
    setYear(book.year.toString());
    setCategory(book.category);
    setIsbn(book.isbn);
    setShelf(book.shelf_location);
    setDescription(book.description);
    setCoverImage(book.cover_image);
    setTotalCopies(book.total_copies.toString());
    setIsComingSoon(book.is_coming_soon || false);
    setModalVisible(true);
  };

  // Fungsi untuk mengisi form dengan data ruangan yang akan diedit
  const handleOpenEditRoom = (room: any) => {
    setMode('rooms');
    setEditingId(room._id);
    setRoomName(room.room_name);
    setCapacity(room.capacity.toString());
    setFacilities(room.facilities);
    setLocation(room.location);
    setModalVisible(true);
  };

  // Fungsi untuk menyimpan perubahan atau menambah data baru
  const handleSave = async () => {
    setLoading(true);
    try {
      if (mode === 'books') {
        if (!title || !author || !isbn || (!isComingSoon && !totalCopies)) {
          throw new Error("Please fill in required book fields.");
        }
        const bookData = {
          title, author, publisher,
          year: parseInt(year) || new Date().getFullYear(),
          category, isbn, description,
          shelf_location: isComingSoon ? "TBA" : shelf,
          cover_image: coverImage || 'https://via.placeholder.com/150?text=No+Cover',
          total_copies: isComingSoon ? 0 : parseInt(totalCopies),
          is_coming_soon: isComingSoon,
        };
        if (editingId) await updateBook({ id: editingId as any, ...bookData });
        else await addBook(bookData);
      } else {
        if (!roomName || !capacity || !location) {
          throw new Error("Please fill in required room fields.");
        }
        const roomData = {
          room_name: roomName,
          capacity: parseInt(capacity),
          facilities,
          location
        };
        if (editingId) await updateRoom({ roomId: editingId as any, ...roomData });
        else await addRoom(roomData);
      }

      Alert.alert("Success", "Information saved successfully.");
      setModalVisible(false);
      resetForm();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    // Reset Books
    setTitle(''); setAuthor(''); setPublisher(''); setYear('');
    setCategory(''); setIsbn(''); setShelf(''); setDescription('');
    setCoverImage(''); setTotalCopies(''); setIsComingSoon(false);
    // Reset Rooms
    setRoomName(''); setCapacity(''); setFacilities(''); setLocation('');
  };

  if (books === undefined || rooms === undefined) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Library Assets</Text>
      </View>

      {/* Mode Switcher (Tabs) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, mode === 'books' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
          onPress={() => { setMode('books'); setSearchQuery(''); }}
        >
          <Text style={[styles.tabText, { color: mode === 'books' ? colors.primary : colors.textMuted }]}>Books</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, mode === 'rooms' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
          onPress={() => { setMode('rooms'); setSearchQuery(''); }}
        >
          <Text style={[styles.tabText, { color: mode === 'rooms' ? colors.primary : colors.textMuted }]}>Study Rooms</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput 
            placeholder={mode === 'books' ? "Search title, author..." : "Search room name, location..."}
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={(mode === 'books' ? filteredBooks : filteredRooms) as any[]}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          mode === 'books' ? (
            <TouchableOpacity 
              style={[styles.adminCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleOpenEditBook(item)}
            >
              {(item as any).is_coming_soon && (
                <View style={styles.adminComingSoonBadge}>
                  <Text style={styles.adminComingSoonText}>COMING SOON</Text>
                </View>
              )}
              <View style={styles.adminCardMain}>
                <Image source={{ uri: (item as any).cover_image }} style={styles.adminCover} contentFit="cover" />
                <View style={styles.adminInfo}>
                  <Text style={[styles.adminBookTitle, { color: colors.text }]} numberOfLines={1}>{(item as any).title}</Text>
                  <Text style={[styles.adminAuthor, { color: colors.textMuted }]}>{(item as any).author}</Text>
                  <Text style={[styles.adminMeta, { color: colors.textMuted }]}>{(item as any).category} • Shelf {(item as any).shelf_location}</Text>
                  <View style={styles.stockRow}>
                    <Ionicons name="copy-outline" size={14} color={colors.primary} />
                    <Text style={[styles.stockText, { color: colors.primary }]}>
                      {(item as any).is_coming_soon ? "Coming Soon" : `${(item as any).available_copies} / ${(item as any).total_copies} Available`}
                    </Text>
                  </View>
                </View>
                <Ionicons name="create-outline" size={20} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.adminCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleOpenEditRoom(item)}
            >
              <View style={styles.adminCardMain}>
                <View style={[styles.roomIconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="business-outline" size={30} color={colors.primary} />
                </View>
                <View style={styles.adminInfo}>
                  <Text style={[styles.adminBookTitle, { color: colors.text }]}>{(item as any).room_name}</Text>
                  <Text style={[styles.adminAuthor, { color: colors.textMuted }]}>{(item as any).location}</Text>
                  <View style={styles.stockRow}>
                    <Ionicons name="people-outline" size={14} color={colors.primary} />
                    <Text style={[styles.stockText, { color: colors.primary }]}>Capacity: {(item as any).capacity} persons</Text>
                  </View>
                </View>
                <Ionicons name="create-outline" size={20} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          )
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.textMuted, marginTop: 20 }}>No items found</Text>}
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => { resetForm(); setModalVisible(true); }}>
        <Ionicons name="add" size={30} color="#ffffff" />
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          <View style={[
            styles.modalHeader, 
            mode === 'books' && isComingSoon && { backgroundColor: '#E0F7FA', borderBottomColor: '#00838F' }
          ]}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color={(mode === 'books' && isComingSoon) ? '#00838F' : colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: (mode === 'books' && isComingSoon) ? '#00838F' : colors.text }]}>
              {editingId ? "Edit" : "Add New"} {mode === 'books' ? "Book" : "Room"}
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={[styles.saveBtnText, { color: (mode === 'books' && isComingSoon) ? '#00838F' : colors.primary }]}>Save</Text>}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
            {mode === 'books' ? (
              // --- BOOK FORM ---
              <>
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
                    <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={category} onChangeText={setCategory} placeholder="Genre" placeholderTextColor={colors.textMuted} />
                  </View>
                  {!isComingSoon && (
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                      <Text style={[styles.label, { color: colors.text }]}>Stock *</Text>
                      <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={totalCopies} onChangeText={setTotalCopies} placeholder="Qty" keyboardType="numeric" placeholderTextColor={colors.textMuted} />
                    </View>
                  )}
                </View>
                <View style={styles.inputRow}>
                  {!isComingSoon && (
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={[styles.label, { color: colors.text }]}>Shelf Location</Text>
                      <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={shelf} onChangeText={setShelf} placeholder="e.g. A-10" placeholderTextColor={colors.textMuted} />
                    </View>
                  )}
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: isComingSoon ? 0 : 12 }]}>
                    <Text style={[styles.label, { color: colors.text }]}>Year</Text>
                    <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={year} onChangeText={setYear} placeholder="e.g. 2024" keyboardType="numeric" placeholderTextColor={colors.textMuted} />
                  </View>
                </View>
                <View style={[styles.inputGroup, styles.switchRow]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.text, marginBottom: 2 }]}>Coming Soon</Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 4 }}>Mark this book as upcoming.</Text>
                  </View>
                  <Switch value={isComingSoon} onValueChange={setIsComingSoon} trackColor={{ false: '#767577', true: colors.primary }} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Cover Image URL</Text>
                  <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={coverImage} onChangeText={setCoverImage} placeholder="https://..." placeholderTextColor={colors.textMuted} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                  <TextInput style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={description} onChangeText={setDescription} placeholder="Summary..." multiline numberOfLines={4} placeholderTextColor={colors.textMuted} textAlignVertical="top" />
                </View>
              </>
            ) : (
              // --- ROOM FORM ---
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Room Name *</Text>
                  <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={roomName} onChangeText={setRoomName} placeholder="e.g. Collaborative Room 1" placeholderTextColor={colors.textMuted} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Location *</Text>
                  <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={location} onChangeText={setLocation} placeholder="e.g. Discussion Zone, North Wing" placeholderTextColor={colors.textMuted} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Capacity (Persons) *</Text>
                  <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={capacity} onChangeText={setCapacity} placeholder="e.g. 6" keyboardType="numeric" placeholderTextColor={colors.textMuted} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Facilities</Text>
                  <TextInput style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={facilities} onChangeText={setFacilities} placeholder="e.g. TV, Whiteboard, AC..." multiline numberOfLines={3} placeholderTextColor={colors.textMuted} textAlignVertical="top" />
                </View>
              </>
            )}
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
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 10, gap: 20 },
  tab: { paddingVertical: 10, paddingHorizontal: 5 },
  tabText: { fontSize: 16, fontWeight: 'bold' },
  searchSection: { paddingHorizontal: 20, marginVertical: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56, borderRadius: 16, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  adminCard: { borderRadius: 20, marginBottom: 16, borderWidth: 1, overflow: 'hidden', elevation: 2, position: 'relative' },
  adminComingSoonBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#00838F', paddingHorizontal: 10, paddingVertical: 4, borderBottomLeftRadius: 12, zIndex: 10 },
  adminComingSoonText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  adminCardMain: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  adminCover: { width: 80, height: 110, borderRadius: 12 },
  roomIconContainer: { width: 80, height: 80, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  adminInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  adminBookTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  adminAuthor: { fontSize: 14, marginBottom: 4 },
  adminMeta: { fontSize: 12, marginBottom: 8 },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stockText: { fontSize: 13, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  closeBtn: { width: 40, height: 40, justifyContent: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  saveBtnText: { fontSize: 16, fontWeight: 'bold' },
  formContent: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputRow: { flexDirection: 'row', marginBottom: 0 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 25 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  input: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 },
  textArea: { height: 100, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
});
