// app/(tabs)/explore.tsx
import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Animated,
  Easing,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type Item = {
  id: string;
  title: string;
  subtitle: string;
};

const INIT_DATA: Item[] = [
  { id: '1', title: 'Alpha', subtitle: 'Starter pack' },
  { id: '2', title: 'Beta', subtitle: 'Pro toolkit' },
  { id: '3', title: 'Gamma', subtitle: 'Dev bundle' },
  { id: '4', title: 'Delta', subtitle: 'Design kit' },
  { id: '5', title: 'Epsilon', subtitle: 'Essentials' },
  { id: '6', title: 'Zeta', subtitle: 'Advanced set' },
];

const { width } = Dimensions.get('window');
const SPACING = 12;
const CARD_W = (width - SPACING * 3) / 2;

export default function ExploreScreen() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Item[]>(INIT_DATA);

  // subtle mount animation
  const mount = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(mount, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [mount]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(it => it.title.toLowerCase().includes(s) || it.subtitle.toLowerCase().includes(s));
  }, [q, items]);

  const renderItem = ({ item, index }: { item: Item; index: number }) => (
    <Card item={item} delay={index * 40} />
  );

  return (
    <View style={styles.screen}>
      {/* Header */}
      <LinearGradient
        colors={['#1d4ed8', '#06b6d4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSub}>Showing Listings</Text>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#93c5fd" />
        <TextInput
          placeholder="Search items..."
          placeholderTextColor="#94a3b8"
          value={q}
          onChangeText={setQ}
          style={styles.search}
        />
        <Text style={styles.count}>{filtered.length}</Text>
      </View>

      {/* Content */}
      {filtered.length === 0 ? (
        <Animated.View style={[styles.empty, { opacity: mount, transform: [{ translateY: mount.interpolate({ inputRange: [0,1], outputRange: [10,0] }) }] }]}>
          <Ionicons name="albums-outline" size={28} color="#64748b" />
          <Text style={styles.emptyText}>No results</Text>
          <Text style={styles.emptySub}>Try a different keyword</Text>
        </Animated.View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: mount, transform: [{ translateY: mount.interpolate({ inputRange: [0,1], outputRange: [10,0] }) }] }}>
          <FlatList
            data={filtered}
            keyExtractor={(it) => it.id}
            numColumns={2}
            columnWrapperStyle={{ gap: SPACING, paddingHorizontal: SPACING }}
            contentContainerStyle={{ paddingVertical: SPACING }}
            ItemSeparatorComponent={() => <View style={{ height: SPACING }} />}
            renderItem={renderItem}
          />
        </Animated.View>
      )}
    </View>
  );
}

function Card({ item, delay = 0 }: { item: Item; delay?: number }) {
  const appear = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 300,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [appear, delay]);

  const onPressIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, friction: 7, tension: 140 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7, tension: 140 }).start();

  return (
    <Animated.View
      style={[
        styles.card,
        {
          width: CARD_W,
          transform: [
            { translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
            { scale },
          ],
          opacity: appear,
        },
      ]}
    >
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut} style={{ padding: 14 }}>
        <View style={styles.badge}>
          <Ionicons name="flash-outline" size={16} color="#0f172a" />
          <Text style={styles.badgeText}>New</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSub}>{item.subtitle}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.link}>View</Text>
          <Ionicons name="chevron-forward" size={18} color="#93c5fd" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0f172a' }, // slate-900
  header: {
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 0.4 },
  headerSub: { color: '#dbeafe', marginTop: 2 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#1f2937',
    backgroundColor: '#111827',
  },
  search: {
    flex: 1,
    color: '#e5e7eb',
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  count: { color: '#9ca3af', fontWeight: '700' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  emptyText: { color: '#e5e7eb', fontWeight: '800', fontSize: 16 },
  emptySub: { color: '#94a3b8' },

  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1f2937',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 3 },
    }),
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#93c5fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  badgeText: { color: '#0f172a', fontWeight: '800', fontSize: 12 },
  cardTitle: { color: '#f3f4f6', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  cardSub: { color: '#9ca3af', fontSize: 13, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  link: { color: '#93c5fd', fontWeight: '700' },
});
