import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Button,
  Animated,
  Easing,
  TextInput,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import useNetworkStatus from '../../hooks/useNetworkStatus';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/authSlice';

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: { name?: string };
  address?: { city?: string };
};

export default function HomeScreen() {
  const online = useNetworkStatus();
  const dispatch = useAppDispatch();

  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const r = await fetch('https://jsonplaceholder.typicode.com/users');
      if (!r.ok) throw new Error('Failed to fetch users');
      const json = (await r.json()) as User[];
      setUsers(json);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  // Banner color animate (online/offline)
  const bannerAnim = useRef(new Animated.Value(online ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(bannerAnim, {
      toValue: online ? 1 : 0,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [online]);

  const bannerColors = bannerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#fee2e2', '#d1fae5'], // offline → online
  });

  // Filtered list (search)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, query]);

  const renderItem = ({ item, index }: { item: User; index: number }) => (
    <UserCard
      user={item}
      delay={index * 40}
      onPress={() =>
        router.push({ pathname: '/details', params: { user: JSON.stringify(item) } })
      }
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' /* slate-900 */ }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#1d4ed8', '#06b6d4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Users</Text>
        <Button title="Logout" color={Platform.OS === 'ios' ? '#fff' : undefined} onPress={() => dispatch(logout())} />
      </LinearGradient>

      {/* Online/Offline banner (animated color) */}
      <Animated.View style={[styles.banner, { backgroundColor: bannerColors }]}>
        <Text style={{ color: online ? '#065f46' : '#991b1b', fontWeight: '600' }}>
          {online ? 'Online' : 'Offline'}
        </Text>
      </Animated.View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          placeholder="Search by name or email..."
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={setQuery}
          style={styles.search}
        />
        <Text style={styles.count}>{filtered.length}</Text>
      </View>

      {/* Content */}
      {loading && (
        <View style={{ paddingTop: 32 }}>
          <ActivityIndicator />
        </View>
      )}
      {!!error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
      />
    </View>
  );
}

/** ------- Card component with subtle mount & press animations ------- */
function UserCard({ user, delay = 0, onPress }: { user: User; delay?: number; onPress: () => void }) {
  const mount = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(mount, {
      toValue: 1,
      duration: 320,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true, // opacity + translateY are both supported on native driver
    }).start();
  }, [delay, mount]);

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, friction: 6, tension: 120 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 120 }).start();

  const translateY = mount.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  const initials = (user.name || '')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Animated.View
      style={[
        styles.card,
        {
          // ⬇️ opacity is top-level
          opacity: mount,
          // ⬇️ only transforms inside transform
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        <View style={styles.avatar}>
          <Text style={{ color: '#0f172a', fontWeight: '800' }}>{initials || '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  banner: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  search: {
    flex: 1,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
    color: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  count: { color: '#9ca3af', fontWeight: '600' },

  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginVertical: 6,
    // shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    // elevation for Android
    elevation: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1f2937',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#93c5fd', // soft blue
  },
  name: { color: '#f3f4f6', fontSize: 16, fontWeight: '700', marginBottom: 2 },
  email: { color: '#9ca3af', fontSize: 13 },
  chev: { color: '#94a3b8', fontSize: 22, paddingHorizontal: 6, fontWeight: '300' },
  error: { color: '#fecaca', backgroundColor: '#7f1d1d', padding: 8, margin: 12, borderRadius: 10 },
});
