import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const INK = '#173B32';
const MUTED = '#65766F';
const GREEN = '#24775D';

export default function PlaceholderScreen({ title, description, nextSteps = [], navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.introCard}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>♥</Text>
        </View>
        <Text style={styles.eyebrow}>LIFELINK · OFFLINE REGISTRY</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {nextSteps.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planned for this screen</Text>
          {nextSteps.map((step) => (
            <View key={step} style={styles.listRow}>
              <Text style={styles.check}>•</Text>
              <Text style={styles.listText}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      {navigation && (
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go back</Text>
        </Pressable>
      )}
      <Text style={styles.footer}>Your registry will be stored on this device.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, paddingBottom: 36 },
  introCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 22, marginBottom: 18 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E6F3ED', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  icon: { color: GREEN, fontSize: 25 },
  eyebrow: { color: GREEN, fontSize: 11, fontWeight: '800', letterSpacing: 1.1, marginBottom: 8 },
  title: { color: INK, fontSize: 26, fontWeight: '800', marginBottom: 8 },
  description: { color: MUTED, fontSize: 15, lineHeight: 22 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20, marginBottom: 18 },
  sectionTitle: { color: INK, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  check: { color: GREEN, fontSize: 18, lineHeight: 21, marginRight: 10 },
  listText: { color: MUTED, fontSize: 14, lineHeight: 21, flex: 1 },
  backButton: { backgroundColor: GREEN, borderRadius: 14, alignItems: 'center', paddingVertical: 15 },
  backButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  footer: { color: MUTED, fontSize: 12, textAlign: 'center', marginTop: 22 },
});
