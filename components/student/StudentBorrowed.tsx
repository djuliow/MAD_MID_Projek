import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { BORROWED_BOOKS } from '../../constants/data';
import { Image } from 'expo-image';

export function StudentBorrowed() {
  const { colors } = useTheme();

  const isDueSoon = (dueDate: string) => {
    const today = new Date('2026-03-08'); 
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Borrowed Books</Text>
      </View>

      <FlatList
        data={BORROWED_BOOKS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const dueSoon = isDueSoon(item.dueDate);
          return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: dueSoon ? colors.warning : colors.border }]}>
              <Image source={{ uri: item.cover }} style={styles.cover} contentFit="cover" />
              <View style={styles.info}>
                <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                
                <View style={styles.datesRow}>
                  <View>
                    <Text style={[styles.dateLabel, { color: colors.textMuted }]}>Borrowed</Text>
                    <Text style={[styles.dateText, { color: colors.text }]}>{item.borrowDate}</Text>
                  </View>
                  <View>
                    <Text style={[styles.dateLabel, { color: colors.textMuted }]}>Due Date</Text>
                    <Text style={[styles.dateText, { color: dueSoon ? colors.danger : colors.text, fontWeight: dueSoon ? 'bold' : 'normal' }]}>{item.dueDate}</Text>
                  </View>
                </View>

                {dueSoon && (
                  <View style={[styles.warningContainer, { backgroundColor: colors.warning + '15' }]}>
                    <Ionicons name="alert-circle-outline" size={16} color={colors.warning} />
                    <Text style={[styles.warningText, { color: colors.warning }]}>Return soon!</Text>
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 20, paddingVertical: 16 },
  card: { flexDirection: 'row', borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, elevation: 2 },
  cover: { width: 100, height: 150 },
  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  bookTitle: { fontSize: 16, fontWeight: 'bold' },
  datesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dateLabel: { fontSize: 10, textTransform: 'uppercase', marginBottom: 2 },
  dateText: { fontSize: 13 },
  warningContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  warningText: { fontSize: 12, fontWeight: '600' },
});
