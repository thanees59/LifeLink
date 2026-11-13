import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { deleteDonor, getDonorById } from '../database/donorTable';
import { getDonationsForDonor } from '../database/donationTable';
import { useAuth } from '../auth/AuthContext.jsx';

export default function DonorDetailsScreen({ navigation, route }) {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const { donorId } = route.params ?? {};
  const [donor, setDonor] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    Promise.all([getDonorById(donorId), getDonationsForDonor(donorId)]).then(([row, rows]) => {
      if (active) { setDonor(row); setDonations(rows); }
    })
      .catch(() => { if (active) setDonor(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [donorId]));

  async function removeDonor() {
    try {
      await deleteDonor(donorId);
      navigation.replace('DonorRegistry');
    } catch {
      Alert.alert('Unable to delete donor', 'Please try again.');
    }
  }

  function confirmDelete() {
    Alert.alert('Delete donor?', 'This also deletes donation records linked to this donor.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: removeDonor },
    ]);
  }

  if (loading) return <ActivityIndicator color="#24775D" style={styles.loader} />;
  if (!donor) return <View style={styles.page}><Text style={styles.muted}>This donor could not be found.</Text><Pressable onPress={() => navigation.replace('DonorRegistry')}><Text style={styles.link}>Back to registry</Text></Pressable></View>;

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.profile}>
        <View style={styles.badge}><Text style={styles.blood}>{donor.blood_group}</Text></View>
        <Text style={styles.name}>{donor.name}</Text>
        <Text style={styles.district}>{donor.district}</Text>
        <View style={[styles.status, donor.availability === 'Available' ? styles.available : styles.unavailable]}>
          <Text style={styles.statusText}>{donor.availability}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Info label="Phone number" value={isAdmin ? donor.phone ?? 'Not shared (consent not recorded)' : donor.contact_consent ? 'Shared with coordinators by consent' : 'Not shared (consent not recorded)'} />
        <Info label="Blood group" value={donor.blood_group} />
        <Info label="District" value={donor.district} last />
      </View>
      <View style={styles.historyCard}>
        <View style={styles.historyHeading}><Text style={styles.historyTitle}>Donation history</Text><Text style={styles.historyCount}>{donations.length}</Text></View>
        {donations.length === 0 ? <Text style={styles.historyEmpty}>No donation records for this donor yet.</Text> : donations.slice(0, 2).map((item) => (
          <View key={item.id} style={styles.historyRow}><Text style={styles.historyDate}>{item.donation_date}</Text><Text style={styles.historyLocation}>{item.location}</Text></View>
        ))}
        <Pressable onPress={() => navigation.navigate('DonationHistory', { donorId })} style={styles.historyLink}><Text style={styles.link}>View all records</Text></Pressable>
      </View>
      <Text style={styles.disclaimer}>Availability is an administrative record and does not confirm medical eligibility.</Text>

      {isAdmin ? <>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('AddDonation', { donorId })}>
          <Text style={styles.secondaryText}>Record a donation</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('AddDonor', { donorId })}>
          <Text style={styles.primaryText}>Edit donor</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={confirmDelete}>
          <Text style={styles.deleteText}>Delete donor</Text>
        </Pressable>
      </> : null}
    </ScrollView>
  );
}

function Info({ label, value, last }) {
  return <View style={[styles.infoRow, last && styles.lastRow]}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  page: { padding: 20, paddingBottom: 36 },
  loader: { marginTop: 60 },
  profile: { backgroundColor: '#FFFFFF', borderRadius: 20, alignItems: 'center', padding: 24, marginBottom: 16 },
  badge: { width: 64, height: 64, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCE9E9', marginBottom: 12 },
  blood: { color: '#B33E42', fontSize: 18, fontWeight: '800' },
  name: { color: '#173B32', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  district: { color: '#65766F', fontSize: 14, marginTop: 5 },
  status: { borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12, marginTop: 13 },
  available: { backgroundColor: '#E6F3ED' },
  unavailable: { backgroundColor: '#F1EFEB' },
  statusText: { color: '#24775D', fontSize: 12, fontWeight: '700' },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 18, marginBottom: 12 },
  historyCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, marginTop: 4 },
  historyHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  historyTitle: { color: '#173B32', fontSize: 16, fontWeight: '700' }, historyCount: { color: '#24775D', fontWeight: '800' },
  historyEmpty: { color: '#65766F', fontSize: 13, lineHeight: 19, marginVertical: 8 },
  historyRow: { borderTopWidth: 1, borderTopColor: '#EDF1EE', paddingVertical: 10 }, historyDate: { color: '#173B32', fontSize: 13, fontWeight: '700' }, historyLocation: { color: '#65766F', fontSize: 12, marginTop: 3 },
  historyLink: { alignSelf: 'flex-start', paddingTop: 8 },
  infoRow: { borderBottomWidth: 1, borderBottomColor: '#EDF1EE', paddingVertical: 15 },
  lastRow: { borderBottomWidth: 0 },
  label: { color: '#65766F', fontSize: 12, marginBottom: 5 },
  value: { color: '#173B32', fontSize: 15, fontWeight: '600' },
  disclaimer: { color: '#65766F', fontSize: 12, lineHeight: 18, marginVertical: 8 },
  primaryButton: { backgroundColor: '#24775D', borderRadius: 14, alignItems: 'center', paddingVertical: 15, marginTop: 14 },
  secondaryButton: { borderWidth: 1, borderColor: '#24775D', borderRadius: 14, alignItems: 'center', paddingVertical: 14, marginTop: 10 },
  secondaryText: { color: '#24775D', fontSize: 15, fontWeight: '700' },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  deleteButton: { borderWidth: 1, borderColor: '#B33E42', borderRadius: 14, alignItems: 'center', paddingVertical: 14, marginTop: 10 },
  deleteText: { color: '#B33E42', fontSize: 15, fontWeight: '700' },
  muted: { color: '#65766F', fontSize: 15, marginBottom: 15 },
  link: { color: '#24775D', fontWeight: '700' },
});
