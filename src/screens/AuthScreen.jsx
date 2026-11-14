import { useTheme, useThemedStyles } from "../theme/ThemeContext.jsx";
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export default function AuthScreen({ configured, onSetupAdmin, onAdminSignIn, onDonorSignIn, onOpenSignup, initialScreen = 'home' }) {
  const { mode } = useTheme();
  const styles = useThemedStyles(baseStyles);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [screen, setScreen] = useState(initialScreen);
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (screen === 'home') return;
    const isAdmin = screen === 'admin';
    setError('');
    if (isAdmin && password.length < 8) return setError('Use a password with at least 8 characters.');
    if (isAdmin && !configured && password !== confirmation) return setError('The passwords do not match.');
    if (!isAdmin && (!username.trim() || !password)) return setError('Enter your username and password.');
    setBusy(true);
    try {
      const accepted = isAdmin ? configured ? await onAdminSignIn(password) : await onSetupAdmin(password) : await onDonorSignIn(username, password);
      if (isAdmin && configured && !accepted) setError('Incorrect administrator password.');
      if (!isAdmin && !accepted) setError('Incorrect username or password.');
    } catch {
      setError(isAdmin ? 'Could not save or verify the administrator password. Please try again.' : 'Could not verify the donor sign-in. Please try again.');
    } finally {
      setBusy(false);
      setPassword('');
      setConfirmation('');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        {screen === 'home' ? <View style={[styles.logoFrame, mode === 'dark' && styles.darkLogoFrame]}><Image source={mode === 'dark' ? require('../../assets/images/Dark Theme Logo.png') : require('../../assets/images/LifeLink Blood Donation Logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="LifeLink blood donation logo" /></View> : null}
        <Text style={styles.eyebrow}>LIFELINK · OFFLINE REGISTRY</Text>
        {screen === 'home' ? <>
          <Text style={styles.title}>Welcome to LifeLink</Text>
          <Text style={styles.body}>Choose how you want to sign in.</Text>
          <Pressable onPress={() => { setScreen('admin'); setError(''); }} style={styles.primary}><Text style={styles.primaryText}>Admin Login</Text></Pressable>
          <Pressable onPress={() => { setScreen('donor'); setError(''); }} style={styles.secondary}><Text style={styles.secondaryText}>Donor Login</Text></Pressable>
        </> : <>
          <Pressable onPress={() => { setScreen('home'); setError(''); setPassword(''); setUsername(''); }} style={styles.back}><Text style={styles.backText}>‹ Back</Text></Pressable>
          <Text style={styles.title}>{screen === 'admin' ? configured ? 'Admin Login' : 'Set Up Administrator' : 'Donor Login'}</Text>
          <Text style={styles.body}>{screen === 'admin' ? configured ? 'Enter the administrator password for this device.' : 'Create the administrator password for this device.' : 'Login to access your registered donor profile.'}</Text>
          {screen === 'donor' ? <>
            <Text style={styles.label}>Username</Text>
            <TextInput value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} style={styles.input} placeholder="Enter your username." placeholderTextColor="#8A9A93" />
          </> : null}
          <Text style={styles.label}>{screen === 'admin' ? configured ? 'Administrator password' : 'Create administrator password' : 'Password'}</Text>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} style={styles.input} placeholder={screen === 'admin' && !configured ? 'At least 8 characters' : screen === 'donor' ? 'Enter your password.' : 'Password'} placeholderTextColor="#8A9A93" />
          {screen === 'admin' && !configured ? <>
            <Text style={styles.label}>Confirm password</Text>
            <TextInput value={confirmation} onChangeText={setConfirmation} secureTextEntry autoCapitalize="none" autoCorrect={false} style={styles.input} placeholder="Re-enter password" placeholderTextColor="#8A9A93" />
          </> : null}
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Pressable disabled={busy} onPress={submit} style={[styles.primary, busy && styles.disabled]}>
            {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>{screen === 'admin' ? configured ? 'Admin Login' : 'Create Admin Password' : 'Login'}</Text>}
          </Pressable>
          {screen === 'donor' ? <>
            <Pressable onPress={onOpenSignup} style={styles.secondary}><Text style={styles.secondaryText}>Donor Registration</Text></Pressable>
            <Pressable onPress={() => Alert.alert('Forgot Password', 'LifeLink is offline and cannot send a reset code. Contact the administrator to verify your identity and set a new password in Donor Registry > your profile > Edit Donor > Donor sign-in.')} style={styles.forgot}><Text style={styles.forgotText}>Forgot Password</Text></Pressable>
          </> : null}
        </>}
        <Text style={styles.securityNote}>This is an on-device access gate. The local SQLite database is not encrypted, and accounts do not sync to other devices.</Text>
      </View>
    </ScrollView>
  );
}

const baseStyles = {
  page: { flexGrow: 1, justifyContent: 'center', padding: 22, backgroundColor: '#F5F8F6' }, card: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 22 },
  logoFrame: { alignSelf: 'center', width: 150, height: 150, borderRadius: 24, backgroundColor: '#FFFFFF', padding: 7, marginBottom: 14 }, logo: { width: '100%', height: '100%' },
  darkLogoFrame: { backgroundColor: '#101820' },
  eyebrow: { color: '#24775D', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 12 }, title: { color: '#173B32', fontSize: 25, fontWeight: '800' },
  body: { color: '#65766F', fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 22 }, label: { color: '#173B32', fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#F5F8F6', borderWidth: 1, borderColor: '#DCE6E0', borderRadius: 12, color: '#173B32', paddingHorizontal: 14, paddingVertical: 13, fontSize: 15 },
  error: { color: '#B33E42', fontSize: 13, marginTop: 10 }, primary: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#24775D', borderRadius: 13, padding: 14, marginTop: 18 },
  primaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 }, secondary: { alignItems: 'center', borderWidth: 1, borderColor: '#24775D', borderRadius: 13, padding: 13, marginTop: 10 },
  back: { alignSelf: 'flex-start', marginBottom: 14, paddingVertical: 4 }, backText: { color: '#24775D', fontSize: 14, fontWeight: '700' },
  forgot: { alignSelf: 'center', paddingVertical: 12 }, forgotText: { color: '#24775D', fontSize: 13, fontWeight: '700' },
  secondaryText: { color: '#24775D', fontWeight: '700', fontSize: 14 }, disabled: { opacity: 0.6 }, securityNote: { color: '#65766F', fontSize: 11, lineHeight: 16, marginTop: 18 },
};
