import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useTheme from '../../hooks/useTheme';
import { useUser } from '../../hooks/useUser';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { user } = useUser();
  const router = useRouter();
  const [isReserving, setIsReserving] = useState(false);
  const [reservationType, setReservationType] = useState<'in_library' | 'take_home'>('take_home');

  const book = useQuery(api.books.getBookById, { id: id as Id<"books"> });
  const reserveBook = useMutation(api.reservation.reserveBook);

  if (book === undefined) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Book not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleReserve = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login as a student to reserve books.");
      return;
    }

    setIsReserving(true);
    try {
      const pickupDeadline = Date.now() + 2 * 24 * 60 * 60 * 1000;
      
      await reserveBook({
        userId: user._id,
        bookId: book._id,
        pickupDeadline,
        type: reservationType,
      });

      Alert.alert(
        "Success", 
        `Book reserved for ${reservationType === 'in_library' ? 'reading in library' : 'taking home'}! Please pick it up within 48 hours.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert("Reservation Failed", error.message || "Something went wrong.");
    } finally {
      setIsReserving(false);
    }
  };

  const isAvailable = book.available_copies > 0;
  const isComingSoon = book.is_coming_soon;
  
  let statusLabel = isAvailable ? 'Available' : 'Borrowed';
  let badgeColor = isAvailable ? colors.success : colors.danger;
  
  if (isComingSoon) {
    statusLabel = 'Coming Soon';
    badgeColor = '#00838F';
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surface }]}>
          <Ionicons name="share-social-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.coverContainer}>
          <Image source={{ uri: book.cover_image }} style={styles.cover} contentFit="cover" />
        </View>

        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>{book.title}</Text>
              <Text style={[styles.author, { color: colors.textMuted }]}>{book.author}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: badgeColor + '20' }]}>
              <Text style={[styles.statusText, { color: badgeColor }]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          {/* Moved: Reservation Type Selector (Now at Top) */}
          {!isComingSoon && (
            <View style={styles.typeSection}>
              <Text style={[styles.typeHeader, { color: colors.text }]}>How will you read this?</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity 
                  style={[styles.typeOption, { borderColor: colors.primary, backgroundColor: reservationType === 'take_home' ? colors.primary : 'transparent' }]}
                  onPress={() => setReservationType('take_home')}
                >
                  <Ionicons name="home-outline" size={18} color={reservationType === 'take_home' ? '#fff' : colors.primary} />
                  <Text style={[styles.typeText, { color: reservationType === 'take_home' ? '#fff' : colors.primary }]}>Take Home</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeOption, { borderColor: colors.primary, backgroundColor: reservationType === 'in_library' ? colors.primary : 'transparent' }]}
                  onPress={() => setReservationType('in_library')}
                >
                  <Ionicons name="business-outline" size={18} color={reservationType === 'in_library' ? '#fff' : colors.primary} />
                  <Text style={[styles.typeText, { color: reservationType === 'in_library' ? '#fff' : colors.primary }]}>In Library</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Year</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{book.year}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Shelf</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{book.shelf_location}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Category</Text>
              <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>{book.category}</Text>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.descriptionText, { color: colors.textMuted }]}>
              {book.description || "No description available for this book. It is a classic piece of literature that has stood the test of time."}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.favoriteBtn, { borderColor: colors.border }]}>
          <Ionicons name="heart-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.reserveBtn, 
            { backgroundColor: isComingSoon ? '#00838F' : (isAvailable ? colors.primary : colors.textMuted) }
          ]}
          disabled={!isAvailable || isReserving || isComingSoon}
          onPress={handleReserve}
        >
          {isReserving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.reserveBtnText}>
              {isComingSoon ? 'Coming Soon' : (isAvailable ? 'Reserve Book' : 'Currently Unavailable')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4, elevation: 2,
  },
  scrollContent: { paddingTop: 80, paddingBottom: 100 },
  coverContainer: {
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20, elevation: 10,
  },
  cover: { width: 220, height: 320, borderRadius: 16 },
  infoSection: { paddingHorizontal: 24, marginTop: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 4 },
  author: { fontSize: 18 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 14, fontWeight: 'bold' },
  
  // Type Section Styles
  typeSection: { marginBottom: 25 },
  typeHeader: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  typeContainer: { flexDirection: 'row', gap: 12 },
  typeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderRadius: 12, borderWidth: 1 },
  typeText: { fontWeight: 'bold', fontSize: 13 },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, gap: 12 },
  statBox: { flex: 1, padding: 12, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  statLabel: { fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: 'bold' },
  descriptionSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  descriptionText: { fontSize: 16, lineHeight: 24 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, flexDirection: 'row', borderTopWidth: 1, gap: 16 },
  favoriteBtn: { width: 56, height: 56, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  reserveBtn: { flex: 1, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  reserveBtnText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
});
