import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  Pressable, RefreshControl, StyleSheet, Button
} from 'react-native';
import { router } from 'expo-router';
import useNetworkStatus from '../../hooks/useNetworkStatus';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/authSlice';

export default function HomeScreen() {
  const online = useNetworkStatus();
  const dispatch = useAppDispatch();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const r = await fetch('https://jsonplaceholder.typicode.com/users');
      if (!r.ok) throw new Error('Failed to fetch users');
      const json = await r.json();
      setUsers(json);
    } catch (e: any) {
      setError(e.message);
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

  const handleLogout = () => { dispatch(logout()); };

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.banner, { backgroundColor: online ? '#d1fae5' : '#fee2e2' }]}>
        <Text style={{ color: online ? '#065f46' : '#991b1b' }}>{online ? 'Online' : 'Offline'}</Text>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.title}>Users</Text>
        <Button title="Logout" onPress={handleLogout} />
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: './details', params: { user: JSON.stringify(item) } })}
            style={styles.row}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { padding: 8, alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', paddingHorizontal: 16, paddingVertical: 8 },
  title: { fontSize: 20, fontWeight: '600' },
  row: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' },
  name: { fontSize: 16, fontWeight: '600' },
  email: { color: '#555' },
  error: { color: '#b91c1c', paddingHorizontal: 16, paddingVertical: 8 },
});
