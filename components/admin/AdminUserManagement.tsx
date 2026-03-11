// File ini berfungsi untuk manajemen akun mahasiswa oleh admin.
// Admin dapat mendaftarkan akun mahasiswa baru, mencari data mahasiswa, dan menghapus akun mahasiswa.

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, Alert } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function AdminUserManagement({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  
  // State untuk form input mahasiswa baru
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');

  // Queries & Mutations untuk data pengguna di Convex
  const students = useQuery(api.users.getStudents, {});
  const createUser = useMutation(api.users.createUser);
  const deleteUser = useMutation(api.users.deleteUser);

  const filteredStudents = students?.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_id?.includes(searchQuery)
  );

  // Fungsi untuk mendaftarkan mahasiswa baru
  const handleAddStudent = async () => {
    if (!name || !email || !studentId || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      await createUser({
        name,
        email,
        student_id: studentId,
        password,
        role: 'student'
      });
      Alert.alert("Success", "Student registered successfully");
      setModalVisible(false);
      setName(''); setEmail(''); setStudentId(''); setPassword('');
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to register student");
    }
  };

  // Fungsi untuk menghapus akun mahasiswa
  const handleDelete = (id: any, name: string) => {
    Alert.alert(
      "Delete Student",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteUser({ id }) }
      ]
    );
  };

  if (students === undefined) {
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
        <Text style={[styles.title, { color: colors.text }]}>Manage Students</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput 
            placeholder="Search name, email, or NIM..." 
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredStudents}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.userInfo}>
              <View style={[styles.avatarSmall, { backgroundColor: colors.primary + '20' }]}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{item.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.userMeta, { color: colors.textMuted }]}>{item.student_id} • {item.email}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item._id, item.name)}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.textMuted, marginTop: 20 }}>No students found</Text>}
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
        <Ionicons name="person-add" size={24} color="#ffffff" />
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Register New Student</Text>
            
            <TextInput placeholder="Full Name" style={[styles.input, { borderColor: colors.border, color: colors.text }]} value={name} onChangeText={setName} placeholderTextColor={colors.textMuted} />
            <TextInput placeholder="Student ID (NIM)" style={[styles.input, { borderColor: colors.border, color: colors.text }]} value={studentId} onChangeText={setStudentId} placeholderTextColor={colors.textMuted} />
            <TextInput placeholder="Email Campus" style={[styles.input, { borderColor: colors.border, color: colors.text }]} value={email} onChangeText={setEmail} keyboardType="email-address" placeholderTextColor={colors.textMuted} />
            <TextInput placeholder="Initial Password" style={[styles.input, { borderColor: colors.border, color: colors.text }]} value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={colors.textMuted} />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.bg }]} onPress={() => setModalVisible(false)}>
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleAddStudent}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, gap: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
  searchSection: { paddingHorizontal: 20, marginVertical: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 50, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 12 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  userCard: { padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 16, fontWeight: 'bold' },
  userMeta: { fontSize: 12, marginTop: 2 },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 24, padding: 24, gap: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});
