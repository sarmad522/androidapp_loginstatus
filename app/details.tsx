import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function DetailsScreen() {
  const { user } = useLocalSearchParams<{ user: string }>();
  const u = user ? JSON.parse(user as string) : {};

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>{u.name}</Text>
      <Text>Email: {u.email}</Text>
      <Text>Phone: {u.phone}</Text>
      <Text>Company: {u.company?.name}</Text>
      <Text>City: {u.address?.city}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  h1: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
});
