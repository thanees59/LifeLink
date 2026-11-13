import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDonors } from '../database/donorTable';
import { createDonation } from '../database/donationTable';

const today = () => new Date().toISOString().slice(0, 10);

export default function AddDonationScreen({ navigation, route }) {
  const [donors, setDonors] = useState([]);
  const [donorId, setDonorId] = useState(route.params?.donorId ?? null);
  const [date, setDate] = useState(today());
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    getDonors().then((rows) => { if (active) setDonors(rows); })
      .catch(() => Alert.alert('Unable to load donors', 'Please return and try again.'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  async function saveDonation() {
    if (!donorId) return Alert.alert('Choose a donor', 'Select the donor for this donation.');
    const parsedDate = new Date(`${date}T00:00:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
      return Alert.alert('Check the date', 'Enter a valid date using YYYY-MM-DD.');
    }
    if (!location.trim()) return Alert.alert('Add a location', 'Enter where the donation took place.');
    setSaving(true);
    try {
      await createDonation({ donor_id: donorId, donation_date: date, location, notes });
      navigation.replace('DonationHistory');
    } catch {
      Alert.alert('Unable to save donation', 'Please try again.');
    } finally { setSaving(false); }
  }

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Record a donation</Text>
      <Text style={styles.help}>Donation history is stored locally on this device.</Text>
      <Text style={styles.label}>Donor</Text>
      {loading ? <ActivityIndicator color="#24775D" /> : donors.length === 0 ? <Text style={styles.empty}>Add a donor before recording a donation.</Text> : (
        <View style={styles.donorList}>{donors.map((donor) => {
          const selected = donor.id === donorId;
          return <Pressable key={donor.id} onPress={() => setDonorId(donor.id)} style={[styles.donor, selected && styles.selected]}>
            <Text style={[styles.donorName, selected && styles.selectedText]}>{donor.name}</Text>
            <Text style={[styles.donorMeta, selected && styles.selectedText]}>{donor.blood_group} · {donor.district}</Text>
          </Pressable>;
        })}</View>
      )}
      <Field label="Donation date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-11-13" />
      <Field label="Location" value={location} onChangeText={setLocation} placeholder="Hospital or donation centre" />
      <Field label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Add any helpful details" multiline />
      <Pressable disabled={saving || loading || donors.length === 0} style={[styles.button, (saving || loading || donors.length === 0) && styles.disabled]} onPress={saveDonation}>
        <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save donation'}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({ label, multiline, ...props }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...props} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} style={[styles.input, multiline && styles.multiline]} placeholderTextColor="#8A9A93" /></View>;
}

const styles = StyleSheet.create({
  page: { padding: 20, paddingBottom: 36 }, title: { color: '#173B32', fontSize: 24, fontWeight: '800' },
  help: { color: '#65766F', fontSize: 14, marginTop: 5, marginBottom: 22 }, label: { color: '#173B32', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  donorList: { gap: 8, marginBottom: 18 }, donor: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE6E0', borderRadius: 13, padding: 13 },
  selected: { backgroundColor: '#24775D', borderColor: '#24775D' }, donorName: { color: '#173B32', fontSize: 14, fontWeight: '700' },
  donorMeta: { color: '#65766F', fontSize: 12, marginTop: 3 }, selectedText: { color: '#FFFFFF' }, field: { marginBottom: 16 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 13, paddingHorizontal: 14, paddingVertical: 13, color: '#173B32', fontSize: 15 },
  multiline: { minHeight: 90 }, button: { backgroundColor: '#24775D', borderRadius: 14, alignItems: 'center', paddingVertical: 15, marginTop: 4 },
  disabled: { opacity: 0.55 }, buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' }, empty: { color: '#65766F', marginBottom: 18 },
});
