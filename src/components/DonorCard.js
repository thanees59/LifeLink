import { StyleSheet, Text, View } from 'react-native';

export default function DonorCard({ donor }) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}><Text style={styles.blood}>{donor?.bloodGroup ?? '—'}</Text></View>
      <View style={styles.details}>
        <Text style={styles.name}>{donor?.fullName ?? 'Donor name'}</Text>
        <Text style={styles.meta}>{donor?.district ?? 'District'} · {donor?.availability ?? 'Availability'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14 },
  avatar: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCE9E9', marginRight: 12 },
  blood: { color: '#B33E42', fontSize: 13, fontWeight: '800' },
  details: { flex: 1 },
  name: { color: '#173B32', fontSize: 15, fontWeight: '700' },
  meta: { color: '#65766F', fontSize: 12, marginTop: 4 },
});
