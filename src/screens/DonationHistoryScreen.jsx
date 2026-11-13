import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { deleteDonation, getDonations } from '../database/donationTable';
import SearchBar from '../components/SearchBar.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

export default function DonationHistoryScreen({ navigation, route }) {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const donorId = route.params?.donorId;
  const [donations, setDonations] = useState([]);
  const [query, setQuery] = useState('');
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

  const visibleDonations = useMemo(() => donations.filter((item) => {
    if (donorId != null && item.donor_id !== donorId) return false;
    const search = query.trim().toLocaleLowerCase();
    return !search || [item.donor_name, item.blood_group, item.donation_date, item.location, item.notes ?? '']
      .some((value) => value.toLocaleLowerCase().includes(search));
  }), [donations, donorId, query]);

  async function removeDonation(id) {
    try {
      await deleteDonation(id);
      setDonations((current) => current.filter((item) => item.id !== id));
    } catch {
      Alert.alert('Unable to delete donation', 'Please try again.');
    }
  }

  function confirmDelete(item) {
    Alert.alert('Delete donation record?', `Remove the ${item.donation_date} donation for ${item.donor_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeDonation(item.id) },
    ]);
  }

  const title = donorId == null ? 'Donation History' : 'Donor Donation History';

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={styles.headerCopy}><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{visibleDonations.length} {visibleDonations.length === 1 ? 'record' : 'records'} shown</Text></View>
        {isAdmin ? <Pressable style={styles.addButton} onPress={() => navigation.navigate('AddDonation', donorId == null ? undefined : { donorId })}><Text style={styles.addText}>+ Add</Text></Pressable> : null}
      </View>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search donor, date, or location" />
      {loading ? <ActivityIndicator color="#24775D" style={styles.state} /> : loadError ? <Text style={styles.empty}>Could not load donation history. Return to try again.</Text> : visibleDonations.length === 0 ? (
        <View style={styles.emptyCard}><Text style={styles.emptyTitle}>{donations.length === 0 ? 'No donations recorded' : 'No matching donations'}</Text><Text style={styles.empty}>{donations.length === 0 ? 'Add a donation to start the local history.' : 'Try a different search.'}</Text></View>
      ) : visibleDonations.map((item) => (
        <View key={item.id} style={styles.card}>
          <Pressable onPress={() => navigation.navigate('DonorDetails', { donorId: item.donor_id })} style={({ pressed }) => [styles.record, pressed && styles.pressed]}>
            <View style={styles.badge}><Text style={styles.blood}>{item.blood_group}</Text></View>
            <View style={styles.copy}><Text style={styles.name}>{item.donor_name}</Text><Text style={styles.meta}>{item.donation_date} · {item.location}</Text>{item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}</View>
          </Pressable>
          {isAdmin ? <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate('AddDonation', { donationId: item.id, donorId: item.donor_id })} style={styles.editButton}><Text style={styles.editText}>Edit</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => confirmDelete(item)} style={styles.deleteButton}><Text style={styles.deleteText}>Delete</Text></Pressable>
          </View> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, paddingBottom: 36 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }, headerCopy: { flex: 1 },
  title: { color: '#173B32', fontSize: 23, fontWeight: '800' }, subtitle: { color: '#65766F', fontSize: 13, marginTop: 4 },
  addButton: { backgroundColor: '#24775D', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 11, marginLeft: 10 }, addText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginTop: 10 }, record: { flexDirection: 'row', alignItems: 'center' }, pressed: { opacity: 0.75 },
  badge: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCE9E9', marginRight: 12 }, blood: { color: '#B33E42', fontSize: 13, fontWeight: '800' },
  copy: { flex: 1 }, name: { color: '#173B32', fontSize: 15, fontWeight: '700' }, meta: { color: '#65766F', fontSize: 12, marginTop: 4 }, notes: { color: '#65766F', fontSize: 12, marginTop: 5 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EDF1EE' },
  editButton: { borderWidth: 1, borderColor: '#24775D', borderRadius: 9, paddingHorizontal: 14, paddingVertical: 8 }, editText: { color: '#24775D', fontSize: 13, fontWeight: '700' },
  deleteButton: { borderWidth: 1, borderColor: '#E7C5C5', borderRadius: 9, paddingHorizontal: 14, paddingVertical: 8 }, deleteText: { color: '#B33E42', fontSize: 13, fontWeight: '700' },
  state: { marginTop: 50 }, emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 17, padding: 20, alignItems: 'center', marginTop: 18 }, emptyTitle: { color: '#173B32', fontSize: 16, fontWeight: '700', marginBottom: 5 }, empty: { color: '#65766F', fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 24 },
});
