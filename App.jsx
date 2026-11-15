import { useEffect, useState } from 'react';
import { Pressable, StatusBar, Text, View } from 'react-native';
import AppNavigation from './src/navigation/AppNavigation.jsx';
import { getDatabase } from './src/database/database';
import { createAdminCredential, createDonorSignup, getAdminCredential, resetDonorPasswordOffline, validateDonorSignupEligibility, verifyAdminCredential, verifyDonorCredential } from './src/database/authTable';
import AuthScreen from './src/screens/AuthScreen.jsx';
import DonorSignupScreen from './src/screens/DonorSignupScreen.jsx';
import { AuthProvider } from './src/auth/AuthContext.jsx';
import { clearActiveRole, setActiveRole } from './src/auth/session';
import { ThemeProvider, useTheme, useThemedStyles } from './src/theme/ThemeContext.jsx';

export default function App() {
  return <ThemeProvider><AppContent /></ThemeProvider>;
}

function AppContent() {
  const { mode } = useTheme();
  const styles = useThemedStyles(appStyles);
  const [auth, setAuth] = useState({ loading: true, error: false, configured: false, role: null, donorId: null });
  const [retryCount, setRetryCount] = useState(0);
  const [showDonorSignup, setShowDonorSignup] = useState(false);
  const [returnToDonorLogin, setReturnToDonorLogin] = useState(false);

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

  function signIn(role, donorId = null) {
    setActiveRole(role, donorId);
    setShowDonorSignup(false);
    setReturnToDonorLogin(false);
    setAuth((current) => ({ ...current, role, donorId }));
  }

  function signOut() {
    clearActiveRole();
    setAuth((current) => ({ ...current, role: null, donorId: null }));
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

  async function signInDonor(username, password) {
    const donorId = await verifyDonorCredential(username, password);
    if (donorId != null) signIn('general', donorId);
    return donorId != null;
  }

  return (
    <AuthProvider value={{ role: auth.role, donorId: auth.donorId, signOut }}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      {auth.loading ? <View style={styles.state}><Text style={styles.stateText}>Loading LifeLink…</Text></View> : auth.error ? (
        <View style={styles.state}><Text style={styles.stateText}>LifeLink could not open its local database.</Text><Pressable onPress={() => { setAuth((current) => ({ ...current, loading: true, error: false })); setRetryCount((current) => current + 1); }}><Text style={styles.retry}>Try again</Text></Pressable></View>
      ) : auth.role ? <AppNavigation /> : showDonorSignup ? <DonorSignupScreen onBack={() => { setShowDonorSignup(false); setReturnToDonorLogin(true); }} onSubmit={createDonorSignup} onValidateEligibility={validateDonorSignupEligibility} /> : <AuthScreen configured={auth.configured} onSetupAdmin={setupAdmin} onAdminSignIn={signInAdmin} onDonorSignIn={signInDonor} onResetDonorPassword={resetDonorPasswordOffline} onOpenSignup={() => setShowDonorSignup(true)} initialScreen={returnToDonorLogin ? 'donor' : 'home'} />}
    </AuthProvider>
  );
}

const appStyles = { state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#F5F8F6' }, stateText: { color: '#173B32', fontSize: 15, textAlign: 'center' }, retry: { color: '#24775D', fontWeight: '700', marginTop: 14 } };
