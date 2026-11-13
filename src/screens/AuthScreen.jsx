import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function AuthScreen({ configured, onSetupAdmin, onAdminSignIn, onContinueGeneral }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError('');
    if (password.length < 8) return setError('Use a password with at least 8 characters.');
    if (!configured && password !== confirmation) return setError('The passwords do not match.');
    setBusy(true);
    try {
      const accepted = configured ? await onAdminSignIn(password) : await onSetupAdmin(password);
      if (configured && !accepted) setError('Incorrect administrator password.');
    } catch {
      setError('Could not save or verify the administrator password. Please try again.');
    } finally {
      setBusy(false);
      setPassword('');
      setConfirmation('');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.eyebrow}>LIFELINK · OFFLINE REGISTRY</Text>
        <Text style={styles.title}>{configured ? 'Welcome back' : 'Set up LifeLink'}</Text>
        <Text style={styles.body}>{configured ? 'Sign in as an administrator or continue with general-user access.' : 'Create the local administrator account for this device. General users can continue after setup.'}</Text>
        <Text style={styles.label}>{configured ? 'Administrator password' : 'Create administrator password'}</Text>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} style={styles.input} placeholder="At least 8 characters" placeholderTextColor="#8A9A93" />
        {!configured ? <>
          <Text style={styles.label}>Confirm password</Text>
          <TextInput value={confirmation} onChangeText={setConfirmation} secureTextEntry autoCapitalize="none" autoCorrect={false} style={styles.input} placeholder="Re-enter password" placeholderTextColor="#8A9A93" />
        </> : null}
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Pressable disabled={busy} onPress={submit} style={[styles.primary, busy && styles.disabled]}>
          {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>{configured ? 'Administrator sign in' : 'Create administrator account'}</Text>}
        </Pressable>
        {configured ? <Pressable onPress={onContinueGeneral} style={styles.secondary}><Text style={styles.secondaryText}>Continue as general user</Text></Pressable> : null}
        <Text style={styles.securityNote}>This is an on-device access gate. The local SQLite database is not encrypted, and accounts do not sync to other devices.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, justifyContent: 'center', padding: 22, backgroundColor: '#F5F8F6' }, card: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 22 },
  eyebrow: { color: '#24775D', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 12 }, title: { color: '#173B32', fontSize: 25, fontWeight: '800' },
  body: { color: '#65766F', fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 22 }, label: { color: '#173B32', fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#F5F8F6', borderWidth: 1, borderColor: '#DCE6E0', borderRadius: 12, color: '#173B32', paddingHorizontal: 14, paddingVertical: 13, fontSize: 15 },
  error: { color: '#B33E42', fontSize: 13, marginTop: 10 }, primary: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#24775D', borderRadius: 13, padding: 14, marginTop: 18 },
  primaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 }, secondary: { alignItems: 'center', borderWidth: 1, borderColor: '#24775D', borderRadius: 13, padding: 13, marginTop: 10 },
  secondaryText: { color: '#24775D', fontWeight: '700', fontSize: 14 }, disabled: { opacity: 0.6 }, securityNote: { color: '#65766F', fontSize: 11, lineHeight: 16, marginTop: 18 },
});
