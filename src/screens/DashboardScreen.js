import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const actions = [
  { title: 'Donor Registry', detail: 'Browse and find donors', screen: 'DonorRegistry', icon: '◎' },
  { title: 'Add a Donor', detail: 'Register a donor locally', screen: 'AddDonor', icon: '+' },
  { title: 'Donation History', detail: 'Review recorded donations', screen: 'DonationHistory', icon: '↗' },
  { title: 'Add Donation', detail: 'Record a donation event', screen: 'AddDonation', icon: '♥' },
  { title: 'Settings & About', detail: 'App and local data details', screen: 'Settings', icon: '⚙' },
];

export default function DashboardScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>OFFLINE BLOOD DONOR REGISTRY</Text>
        <Text style={styles.heading}>Every donor{"\n"}can make a difference.</Text>
        <Text style={styles.body}>A simple, private place to manage donor details and donation history on this device.</Text>
        <View style={styles.statusPill}><View style={styles.dot} /><Text style={styles.statusText}>Designed to work offline</Text></View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your workspace</Text>
        <Text style={styles.sectionHint}>Choose where to start</Text>
      </View>

      {actions.map((action) => (
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

const styles = StyleSheet.create({
  page: { padding: 20, paddingBottom: 36 },
  hero: { backgroundColor: '#173B32', borderRadius: 24, padding: 23, marginBottom: 26 },
  eyebrow: { color: '#B8DFCB', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 14 },
  heading: { color: '#FFFFFF', fontSize: 29, fontWeight: '800', lineHeight: 35, marginBottom: 10 },
  body: { color: '#D3E2DB', fontSize: 14, lineHeight: 21 },
  statusPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#285447', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginTop: 18 },
  dot: { backgroundColor: '#82D2A6', width: 7, height: 7, borderRadius: 4, marginRight: 8 },
  statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { color: '#173B32', fontSize: 19, fontWeight: '800' },
  sectionHint: { color: '#65766F', fontSize: 13, marginTop: 3 },
  action: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 17, padding: 15, marginBottom: 10 },
  pressed: { opacity: 0.75 },
  actionIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6F3ED', marginRight: 13 },
  actionIconText: { color: '#24775D', fontSize: 20, fontWeight: '700' },
  actionCopy: { flex: 1 },
  actionTitle: { color: '#173B32', fontSize: 15, fontWeight: '700' },
  actionDetail: { color: '#65766F', fontSize: 12, marginTop: 3 },
  chevron: { color: '#8A9A93', fontSize: 25, marginLeft: 8 },
  note: { color: '#65766F', fontSize: 11, lineHeight: 16, marginTop: 16, textAlign: 'center' },
});
