import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDonations } from '../database/donationTable';

export default function DonationHistoryScreen({ navigation }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    getDonations().then((rows) => { if (active) { setDonations(rows); setLoadError(false); } })
      .catch(() => { if (active) setLoadError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.header}><View><Text style={styles.title}>Donation History</Text><Text style={styles.subtitle}>{donations.length} {donations.length === 1 ? 'record' : 'records'} saved locally</Text></View>
        <Pressable style={styles.addButton} onPress={() => navigation.navigate('AddDonation')}><Text style={styles.addText}>+ Add</Text></Pressable>
      </View>
      {loading ? <ActivityIndicator color="#24775D" style={styles.state} /> : loadError ? <Text style={styles.empty}>Could not load donation history. Return to try again.</Text> : donations.length === 0 ? (
        <View style={styles.emptyCard}><Text style={styles.emptyTitle}>No donations recorded</Text><Text style={styles.empty}>Add a donation to start the local history.</Text></View>
      ) : donations.map((item) => (
        <Pressable key={item.id} onPress={() => navigation.navigate('DonorDetails', { donorId: item.donor_id })} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <View style={styles.badge}><Text style={styles.blood}>{item.blood_group}</Text></View>
          <View style={styles.copy}><Text style={styles.name}>{item.donor_name}</Text><Text style={styles.meta}>{item.donation_date} · {item.location}</Text>{item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}</View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, paddingBottom: 36 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  title: { color: '#173B32', fontSize: 23, fontWeight: '800' }, subtitle: { color: '#65766F', fontSize: 13, marginTop: 4 },
  addButton: { backgroundColor: '#24775D', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 11 }, addText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 10 }, pressed: { opacity: 0.75 },
  badge: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCE9E9', marginRight: 12 }, blood: { color: '#B33E42', fontSize: 13, fontWeight: '800' },
  copy: { flex: 1 }, name: { color: '#173B32', fontSize: 15, fontWeight: '700' }, meta: { color: '#65766F', fontSize: 12, marginTop: 4 }, notes: { color: '#65766F', fontSize: 12, marginTop: 5 }, chevron: { color: '#8A9A93', fontSize: 24, marginLeft: 8 },
  state: { marginTop: 50 }, emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 17, padding: 20, alignItems: 'center' }, emptyTitle: { color: '#173B32', fontSize: 16, fontWeight: '700', marginBottom: 5 }, empty: { color: '#65766F', fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 24 },
});
