import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { login } from '../../store/authSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import { Redirect } from 'expo-router';

export default function LoginScreen() {
  const authed = useAppSelector(s => s.auth.isAuthenticated);
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  if (authed) return <Redirect href="/(tabs)" />;

  const validate = () => {
    const e: typeof errors = {};
    let ok = true;
    if (!email.includes('@')) { e.email = 'Enter a valid email'; ok = false; }
    if (!password || password.length < 6) { e.password = 'Min 6 characters'; ok = false; }
    setErrors(e);
    return ok;
  };

  const onLogin = () => {
    if (!validate()) return;
    dispatch(login({ email }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      {!!errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {!!errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <Button title="Login" onPress={onLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 8 },
  error: { color: '#b91c1c', marginBottom: 8 },
});
