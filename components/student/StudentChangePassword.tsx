import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from '../../hooks/useUser';

export function StudentChangePassword({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  const { user, setUser } = useUser();
  const changePassword = useMutation(api.users.changePassword);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await changePassword({
        userId: user!._id,
        oldPassword,
        newPassword
      });
      
      // Update context agar tidak stale
      if (updatedUser) {
        setUser(updatedUser as any);
      }

      Alert.alert("Success", "Password updated successfully.");
      onClose();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Change Password</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Old Password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter old password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showOldPassword}
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)} style={styles.eyeIcon}>
              <Ionicons 
                name={showOldPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={colors.textMuted} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter new password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIcon}>
              <Ionicons 
                name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={colors.textMuted} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Confirm new password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Ionicons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={colors.textMuted} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, gap: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold' },
  content: { padding: 20, gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: { flex: 1, height: '100%', fontSize: 16 },
  eyeIcon: { padding: 4 },
  submitButton: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
