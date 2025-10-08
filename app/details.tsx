import React, { useEffect, useMemo, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

type User = {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  company?: { name?: string };
  address?: { city?: string; street?: string };
};

export default function DetailsScreen() {
  const { user } = useLocalSearchParams<{ user: string }>();
  const u: User = user ? JSON.parse(user as string) : {};

  // Mount animation
  const mount = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(mount, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [mount]);

  const translateY = mount.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  // Avatar initials
  const initials = useMemo(() => {
    const n = (u.name || '').trim();
    if (!n) return '?';
    return n
      .split(' ')
      .map((s) => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [u?.name]);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <LinearGradient
        colors={['#1d4ed8', '#06b6d4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>User Details</Text>
      </LinearGradient>

      {/* Card */}
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ translateY }],
            opacity: mount,
          },
        ]}
      >
        {/* Avatar + Name */}
        <View style={styles.rowTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{u.name || 'Unknown'}</Text>
            <Text style={styles.subtle}>ID: {u.id ?? '—'}</Text>
          </View>
        </View>

        {/* Info items */}
        <InfoItem
          icon={<Ionicons name="mail-outline" size={20} color="#93c5fd" />}
          label="Email"
          value={u.email || '—'}
        />
        <InfoItem
          icon={<Ionicons name="call-outline" size={20} color="#93c5fd" />}
          label="Phone"
          value={u.phone || '—'}
        />
        <InfoItem
          icon={<MaterialIcons name="apartment" size={20} color="#93c5fd" />}
          label="Company"
          value={u.company?.name || '—'}
        />
        <InfoItem
          icon={<Ionicons name="location-outline" size={20} color="#93c5fd" />}
          label="City"
          value={u.address?.city || '—'}
          last
        />
      </Animated.View>
    </View>
  );
}

function InfoItem({
  icon,
  label,
  value,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, last && { borderBottomWidth: 0, paddingBottom: 0 }]}>
      <View style={styles.iconWrap}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
  },
  header: {
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  card: {
    backgroundColor: '#111827', // gray-900
    margin: 16,
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1f2937',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 4 },
    }),
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 999,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#93c5fd', // blue-300
  },
  avatarText: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 18,
  },
  name: {
    color: '#f3f4f6',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtle: {
    color: '#94a3b8',
    fontSize: 12,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#1f2937',
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  infoLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
  },
});
