import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BLOOD_GROUPS, validateDonor } from '../utils/validation';

const INK = '#173B32';
const GREEN = '#24775D';
const MUTED = '#65766F';

export default function DonorForm({ initialValues, onSubmit, submitLabel }) {
  const [values, setValues] = useState({
    name: initialValues?.name ?? '',
    phone: initialValues?.phone ?? '',
    blood_group: initialValues?.blood_group ?? '',
    district: initialValues?.district ?? '',
    availability: initialValues?.availability ?? 'Available',
    contact_consent: Boolean(initialValues?.contact_consent),
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value, ...(field === 'contact_consent' && !value ? { phone: '' } : {}) }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  async function submit() {
    const validationErrors = validateDonor(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setSaving(true);
    try {
      await onSubmit(values);
    } catch (error) {
      const message = String(error?.message ?? error);
      const formError = message.includes('UNIQUE constraint failed')
        ? 'That phone number is already registered.'
        : 'Could not save this donor. Please try again.';
      setErrors((current) => ({ ...current, form: formError }));
      Alert.alert('Unable to save donor', formError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Text style={styles.intro}>Enter the donor details to save them on this device.</Text>
      <Field label="Full name" value={values.name} onChangeText={(value) => setField('name', value)} error={errors.name} placeholder="e.g. Amaya Perera" />
      <Text style={styles.label}>Contact sharing consent</Text>
      <Option label={values.contact_consent ? 'Consent recorded' : 'Consent not recorded'} selected={values.contact_consent} onPress={() => setField('contact_consent', !values.contact_consent)} />
      <Text style={styles.hint}>Only record and share a donor’s phone number with LifeLink coordinators after the donor gives permission.</Text>
      {values.contact_consent ? <Field label="Phone number" value={values.phone} onChangeText={(value) => setField('phone', value)} error={errors.phone} placeholder="e.g. 0771234567" keyboardType="phone-pad" /> : <Text style={styles.withheld}>Contact details are withheld until the donor’s consent is recorded.</Text>}

      <Text style={styles.label}>Blood group</Text>
      <View style={styles.optionWrap}>
        {BLOOD_GROUPS.map((group) => (
          <Option key={group} label={group} selected={values.blood_group === group} onPress={() => setField('blood_group', group)} />
        ))}
      </View>
      {errors.blood_group && <Text style={styles.error}>{errors.blood_group}</Text>}

      <Field label="District" value={values.district} onChangeText={(value) => setField('district', value)} error={errors.district} placeholder="e.g. Colombo" />

      <Text style={styles.label}>Administrative availability</Text>
      <View style={styles.optionWrap}>
        {['Available', 'Unavailable'].map((status) => (
          <Option key={status} label={status} selected={values.availability === status} onPress={() => setField('availability', status)} />
        ))}
      </View>
      <Text style={styles.hint}>This status is for record keeping and does not indicate medical eligibility.</Text>

      {errors.form && <Text style={styles.error}>{errors.form}</Text>}
      <Pressable disabled={saving} style={({ pressed }) => [styles.submit, pressed && styles.pressed, saving && styles.disabled]} onPress={submit}>
        <Text style={styles.submitText}>{saving ? 'Saving…' : submitLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({ label, error, ...inputProps }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...inputProps} style={[styles.input, error && styles.inputError]} placeholderTextColor="#8A9A93" />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

function Option({ label, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.option, selected && styles.selectedOption]}>
      <Text style={[styles.optionText, selected && styles.selectedOptionText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, paddingBottom: 36 },
  intro: { color: MUTED, fontSize: 14, lineHeight: 21, marginBottom: 22 },
  field: { marginBottom: 17 },
  label: { color: INK, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE6E0', borderRadius: 13, paddingHorizontal: 14, paddingVertical: 13, color: INK, fontSize: 15 },
  inputError: { borderColor: '#B33E42' },
  optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  option: { borderWidth: 1, borderColor: '#DCE6E0', borderRadius: 18, paddingVertical: 9, paddingHorizontal: 14, backgroundColor: '#FFFFFF' },
  selectedOption: { borderColor: GREEN, backgroundColor: GREEN },
  optionText: { color: '#52665D', fontSize: 13, fontWeight: '600' },
  selectedOptionText: { color: '#FFFFFF' },
  hint: { color: MUTED, fontSize: 12, lineHeight: 17, marginTop: -1, marginBottom: 18 },
  withheld: { color: MUTED, fontSize: 12, lineHeight: 17, marginTop: 2, marginBottom: 18 },
  error: { color: '#B33E42', fontSize: 12, marginTop: 5 },
  submit: { backgroundColor: GREEN, borderRadius: 14, alignItems: 'center', paddingVertical: 15, marginTop: 8 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.6 },
});
