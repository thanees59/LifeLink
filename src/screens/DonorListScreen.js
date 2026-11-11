import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDonors } from '../database/donorTable';

export default function DonorListScreen({ navigation }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    getDonors().then((rows) => {
      if (active) { setDonors(rows); setLoadError(false); }
    }).catch(() => {
      if (active) setLoadError(true);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.header}>
        <View><Text style={styles.title}>Donor Registry</Text><Text style={styles.subtitle}>{donors.length} {donors.length === 1 ? 'donor' : 'donors'} saved on this device</Text></View>
        <Pressable style={styles.addButton} onPress={() => navigation.navigate('AddDonor')}><Text style={styles.addText}>+ Add</Text></Pressable>
      </View>
      {loading ? <ActivityIndicator color="#24775D" style={styles.state} /> : loadError ? (
        <Text style={styles.empty}>Could not load donors. Return to this screen to try again.</Text>
      ) : donors.length === 0 ? (
        <View style={styles.emptyCard}><Text style={styles.emptyTitle}>No donors yet</Text><Text style={styles.empty}>Add a donor to start your local registry.</Text></View>
      ) : donors.map((donor) => (
        <Pressable key={donor.id} onPress={() => navigation.navigate('DonorDetails', { donorId: donor.id })} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <View style={styles.bloodBadge}><Text style={styles.blood}>{donor.blood_group}</Text></View>
          <View style={styles.copy}><Text style={styles.name}>{donor.name}</Text><Text style={styles.meta}>{donor.district} · {donor.phone}</Text></View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  title: { color: '#173B32', fontSize: 23, fontWeight: '800' },
  subtitle: { color: '#65766F', fontSize: 13, marginTop: 4 },
  addButton: { backgroundColor: '#24775D', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 11 },
  addText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 10 },
  pressed: { opacity: 0.75 },
  bloodBadge: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCE9E9', marginRight: 12 },
  blood: { color: '#B33E42', fontSize: 13, fontWeight: '800' },
  copy: { flex: 1 },
  name: { color: '#173B32', fontSize: 15, fontWeight: '700' },
  meta: { color: '#65766F', fontSize: 12, marginTop: 4 },
  chevron: { color: '#8A9A93', fontSize: 24, marginLeft: 8 },
  state: { marginTop: 50 },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 17, padding: 20, alignItems: 'center' },
  emptyTitle: { color: '#173B32', fontSize: 16, fontWeight: '700', marginBottom: 5 },
  empty: { color: '#65766F', fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 24 },
});
