import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { login } from '../../store/authSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import { Redirect } from 'expo-router';

export default function LoginScreen() {
  const authed = useAppSelector(s => s.auth.isAuthenticated);
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPass, setShowPass] = useState(false);

  // mount animation
  const mount = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(mount, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [mount]);

  // shake animation on validation error
  const shake = useRef(new Animated.Value(0)).current;
  const runShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };
  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-10, 10] });

  // button press animation
  const btnScale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(btnScale, { toValue: 0.98, useNativeDriver: true, friction: 7, tension: 140 }).start();
  const onPressOut = () =>
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, friction: 7, tension: 140 }).start();

  // validate
  const validate = () => {
    const e: typeof errors = {};
    let ok = true;
    if (!email.includes('@')) { e.email = 'Enter a valid email'; ok = false; }
    if (!password || password.length < 6) { e.password = 'Min 6 characters'; ok = false; }
    setErrors(e);
    if (!ok) runShake();
    return ok;
  };

  const onLogin = () => {
    if (!validate()) return;
    dispatch(login({ email }));
  };

  if (authed) return <Redirect href="/(tabs)" />;

  const translateY = mount.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  const opacity = mount;

  return (
    <View style={styles.screen}>
      {/* Gradient header */}
      <LinearGradient
        colors={['#1d4ed8', '#06b6d4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Welcome back</Text>
        <Text style={styles.headerSub}>Sign in to continue</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={{ flex: 1 }}
      >
        <Animated.View
          style={[
            styles.card,
            { transform: [{ translateY }], opacity },
          ]}
        >
          {/* Email */}
          <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              icon={<Ionicons name="mail-outline" size={18} color="#93c5fd" />}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
          </Animated.View>

          {/* Password */}
          <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              icon={<Ionicons name="lock-closed-outline" size={18} color="#93c5fd" />}
              placeholder="••••••••"
              secureTextEntry={!showPass}
              rightIcon={
                <Pressable onPress={() => setShowPass(v => !v)} hitSlop={12}>
                  <Ionicons
                    name={showPass ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#cbd5e1"
                  />
                </Pressable>
              }
              error={errors.password}
            />
          </Animated.View>

          {/* Login Button */}
          <Animated.View style={{ transform: [{ scale: btnScale }], marginTop: 6 }}>
            <Pressable
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={onLogin}
              style={({ pressed }) => [
                styles.button,
                pressed && { opacity: 0.95 },
              ]}
            >
              <LinearGradient
                colors={['#60a5fa', '#34d399']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                <Ionicons name="log-in-outline" size={18} color="#0f172a" />
                <Text style={styles.btnText}>Login</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

/** ------- Reusable Field with label, icon, focus ring & error text ------- */
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  rightIcon,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  const ring = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(ring, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused, ring]);

  const borderColor = ring.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1f2937', '#60a5fa'],
  });
  const bg = focused ? '#0b1220' : '#0b1220';

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.inputWrap, { borderColor, backgroundColor: bg }]}>
        {icon && <View style={styles.leftIcon}>{icon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={styles.input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </Animated.View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
  },
  header: {
    paddingTop: 64,
    paddingBottom: 22,
    paddingHorizontal: 18,
    justifyContent: 'flex-end',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  headerSub: {
    color: '#dbeafe',
    marginTop: 4,
  },
  card: {
    margin: 16,
    backgroundColor: '#111827', // gray-900
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1f2937',
    transform: [{ translateY: 0 }],
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 4 },
    }),
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 6,
    marginLeft: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.25,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    color: '#e5e7eb',
    fontSize: 15,
    paddingVertical: 2,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  error: {
    color: '#fecaca',
    backgroundColor: '#7f1d1d',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  btnGradient: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnText: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
