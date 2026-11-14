import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getPendingDonorSignups, linkDonorSignup } from '../database/authTable';
import { getDonors } from '../database/donorTable';
import { useThemedStyles } from '../theme/ThemeContext.jsx';

export default function DonorSignupRequestsScreen() {
  const styles = useThemedStyles(baseStyles);
  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const availableDonors = donors.filter((donor) => !donor.has_login);

  const refresh = useCallback(() => {
    let active = true;
    setLoading(true);
    Promise.all([getPendingDonorSignups(), getDonors()]).then(([pending, profiles]) => {
      if (active) { setRequests(pending); setDonors(profiles); setLoadError(false); }
    }).catch(() => { if (active) setLoadError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useFocusEffect(refresh);

  function confirmLink(request, donor) {
    Alert.alert('Link donor account?', `Link ${request.username} to ${donor.name}'s profile?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Link account', onPress: async () => {
        try {
          await linkDonorSignup(request.id, donor.id);
          setRequests((current) => current.filter((item) => item.id !== request.id));
          setExpandedId(null);
        } catch (error) {
          Alert.alert('Unable to link account', String(error?.message ?? 'Please try again.'));
        }
      } },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Pending Registrations</Text>
      <Text style={styles.subtitle}>Review and link donor requests submitted before immediate registration was added.</Text>
      {loading ? <ActivityIndicator color="#24775D" style={styles.loader} /> : loadError ? <Text style={styles.empty}>Could not load requests. Return to this screen to try again.</Text> : requests.length === 0 ? (
        <View style={styles.card}><Text style={styles.emptyTitle}>No older requests</Text><Text style={styles.empty}>New donor registrations can log in immediately.</Text></View>
      ) : requests.map((request) => (
        <View key={request.id} style={styles.card}>
          <Text style={styles.name}>{request.name}</Text>
          <Text style={styles.meta}>Username: {request.username}</Text>
          <Text style={styles.meta}>Mobile: {request.phone}</Text>
          <Text style={styles.meta}>Email: {request.email}</Text>
          <Pressable onPress={() => setExpandedId((current) => current === request.id ? null : request.id)} style={styles.button}>
            <Text style={styles.buttonText}>{expandedId === request.id ? 'Hide donor profiles' : 'Review and link profile'}</Text>
          </Pressable>
          {expandedId === request.id ? <View style={styles.profileList}>
            {availableDonors.length === 0 ? <Text style={styles.empty}>No unlinked donor profiles are available. Create a donor profile first, or check whether these donors already have accounts.</Text> : availableDonors.map((donor) => (
              <Pressable key={donor.id} onPress={() => confirmLink(request, donor)} style={styles.profile}>
                <Text style={styles.profileName}>{donor.name}</Text>
                <Text style={styles.meta}>{donor.blood_group} · {donor.district}{donor.phone ? ` · ${donor.phone}` : ''}</Text>
                <Text style={styles.link}>Link this profile</Text>
              </Pressable>
            ))}
          </View> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const baseStyles = StyleSheet.create({
  page: { padding: 20, paddingBottom: 36 }, title: { color: '#173B32', fontSize: 23, fontWeight: '800' },
  subtitle: { color: '#65766F', fontSize: 14, lineHeight: 21, marginTop: 5, marginBottom: 16 },
  loader: { marginTop: 48 }, card: { backgroundColor: '#FFFFFF', borderRadius: 17, padding: 16, marginBottom: 12 },
  name: { color: '#173B32', fontSize: 16, fontWeight: '800' }, meta: { color: '#65766F', fontSize: 13, marginTop: 5 },
  button: { alignItems: 'center', backgroundColor: '#24775D', borderRadius: 11, padding: 12, marginTop: 14 },
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' }, profileList: { marginTop: 12, gap: 8 },
  profile: { borderWidth: 1, borderColor: '#DCE6E0', borderRadius: 12, padding: 12 }, profileName: { color: '#173B32', fontSize: 14, fontWeight: '700' },
  link: { color: '#24775D', fontSize: 12, fontWeight: '700', marginTop: 7 }, emptyTitle: { color: '#173B32', fontSize: 15, fontWeight: '700' },
  empty: { color: '#65766F', fontSize: 13, lineHeight: 19, marginTop: 8 },
});
