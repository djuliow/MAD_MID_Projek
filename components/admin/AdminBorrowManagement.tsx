// File ini berfungsi untuk mengelola transaksi peminjaman buku oleh admin.
// Mencakup pencatatan pinjaman baru untuk mahasiswa dan konfirmasi pengembalian buku.

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, ScrollView } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";

export function AdminBorrowManagement() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  
  // State untuk form peminjaman baru
  const [selectedStudent, setSelectedStudent] = useState<Doc<"users"> | null>(null);
  const [selectedBook, setSelectedBook] = useState<Doc<"books"> | null>(null);
  const [selectedCopyId, setSelectedCopyId] = useState<Id<"bookCopies"> | null>(null);
  const [loanType, setLoanType] = useState<'take_home' | 'in_library'>('take_home');
  const [daysToBorrow, setDaysToBorrow] = useState('7');
  const [formSearchStudent, setFormSearchStudent] = useState('');
  const [formSearchBook, setFormSearchBook] = useState('');

  // Mengambil data dari backend Convex
  const borrows = useQuery(api.borrow.getAllBorrows, {});
  const students = useQuery(api.users.getStudents, {});
  const books = useQuery(api.books.getBooks, {});
  const availableCopies = useQuery(api.books.getAvailableCopies, selectedBook ? { bookId: selectedBook._id } : "skip");
  
  const returnBook = useMutation(api.borrow.returnBook);
  const borrowBook = useMutation(api.borrow.borrowBook);

  const filteredBorrows = borrows?.filter(b => 
    b.book?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mengecek apakah buku akan segera jatuh tempo (dalam 3 hari)
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

  // Fungsi untuk memproses pengembalian buku
  const handleReturn = async (borrowId: any) => {
    Alert.alert(
      "Confirm Return",
      "Are you sure this book has been returned?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Returned", onPress: async () => {
            try {
              await returnBook({ borrowId });
              Alert.alert("Success", "Book return confirmed");
            } catch (error) {
              Alert.alert("Error", "Failed to confirm return");
            }
          }
        }
      ]
    );
  };

  // Fungsi untuk membuat entri peminjaman baru
  const handleCreateBorrow = async () => {
    if (!selectedStudent || !selectedCopyId) {
      Alert.alert("Error", "Please select a student and a specific book copy");
      return;
    }

    const duration = loanType === 'in_library' ? 0.5 : (parseInt(daysToBorrow) || 7);
    const dueDate = Date.now() + duration * 24 * 60 * 60 * 1000;

    try {
      await borrowBook({
        userId: selectedStudent._id,
        copyId: selectedCopyId,
        dueDate,
        type: loanType
      });
      Alert.alert("Success", "Loan recorded successfully");
      setModalVisible(false);
      resetForm();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to record loan");
    }
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setSelectedBook(null);
    setSelectedCopyId(null);
    setLoanType('take_home');
    setDaysToBorrow('7');
    setFormSearchStudent('');
    setFormSearchBook('');
  };

  if (borrows === undefined) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Borrow Management</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput 
            placeholder="Search by student or book..." 
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredBorrows}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Ionicons name="swap-horizontal-outline" size={64} color={colors.textMuted} />
            <Text style={{ color: colors.text, fontSize: 18, marginTop: 10 }}>No active borrows</Text>
          </View>
        }
        renderItem={({ item }) => {
          if (!item.book || !item.copy) return null;
          const dueSoon = isDueSoon(item.due_date);
          return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: dueSoon ? colors.warning : colors.border }]}>
              <Image source={{ uri: item.book.cover_image }} style={styles.cover} contentFit="cover" />
              <View style={styles.info}>
                <View style={styles.topInfo}>
                  <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>{item.book.title}</Text>
                  <View style={[styles.statusTag, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.statusTagText, { color: colors.primary }]}>Borrowed</Text>
                  </View>
                </View>
                
                <View style={styles.adminDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="person-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.detailText, { color: colors.textMuted }]}>Student: <Text style={{ color: colors.text, fontWeight: '600' }}>{item.user?.name || "Unknown"}</Text></Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.detailText, { color: colors.textMuted }]}>Due: <Text style={{ color: dueSoon ? colors.danger : colors.text, fontWeight: '600' }}>{formatDate(item.due_date)}</Text></Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.returnBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handleReturn(item._id)}
                >
                  <Text style={styles.returnBtnText}>Confirm Return</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="#ffffff" />
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Record New Loan</Text>
            <TouchableOpacity onPress={handleCreateBorrow}>
              <Text style={[styles.saveBtnText, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContent}>
            {/* Step 1: Select Student */}
            <Text style={[styles.label, { color: colors.text }]}>1. Select Student</Text>
            {!selectedStudent ? (
              <View>
                <TextInput 
                  placeholder="Search student name or NIM..." 
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  value={formSearchStudent}
                  onChangeText={setFormSearchStudent}
                  placeholderTextColor={colors.textMuted}
                />
                <View style={styles.selectionList}>
                  {students?.filter(s => s.name.toLowerCase().includes(formSearchStudent.toLowerCase()) || s.student_id?.includes(formSearchStudent)).slice(0, 3).map(s => (
                    <TouchableOpacity key={s._id} style={[styles.selectItem, { borderBottomColor: colors.border }]} onPress={() => setSelectedStudent(s)}>
                      <Text style={{ color: colors.text }}>{s.name} ({s.student_id})</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <View style={[styles.selectedBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{selectedStudent.name}</Text>
                <TouchableOpacity onPress={() => setSelectedStudent(null)}><Ionicons name="close-circle" size={20} color={colors.primary} /></TouchableOpacity>
              </View>
            )}

            {/* Step 2: Select Book */}
            <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>2. Select Book</Text>
            {!selectedBook ? (
              <View>
                <TextInput 
                  placeholder="Search book title..." 
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  value={formSearchBook}
                  onChangeText={setFormSearchBook}
                  placeholderTextColor={colors.textMuted}
                />
                <View style={styles.selectionList}>
                  {books?.filter(b => b.title.toLowerCase().includes(formSearchBook.toLowerCase())).slice(0, 3).map(b => (
                    <TouchableOpacity key={b._id} style={[styles.selectItem, { borderBottomColor: colors.border }]} onPress={() => setSelectedBook(b)}>
                      <Text style={{ color: colors.text }}>{b.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <View style={[styles.selectedBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{selectedBook.title}</Text>
                <TouchableOpacity onPress={() => { setSelectedBook(null); setSelectedCopyId(null); }}><Ionicons name="close-circle" size={20} color={colors.primary} /></TouchableOpacity>
              </View>
            )}

            {/* Step 3: Select Copy */}
            {selectedBook && (
              <>
                <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>3. Select Copy Code</Text>
                <View style={styles.copyGrid}>
                  {availableCopies?.map(copy => (
                    <TouchableOpacity 
                      key={copy._id} 
                      style={[styles.copyChip, { 
                        backgroundColor: selectedCopyId === copy._id ? colors.primary : colors.surface,
                        borderColor: colors.primary
                      }]}
                      onPress={() => setSelectedCopyId(copy._id)}
                    >
                      <Text style={{ color: selectedCopyId === copy._id ? '#fff' : colors.text }}>{copy.copy_code}</Text>
                    </TouchableOpacity>
                  ))}
                  {availableCopies?.length === 0 && <Text style={{ color: colors.danger }}>No copies available</Text>}
                </View>

                <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>4. Loan Type</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                  <TouchableOpacity 
                    style={[styles.typeOption, { 
                      borderColor: colors.primary, 
                      backgroundColor: loanType === 'take_home' ? colors.primary : 'transparent' 
                    }]}
                    onPress={() => setLoanType('take_home')}
                  >
                    <Text style={{ color: loanType === 'take_home' ? '#fff' : colors.primary, fontWeight: 'bold' }}>Bawa Pulang</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.typeOption, { 
                      borderColor: colors.primary, 
                      backgroundColor: loanType === 'in_library' ? colors.primary : 'transparent' 
                    }]}
                    onPress={() => setLoanType('in_library')}
                  >
                    <Text style={{ color: loanType === 'in_library' ? '#fff' : colors.primary, fontWeight: 'bold' }}>Baca di Perpus</Text>
                  </TouchableOpacity>
                </View>

                {loanType === 'take_home' && (
                  <>
                    <Text style={[styles.label, { color: colors.text, marginTop: 10 }]}>5. Duration (Days)</Text>
                    <TextInput 
                      keyboardType="numeric"
                      style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                      value={daysToBorrow}
                      onChangeText={setDaysToBorrow}
                    />
                  </>
                )}
              </>
            )}
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
  fab: { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  
  // Modal Styles
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  saveBtnText: { fontSize: 16, fontWeight: 'bold' },
  formContent: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, marginBottom: 10 },
  selectionList: { marginBottom: 10 },
  selectItem: { padding: 15, borderBottomWidth: 1 },
  selectedBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  copyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  copyChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  typeOption: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
});
