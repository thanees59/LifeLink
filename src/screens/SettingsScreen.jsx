import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDatabase } from '../database/database';
import { getDonors } from '../database/donorTable';
import { getDonations } from '../database/donationTable';

export default function SettingsScreen() {
  const [state, setState] = useState({ loading: true, error: false, donors: 0, donations: 0 });

  const refresh = useCallback(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true }));
    Promise.all([getDatabase(), getDonors(), getDonations()]).then(([, donors, donations]) => {
      if (active) setState({ loading: false, error: false, donors: donors.length, donations: donations.length });
    }).catch(() => { if (active) setState((current) => ({ ...current, loading: false, error: true })); });
    return () => { active = false; };
  }, []);

  useFocusEffect(refresh);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Settings & About</Text>
      <Text style={styles.subtitle}>LifeLink keeps your registry on this device.</Text>

      <View style={styles.card}>
        <Text style={styles.heading}>Local database</Text>
        <View style={styles.statusRow}><View style={[styles.dot, !state.error && !state.loading ? styles.online : styles.problem]} /><Text style={styles.status}>{state.loading ? 'Checking local storage…' : state.error ? 'Local database unavailable' : 'Local database ready'}</Text></View>
        {state.loading ? <ActivityIndicator color="#24775D" style={styles.loader} /> : state.error ? (
          <><Text style={styles.body}>LifeLink could not read its local SQLite database.</Text><Pressable onPress={refresh} style={styles.retry}><Text style={styles.retryText}>Check again</Text></Pressable></>
        ) : (
          <View style={styles.counts}><Count label="Donors" value={state.donors} /><Count label="Donations" value={state.donations} /></View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Privacy and offline use</Text>
        <Text style={styles.body}>Donor and donation records are stored in the app’s private SQLite database. LifeLink does not send them to an online service, and core registry features work without an internet connection.</Text>
        <Text style={styles.body}>Records may be lost if app data is cleared or the app is uninstalled. Export and cloud backup are not currently available.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>About LifeLink</Text>
        <Text style={styles.body}>An offline blood donor registry and donation history tool.</Text>
        <Text style={styles.disclaimer}>Availability is an administrative status only. A qualified healthcare professional must assess donation eligibility.</Text>
      </View>
    </ScrollView>
  );
}

function Count({ label, value }) {
  return <View style={styles.count}><Text style={styles.countValue}>{value}</Text><Text style={styles.countLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  page: { padding: 20, paddingBottom: 36 }, title: { color: '#173B32', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#65766F', fontSize: 14, marginTop: 5, marginBottom: 18 }, card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, marginBottom: 13 },
  heading: { color: '#173B32', fontSize: 16, fontWeight: '700', marginBottom: 12 }, statusRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 9, height: 9, borderRadius: 5, marginRight: 9 }, online: { backgroundColor: '#24775D' }, problem: { backgroundColor: '#B33E42' },
  status: { color: '#24775D', fontSize: 14, fontWeight: '700' }, loader: { marginVertical: 18 }, body: { color: '#65766F', fontSize: 14, lineHeight: 21, marginTop: 8 },
  counts: { flexDirection: 'row', marginTop: 18, gap: 12 }, count: { flex: 1, backgroundColor: '#F5F8F6', borderRadius: 12, padding: 14, alignItems: 'center' },
  countValue: { color: '#24775D', fontSize: 22, fontWeight: '800' }, countLabel: { color: '#65766F', fontSize: 12, marginTop: 3 },
  retry: { alignSelf: 'flex-start', backgroundColor: '#24775D', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginTop: 14 }, retryText: { color: '#FFFFFF', fontWeight: '700' },
  disclaimer: { color: '#65766F', fontSize: 12, lineHeight: 18, marginTop: 12 },
});
