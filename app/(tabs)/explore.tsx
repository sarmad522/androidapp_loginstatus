// app/(tabs)/explore.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Explore</Text>
      <Text>Yahan apni listing / cards / API data dikhana hai.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  h1: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
});
