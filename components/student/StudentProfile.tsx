import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { useUser } from '../../hooks/useUser';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

export function StudentProfile() {
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const { userName } = useUser();
  const router = useRouter();

  const handleLogout = () => router.replace('/login');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}><Text style={[styles.title, { color: colors.text }]}>Profile</Text></View>
      <View style={styles.profileSection}>
        <View style={[styles.avatarContainer, { borderColor: colors.primary }]}>
          <Image source={{ uri: 'https://i.pravatar.cc/150?u=student' }} style={styles.avatar} />
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
        <View style={[styles.roleBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.roleText, { color: colors.primary }]}>Student</Text>
        </View>
        <Text style={[styles.userEmail, { color: colors.textMuted }]}>student@university.edu</Text>
      </View>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}><Ionicons name="time-outline" size={20} color={colors.primary} /></View>
            <Text style={[styles.menuText, { color: colors.text }]}>Borrow History</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}><Ionicons name="heart-outline" size={20} color={colors.primary} /></View>
            <Text style={[styles.menuText, { color: colors.text }]}>Favorite Books</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
        <View style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}><Ionicons name="moon-outline" size={20} color={colors.primary} /></View>
            <Text style={[styles.menuText, { color: colors.text }]}>Dark Mode</Text>
          </View>
          <Switch value={isDarkMode} onValueChange={toggleDarkMode} trackColor={{ false: '#767577', true: colors.primary }} />
        </View>
        <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.danger }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} /><Text style={[styles.logoutText, { color: colors.danger }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  profileSection: { alignItems: 'center', paddingVertical: 30 },
  avatarContainer: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, padding: 3, marginBottom: 16 },
  avatar: { width: '100%', height: '100%', borderRadius: 50 },
  userName: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 8 },
  roleText: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  userEmail: { fontSize: 14 },
  menuContainer: { paddingHorizontal: 20, gap: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuText: { fontSize: 16, fontWeight: '600' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginTop: 20, gap: 8 },
  logoutText: { fontSize: 16, fontWeight: 'bold' },
});
