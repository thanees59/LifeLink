import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDonors } from '../database/donorTable';
import { getDonations } from '../database/donationTable';
import { useAuth } from '../auth/AuthContext.jsx';

const actions = [
  { title: 'Donor Registry', detail: 'Browse and find donors', screen: 'DonorRegistry', icon: '◎' },
  { title: 'Add a Donor', detail: 'Register a donor locally', screen: 'AddDonor', icon: '+' },
  { title: 'Donation History', detail: 'Review recorded donations', screen: 'DonationHistory', icon: '↗' },
  { title: 'Add Donation', detail: 'Record a donation event', screen: 'AddDonation', icon: '♥' },
  { title: 'Settings & About', detail: 'App and local data details', screen: 'Settings', icon: '⚙' },
];

export default function DashboardScreen({ navigation }) {
  const { role } = useAuth();
  const [stats, setStats] = useState({ donors: 0, available: 0, donations: 0, latest: null });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    Promise.all([getDonors(), getDonations()]).then(([donors, donations]) => {
      if (active) {
        setStats({ donors: donors.length, available: donors.filter((donor) => donor.availability === 'Available').length, donations: donations.length, latest: donations[0] ?? null });
        setLoadError(false);
      }
    }).catch(() => { if (active) setLoadError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>OFFLINE BLOOD DONOR REGISTRY</Text>
        <Text style={styles.roleLabel}>{role === 'admin' ? 'Administrator access' : 'General user access'}</Text>
        <Text style={styles.heading}>Every donor{"\n"}can make a difference.</Text>
        <Text style={styles.body}>A simple, private place to manage donor details and donation history on this device.</Text>
        <View style={styles.statusPill}><View style={styles.dot} /><Text style={styles.statusText}>Designed to work offline</Text></View>
      </View>

      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Your overview</Text><Text style={styles.sectionHint}>Live totals from this device</Text></View>
      {loading ? <ActivityIndicator color="#24775D" style={styles.loader} /> : loadError ? (
        <View style={styles.statCard}><Text style={styles.error}>Could not read local records. Open Settings to check database access.</Text></View>
      ) : (
        <View style={styles.statsRow}>
          <Stat label="Donors" value={stats.donors} />
          <Stat label="Available" value={stats.available} />
          <Stat label="Donations" value={stats.donations} />
        </View>
      )}

      {stats.latest && !loading && !loadError ? (
        <Pressable style={styles.latestCard} onPress={() => navigation.navigate('DonationHistory')}>
          <Text style={styles.latestLabel}>LATEST DONATION</Text>
          <Text style={styles.latestName}>{stats.latest.donor_name} · {stats.latest.blood_group}</Text>
          <Text style={styles.latestMeta}>{stats.latest.donation_date} · {stats.latest.location}</Text>
        </Pressable>
      ) : null}

      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Your workspace</Text><Text style={styles.sectionHint}>Choose where to start</Text></View>
      {actions.filter((action) => role === 'admin' || !['AddDonor', 'AddDonation'].includes(action.screen)).map((action) => (
        <Pressable key={action.screen} style={({ pressed }) => [styles.action, pressed && styles.pressed]} onPress={() => navigation.navigate(action.screen)}>
          <View style={styles.actionIcon}><Text style={styles.actionIconText}>{action.icon}</Text></View>
          <View style={styles.actionCopy}><Text style={styles.actionTitle}>{action.title}</Text><Text style={styles.actionDetail}>{action.detail}</Text></View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
      <Text style={styles.note}>Availability is an administrative record. Donation eligibility is assessed by healthcare professionals.</Text>
    </ScrollView>
  );
}

function Stat({ label, value }) {
  return <View style={styles.statCard}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  page: { padding: 20, paddingBottom: 36 }, hero: { backgroundColor: '#173B32', borderRadius: 24, padding: 23, marginBottom: 24 },
  eyebrow: { color: '#B8DFCB', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 14 }, heading: { color: '#FFFFFF', fontSize: 29, fontWeight: '800', lineHeight: 35, marginBottom: 10 },
  roleLabel: { alignSelf: 'flex-start', color: '#FFFFFF', backgroundColor: '#285447', overflow: 'hidden', borderRadius: 11, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11, fontWeight: '700', marginBottom: 12 },
  body: { color: '#D3E2DB', fontSize: 14, lineHeight: 21 }, statusPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#285447', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginTop: 18 },
  dot: { backgroundColor: '#82D2A6', width: 7, height: 7, borderRadius: 4, marginRight: 8 }, statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  sectionHeader: { marginBottom: 12 }, sectionTitle: { color: '#173B32', fontSize: 19, fontWeight: '800' }, sectionHint: { color: '#65766F', fontSize: 13, marginTop: 3 },
  statsRow: { flexDirection: 'row', gap: 9, marginBottom: 14 }, statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, alignItems: 'center', minHeight: 76, justifyContent: 'center' },
  statValue: { color: '#24775D', fontSize: 23, fontWeight: '800' }, statLabel: { color: '#65766F', fontSize: 11, marginTop: 3 }, loader: { marginVertical: 22 },
  error: { color: '#B33E42', fontSize: 13, textAlign: 'center' }, latestCard: { backgroundColor: '#E6F3ED', borderRadius: 16, padding: 15, marginBottom: 22 },
  latestLabel: { color: '#24775D', fontSize: 10, fontWeight: '800', letterSpacing: 1 }, latestName: { color: '#173B32', fontSize: 15, fontWeight: '700', marginTop: 6 }, latestMeta: { color: '#65766F', fontSize: 12, marginTop: 4 },
  action: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 17, padding: 15, marginBottom: 10 }, pressed: { opacity: 0.75 },
  actionIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6F3ED', marginRight: 13 }, actionIconText: { color: '#24775D', fontSize: 20, fontWeight: '700' },
  actionCopy: { flex: 1 }, actionTitle: { color: '#173B32', fontSize: 15, fontWeight: '700' }, actionDetail: { color: '#65766F', fontSize: 12, marginTop: 3 }, chevron: { color: '#8A9A93', fontSize: 25, marginLeft: 8 },
  note: { color: '#65766F', fontSize: 11, lineHeight: 16, marginTop: 16, textAlign: 'center' },
});
