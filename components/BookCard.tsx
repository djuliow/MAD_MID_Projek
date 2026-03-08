import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Book } from '../constants/data';
import useTheme from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface BookCardProps {
  book: Book;
  horizontal?: boolean;
}

export default function BookCard({ book, horizontal = false }: BookCardProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/book-detail/[id]',
      params: { id: book.id }
    });
  };

  if (horizontal) {
    return (
      <TouchableOpacity 
        style={[styles.horizontalCard, { backgroundColor: colors.surface }]}
        onPress={handlePress}
      >
        <Image 
          source={{ uri: book.cover }} 
          style={styles.horizontalCover} 
          contentFit="cover"
        />
        <View style={styles.horizontalInfo}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{book.title}</Text>
          <Text style={[styles.author, { color: colors.textMuted }]}>{book.author}</Text>
          <View style={[styles.statusBadge, { backgroundColor: book.status === 'Available' ? colors.success + '20' : colors.danger + '20' }]}>
            <Text style={[styles.statusText, { color: book.status === 'Available' ? colors.success : colors.danger }]}>
              {book.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.verticalCard, { backgroundColor: colors.surface }]}
      onPress={handlePress}
    >
      <Image 
        source={{ uri: book.cover }} 
        style={styles.verticalCover} 
        contentFit="cover"
      />
      <View style={styles.verticalInfo}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{book.title}</Text>
        <Text style={[styles.author, { color: colors.textMuted }]} numberOfLines={1}>{book.author}</Text>
        <View style={styles.cardFooter}>
          <Text style={[styles.statusMini, { color: book.status === 'Available' ? colors.success : colors.danger }]}>
            {book.status}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  verticalCard: {
    width: 150,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verticalCover: {
    width: '100%',
    height: 200,
  },
  verticalInfo: {
    padding: 12,
  },
  horizontalCard: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 120,
  },
  horizontalCover: {
    width: 90,
    height: '100%',
  },
  horizontalInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusMini: {
    fontSize: 12,
    fontWeight: '600',
  },
});
