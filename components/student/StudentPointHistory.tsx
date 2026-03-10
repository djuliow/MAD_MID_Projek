import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '../../hooks/useUser';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';

interface StudentPointHistoryProps {
  onClose: () => void;
}

export function StudentPointHistory({ onClose }: StudentPointHistoryProps) {
  const { colors } = useTheme();
  const { user } = useUser();
  const history = useQuery(api.attendance.getUserPointHistory, { userId: user?._id as any });

  const renderItem = ({ item }: { item: any }) => {
    const isPositive = item.points > 0;
    const formattedDate = new Date(item.timestamp).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.leftInfo}>
          <View style={[styles.iconBox, { backgroundColor: (isPositive ? colors.success : colors.danger) + '20' }]}>
            <Ionicons 
              name={item.activity_type === 'attendance' ? 'calendar' : (item.activity_type === 'penalty' ? 'warning' : 'book')} 
              size={20} 
              color={isPositive ? colors.success : colors.danger} 
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.descriptionText, { color: colors.text }]} numberOfLines={1}>
              {item.description}
            </Text>
            <Text style={[styles.typeText, { color: colors.textMuted }]}>{formattedDate}</Text>
          </View>
        </View>
        <View style={styles.rightInfo}>
          <Text style={[styles.pointText, { color: isPositive ? colors.success : colors.danger }]}>
            {isPositive ? '+' : ''}{item.points}
          </Text>
          <Text style={[styles.pointLabel, { color: colors.textMuted }]}>Poin</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Point History</Text>
      </View>

      {history === undefined ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : history.length > 0 ? (
        <FlatList
          data={history}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Belum ada riwayat poin.</Text>
          <Text style={styles.emptySub}>Ayo datang ke perpus dan klaim poinmu!</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 20 
  },
  closeBtn: { marginRight: 15 },
  title: { fontSize: 22, fontWeight: 'bold' },
  listContainer: { padding: 20 },
  card: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, paddingRight: 8 },
  descriptionText: { fontSize: 14, fontWeight: 'bold' },
  dateText: { fontSize: 16, fontWeight: 'bold' },
  typeText: { fontSize: 11, marginTop: 2 },
  rightInfo: { alignItems: 'flex-end', minWidth: 65 },
  pointText: { fontSize: 18, fontWeight: 'bold' },
  pointLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginTop: 15 },
  emptySub: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 5 },
});
