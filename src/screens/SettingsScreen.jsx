import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDatabase } from '../database/database';
import { getDonors } from '../database/donorTable';
import { getDonations } from '../database/donationTable';
import { useAuth } from '../auth/AuthContext.jsx';

export default function SettingsScreen() {
  const { role, signOut } = useAuth();
  const [state, setState] = useState({ loading: true, error: false, donors: 0, donations: 0 });
  const [exporting, setExporting] = useState(false);

  const refresh = useCallback(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true }));
    Promise.all([getDatabase(), getDonors(), getDonations()]).then(([, donors, donations]) => {
      if (active) setState({ loading: false, error: false, donors: donors.length, donations: donations.length });
    }).catch(() => { if (active) setState((current) => ({ ...current, loading: false, error: true })); });
    return () => { active = false; };
  }, []);

  useFocusEffect(refresh);

  async function exportRecords() {
    if (role !== 'admin') return Alert.alert('Administrator access required', 'Only administrators can export personal records.');
    setExporting(true);
    try {
      const [donors, donations] = await Promise.all([getDonors(), getDonations()]);
      const rows = [
        ['Record type', 'ID', 'Donor', 'Phone', 'Blood group', 'District', 'Availability', 'Contact consent', 'Consent updated', 'Donation date', 'Location', 'Notes'],
        ...donors.map((donor) => ['Donor', donor.id, donor.name, donor.phone ?? '', donor.blood_group, donor.district, donor.availability, donor.contact_consent ? 'Yes' : 'No', donor.contact_consent_updated_at ?? '', '', '', '']),
        ...donations.map((donation) => ['Donation', donation.id, donation.donor_name, '', donation.blood_group, '', '', '', '', donation.donation_date, donation.location, donation.notes ?? '']),
      ];
      const csv = rows.map((row) => row.map(csvValue).join(',')).join('\r\n');
      if (Platform.OS === 'web') {
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'lifelink-records.csv';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        await Share.share({ title: 'LifeLink records CSV', message: csv });
      }
    } catch {
      Alert.alert('Export failed', 'LifeLink could not prepare your records. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Settings & About</Text>
      <Text style={styles.subtitle}>LifeLink keeps your registry on this device.</Text>

      <View style={styles.card}>
        <Text style={styles.heading}>Current access</Text>
        <Text style={styles.body}>Signed in as {role === 'admin' ? 'Administrator' : 'General user'} on this device. Roles and records do not sync between devices.</Text>
        <Pressable accessibilityRole="button" onPress={signOut} style={styles.signOutButton}><Text style={styles.signOutText}>Sign out / switch role</Text></Pressable>
      </View>

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
        <Text style={styles.body}>Donor and donation records are stored in the app’s local SQLite database. LifeLink does not send them to an online service, and core registry features work without an internet connection.</Text>
        <Text style={styles.body}>The local administrator password is stored as a salted hash, but the SQLite database itself is not encrypted. This access gate is not protection against someone with technical access to the device or its files.</Text>
        <Text style={styles.body}>Records may be lost if app data is cleared or the app is uninstalled. Keep exported backups in a secure place.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Export a backup</Text>
        <Text style={styles.body}>Create a CSV containing donor names, phone numbers, and donation details. On web it downloads to your device; on mobile it opens the system share sheet. The file may contain sensitive personal information.</Text>
        {role === 'admin' ? <Pressable accessibilityRole="button" disabled={state.loading || state.error || exporting} onPress={exportRecords} style={[styles.exportButton, (state.loading || state.error || exporting) && styles.disabled]}>
          <Text style={styles.exportText}>{exporting ? 'Preparing export…' : 'Export records as CSV'}</Text>
        </Pressable> : <Text style={styles.body}>CSV export is available to administrators only.</Text>}
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

function csvValue(value) {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
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
  exportButton: { alignItems: 'center', backgroundColor: '#24775D', borderRadius: 12, paddingVertical: 13, marginTop: 16 }, exportText: { color: '#FFFFFF', fontWeight: '700' }, disabled: { opacity: 0.55 },
  signOutButton: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#24775D', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10, marginTop: 14 }, signOutText: { color: '#24775D', fontWeight: '700' },
  disclaimer: { color: '#65766F', fontSize: 12, lineHeight: 18, marginTop: 12 },
});
