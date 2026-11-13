import { StyleSheet, TextInput, View } from 'react-native';

export default function SearchBar({ value, onChangeText, placeholder = 'Search donors' }) {
  return (
    <View style={styles.container}>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#8A9A93" style={styles.input} returnKeyType="search" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 14 },
  input: { color: '#173B32', fontSize: 15, paddingVertical: 13 },
});
