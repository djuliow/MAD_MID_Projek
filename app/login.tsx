import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import useTheme from '../hooks/useTheme';
import { useUser, UserRole } from '../hooks/useUser';
import { Ionicons } from '@expo/vector-icons';
import { useConvex } from "convex/react";
import { api } from "../convex/_generated/api";

// Komponen utama untuk layar Login
export default function LoginScreen() {
  const { colors } = useTheme();
  const { setRole, setUser } = useUser(); // Mengambil fungsi global state untuk data pengguna
  const router = useRouter(); // Hook untuk navigasi antar layar
  const convex = useConvex(); // Client Convex untuk memanggil fungsi database
  
  // State lokal untuk form login
  const [email, setEmail] = useState(''); // Menyimpan input email
  const [password, setPassword] = useState(''); // Menyimpan input password
  const [selectedRole, setSelectedRole] = useState<UserRole>('student'); // Menyimpan role yang dipilih (student/librarian)
  const [showPassword, setShowPassword] = useState(false); // Mengatur visibilitas password
  const [loading, setLoading] = useState(false); // Menandakan proses login sedang berjalan

  const primaryColor = '#461691';

  // Fungsi untuk menangani proses login saat tombol ditekan
  const handleLogin = async () => {
    // Validasi dasar agar input tidak kosong
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true); // Aktifkan loading spinner
    try {
      // Memanggil query login dari Convex dengan parameter email dan password
      const userData = await convex.query(api.users.login, { email, password });
      
      if (userData) {
        // Validasi apakah role yang dipilih sesuai dengan role asli pengguna di database
        if (userData.role !== selectedRole) {
          Alert.alert("Login Error", `You are registered as a ${userData.role}, not a ${selectedRole}.`);
          setLoading(false);
          return;
        }

        // Simpan data pengguna ke global state dan navigasi ke halaman utama
        setUser(userData as any);
        setRole(userData.role as UserRole);
        router.replace('/tabs');
      }
    } catch (error: any) {
      // Menampilkan pesan error jika login gagal
      Alert.alert("Login Failed", "Invalid email or password. If you forgot your password, please contact the library administrator.");
    } finally {
      setLoading(false); // Matikan loading spinner
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#fcfaff' }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Perpustakaan */}
          <View style={styles.logoSection}>
            <View style={[styles.logoCircle, { backgroundColor: primaryColor }]}>
              <Ionicons name="book" size={40} color="#ffffff" />
            </View>
          </View>

          {/* Judul dan Subjudul */}
          <View style={styles.headerTextSection}>
            <Text style={[styles.title, { color: '#1e1b4b' }]}>Welcome to Campus Library</Text>
            <Text style={[styles.subtitle, { color: '#6b7280' }]}>
              {selectedRole === 'student' ? 'Login using your student email' : 'Login using your staff email'}
            </Text>
          </View>

          {/* Selektor Peran (Student atau Librarian) */}
          <View style={styles.roleSelectorContainer}>
            <View style={[styles.segmentedControl, { backgroundColor: '#f3e8ff' }]}>
              <TouchableOpacity 
                style={[
                  styles.segmentButton, 
                  selectedRole === 'student' && { backgroundColor: primaryColor }
                ]}
                onPress={() => setSelectedRole('student')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.segmentText, 
                  { color: selectedRole === 'student' ? '#ffffff' : primaryColor }
                ]}>Student</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.segmentButton, 
                  selectedRole === 'librarian' && { backgroundColor: primaryColor }
                ]}
                onPress={() => setSelectedRole('librarian')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.segmentText, 
                  { color: selectedRole === 'librarian' ? '#ffffff' : primaryColor }
                ]}>Librarian</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formContainer}>
            {/* Input Field Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder={`Enter your ${selectedRole} email`}
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Input Field Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#9ca3af" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Tombol Login */}
            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: primaryColor, marginTop: 20 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer untuk informasi pendaftaran akun - Hanya untuk Mahasiswa */}
          {selectedRole === 'student' && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don't have an account? <Text style={{ fontWeight: 'bold', color: primaryColor }}>Contact library administrator.</Text>
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#461691",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTextSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  roleSelectorContainer: {
    marginBottom: 32,
  },
  segmentedControl: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 25,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e1b4b',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e1b4b',
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#461691",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
});
