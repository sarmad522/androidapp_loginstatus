import * as React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../store';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  Dimensions,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');

export default function TabsLayout() {
  const authed = useAppSelector((s) => s.auth.isAuthenticated);
  if (!authed) return <Redirect href="/(auth)/login" />; // absolute typed route

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { display: 'none' }, // we render our own
        sceneStyle: { backgroundColor: '#0f172a' }, // slate-900
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

/** --------- Custom Floating Tab Bar (pill style + animated indicator) --------- */
function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const count = state.routes.length;
  const itemWidth = Math.min((width - 32) / count, 180);
  const indicator = React.useRef(new Animated.Value(state.index)).current;

  React.useEffect(() => {
    Animated.timing(indicator, {
      toValue: state.index,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [state.index, indicator]);

  const left = indicator.interpolate({
    inputRange: state.routes.map((_, i) => i),
    outputRange: state.routes.map((_, i) => i * itemWidth),
  });

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <View style={[styles.bar, { width: itemWidth * count }]}>
        {/* animated indicator */}
        <Animated.View
          style={[
            styles.indicator,
            {
              width: itemWidth - 8,
              transform: [
                {
                  translateX: Animated.add(left, new Animated.Value(4)),
                },
              ],
            },
          ]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const color = isFocused ? '#0f172a' : '#cbd5e1';
          const icon = options.tabBarIcon
            ? options.tabBarIcon({ color, size: 20, focused: isFocused })
            : null;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.item, { width: itemWidth }]}
              android_ripple={{ color: '#e2e8f01a', borderless: true }}
            >
              <View style={styles.itemInner}>
                {icon}
                <Text style={[styles.label, { color }]} numberOfLines={1}>
                  {options.title ?? route.name}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 22,
    alignItems: 'center',
  },
  bar: {
    backgroundColor: '#111827', // gray-900
    borderRadius: 999,
    padding: 4,
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1f2937',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 6 },
    }),
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: '#93c5fd', // blue-300
    borderRadius: 999,
  },
  item: {
    height: 48,
    justifyContent: 'center',
  },
  itemInner: {
    height: 40,
    marginHorizontal: 4,
    borderRadius: 999,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
