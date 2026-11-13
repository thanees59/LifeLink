import { useEffect, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import AppNavigation from './src/navigation/AppNavigation.jsx';
import { getDatabase } from './src/database/database';
import { createAdminCredential, getAdminCredential, verifyAdminCredential } from './src/database/authTable';
import AuthScreen from './src/screens/AuthScreen.jsx';
import { AuthProvider } from './src/auth/AuthContext.jsx';
import { clearActiveRole, setActiveRole } from './src/auth/session';

export default function App() {
  const [auth, setAuth] = useState({ loading: true, error: false, configured: false, role: null });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([getDatabase(), getAdminCredential()]).then(([, credential]) => {
      if (active) setAuth({ loading: false, error: false, configured: Boolean(credential), role: null });
    }).catch((error) => {
      console.error('LifeLink database initialization failed:', error);
      if (active) setAuth((current) => ({ ...current, loading: false, error: true }));
    });
    return () => { active = false; };
  }, [retryCount]);

  function signIn(role) {
    setActiveRole(role);
    setAuth((current) => ({ ...current, role }));
  }

  function signOut() {
    clearActiveRole();
    setAuth((current) => ({ ...current, role: null }));
  }

  async function setupAdmin(password) {
    await createAdminCredential(password);
    setAuth((current) => ({ ...current, configured: true }));
    signIn('admin');
  }

  async function signInAdmin(password) {
    const valid = await verifyAdminCredential(password);
    if (valid) signIn('admin');
    return valid;
  }

  return (
    <AuthProvider value={{ role: auth.role, signOut }}>
      <StatusBar barStyle="dark-content" />
      {auth.loading ? <View style={styles.state}><Text style={styles.stateText}>Loading LifeLink…</Text></View> : auth.error ? (
        <View style={styles.state}><Text style={styles.stateText}>LifeLink could not open its local database.</Text><Pressable onPress={() => { setAuth((current) => ({ ...current, loading: true, error: false })); setRetryCount((current) => current + 1); }}><Text style={styles.retry}>Try again</Text></Pressable></View>
      ) : auth.role ? <AppNavigation /> : <AuthScreen configured={auth.configured} onSetupAdmin={setupAdmin} onAdminSignIn={signInAdmin} onContinueGeneral={() => signIn('general')} />}
    </AuthProvider>
  );
}

const styles = StyleSheet.create({ state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#F5F8F6' }, stateText: { color: '#173B32', fontSize: 15, textAlign: 'center' }, retry: { color: '#24775D', fontWeight: '700', marginTop: 14 } });
