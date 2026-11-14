import { useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useThemedStyles } from '../theme/ThemeContext.jsx';
import { BLOOD_GROUPS } from '../utils/validation';
import { makeProfileImageDataUri } from '../utils/profileImage';

const GENDERS = ['Female', 'Male', 'Other', 'Prefer not to say'];

export default function DonorSignupScreen({ onSubmit, onBack, onValidateEligibility }) {
  const styles = useThemedStyles(baseStyles);
  const [values, setValues] = useState({ name: '', username: '', phone: '', email: '', blood_group: '', district: '', password: '', confirmation: '', profile_image: null, date_of_birth: '', weight_kg: '', gender: '', has_donated_before: '' });
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors([]);
  }

  async function chooseProfilePhoto() {
    setErrors([]);
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return setError('Allow photo library access to choose a profile picture.');
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.65, base64: true,
      });
      if (result.canceled) return;
      const photo = result.assets?.[0];
      if (!photo) return;
      const profileImage = await makeProfileImageDataUri(photo);
      setValues((current) => ({ ...current, profile_image: profileImage }));
    } catch (photoError) {
      setError(photoError?.message || 'Could not open the photo library. Please try again.');
    }
  }

  async function submit() {
    const phoneDigits = values.phone.replace(/[\s()-]/g, '').replace(/^\+/, '');
    const formErrors = [];
    if (values.name.trim().length < 2) formErrors.push('Enter your full name.');
    if (values.username.trim().length < 3) formErrors.push('Choose a username with at least 3 characters.');
    if (!/^\d{9,12}$/.test(phoneDigits)) formErrors.push('Enter a valid mobile number.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) formErrors.push('Enter a valid email address.');
    if (!BLOOD_GROUPS.includes(values.blood_group)) formErrors.push('Choose your blood group.');
    if (values.district.trim().length < 2) formErrors.push('Enter your district.');
    if (!GENDERS.includes(values.gender)) formErrors.push('Choose your gender.');
    if (!['yes', 'no'].includes(values.has_donated_before)) formErrors.push('Tell us whether you have donated blood before.');
    if (values.password.length < 8) formErrors.push('Use a password with at least 8 characters.');
    if (values.password !== values.confirmation) formErrors.push('The passwords do not match.');
    setBusy(true);
    try {
      const eligibilityErrors = await onValidateEligibility(values);
      const validationErrors = [...formErrors, ...eligibilityErrors];
      if (validationErrors.length) {
        setErrors(validationErrors);
        return;
      }
      await onSubmit(values);
      setSubmitted(true);
    } catch (submitError) {
      const message = String(submitError?.message ?? submitError);
      if (message.includes('UNIQUE constraint failed') || message.includes('already registered')) setErrors(['That username is already registered.']);
      else if (message.includes('already has an account')) setErrors(['This donor profile already has an account. Contact the administrator for password recovery.']);
      else if (message.includes('Check your registration details')) setErrors(['Check your registration details and try again.']);
      else if (message.includes('years old') || message.includes('maximum age requirement') || message.includes('weight') || message.includes('date of birth')) setErrors(message.split('\n'));
      else setErrors(['Could not create your account. Please try again.']);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        {submitted ? <>
          <Text style={styles.eyebrow}>LIFELINK DONOR REGISTRATION</Text>
          <Text style={styles.title}>Registration successful</Text>
          <Text style={styles.body}>Your donor profile and account have been created. You can now log in with your username and password.</Text>
          <Pressable onPress={onBack} style={styles.button}><Text style={styles.buttonText}>Back to Donor Login</Text></Pressable>
        </> : <>
          <Pressable onPress={onBack} style={styles.back}><Text style={styles.backText}>‹ Back</Text></Pressable>
          <Text style={styles.eyebrow}>LIFELINK DONOR REGISTRATION</Text>
          <Text style={styles.title}>Donor Registration</Text>
          <Text style={styles.body}>Create your donor profile and account. Your account mobile and email stay private to your account.</Text>
          <View style={styles.photoBlock}>
            <Pressable accessibilityRole="button" onPress={chooseProfilePhoto} style={styles.photoChoice}>
              {values.profile_image ? <Image source={{ uri: values.profile_image }} style={styles.photo} /> : <View style={styles.photoPlaceholder}><Text style={styles.photoInitial}>{values.name.trim().charAt(0).toUpperCase() || '+'}</Text></View>}
              <Text style={styles.photoAction}>{values.profile_image ? 'Change profile picture' : 'Add profile picture'}</Text>
            </Pressable>
            <Text style={styles.photoHint}>Optional. This picture is saved on this device.</Text>
            {values.profile_image ? <Pressable onPress={() => update('profile_image', null)}><Text style={styles.removePhoto}>Remove picture</Text></Pressable> : null}
          </View>
          <Field label="Full name" value={values.name} onChangeText={(value) => update('name', value)} placeholder="Your full name" />
          <Field label="Username" value={values.username} onChangeText={(value) => update('username', value)} placeholder="Choose a username" autoCapitalize="none" />
          <Field label="Mobile number" value={values.phone} onChangeText={(value) => update('phone', value)} placeholder="Your mobile number" keyboardType="phone-pad" />
          <Field label="Email" value={values.email} onChangeText={(value) => update('email', value)} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Field label="Date of birth" value={values.date_of_birth} onChangeText={(value) => update('date_of_birth', value)} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" maxLength={10} />
          <Field label="Weight (kg)" value={values.weight_kg} onChangeText={(value) => update('weight_kg', value.replace(/[^\d.]/g, ''))} placeholder="For example, 55" keyboardType="decimal-pad" />
          <Text style={styles.label}>Gender</Text>
          <View style={styles.groupWrap}>
            {GENDERS.map((gender) => <Pressable key={gender} accessibilityRole="button" accessibilityState={{ selected: values.gender === gender }} onPress={() => update('gender', gender)} style={[styles.groupOption, values.gender === gender && styles.groupOptionSelected]}><Text style={[styles.groupText, values.gender === gender && styles.groupTextSelected]}>{gender}</Text></Pressable>)}
          </View>
          <Text style={styles.label}>Have you donated blood before?</Text>
          <View style={styles.groupWrap}>
            {['yes', 'no'].map((answer) => <Pressable key={answer} accessibilityRole="button" accessibilityState={{ selected: values.has_donated_before === answer }} onPress={() => update('has_donated_before', answer)} style={[styles.groupOption, values.has_donated_before === answer && styles.groupOptionSelected]}><Text style={[styles.groupText, values.has_donated_before === answer && styles.groupTextSelected]}>{answer === 'yes' ? 'Yes' : 'No'}</Text></Pressable>)}
          </View>
          <Text style={styles.label}>Blood group</Text>
          <View style={styles.groupWrap}>
            {BLOOD_GROUPS.map((group) => <Pressable key={group} accessibilityRole="button" accessibilityState={{ selected: values.blood_group === group }} onPress={() => update('blood_group', group)} style={[styles.groupOption, values.blood_group === group && styles.groupOptionSelected]}><Text style={[styles.groupText, values.blood_group === group && styles.groupTextSelected]}>{group}</Text></Pressable>)}
          </View>
          <Field label="District" value={values.district} onChangeText={(value) => update('district', value)} placeholder="Your district" />
          <Field label="Password" value={values.password} onChangeText={(value) => update('password', value)} placeholder="At least 8 characters" secureTextEntry autoCapitalize="none" />
          <Field label="Confirm password" value={values.confirmation} onChangeText={(value) => update('confirmation', value)} placeholder="Re-enter your password" secureTextEntry autoCapitalize="none" />
          <Text style={styles.eligibilityNote}>These are basic registration checks only. Medical staff determine whether you are fit to donate.</Text>
          {errors.length ? <View accessibilityRole="alert" style={styles.errors}>{errors.map((item, index) => <Text key={`${index}-${item}`} style={styles.error}>{item}</Text>)}</View> : null}
          <Pressable disabled={busy} onPress={submit} style={[styles.button, busy && styles.disabled]}>
            {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Register</Text>}
          </Pressable>
        </>}
      </View>
    </ScrollView>
  );
}

function Field({ label, ...props }) {
  const styles = useThemedStyles(baseStyles);
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...props} style={styles.input} placeholderTextColor="#8A9A93" autoCorrect={false} /></View>;
}

const baseStyles = {
  page: { flexGrow: 1, justifyContent: 'center', padding: 22, backgroundColor: '#F5F8F6' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 22 },
  back: { alignSelf: 'flex-start', marginBottom: 12 }, backText: { color: '#24775D', fontWeight: '700' },
  eyebrow: { color: '#24775D', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  title: { color: '#173B32', fontSize: 24, fontWeight: '800' },
  body: { color: '#65766F', fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 16 },
  photoBlock: { alignItems: 'center', marginBottom: 15 }, photoChoice: { alignItems: 'center', padding: 6 },
  photo: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#E6F3ED' },
  photoPlaceholder: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#E6F3ED', alignItems: 'center', justifyContent: 'center' },
  photoInitial: { color: '#24775D', fontSize: 30, fontWeight: '800' },
  photoAction: { color: '#24775D', fontWeight: '700', fontSize: 13, marginTop: 8 },
  photoHint: { color: '#65766F', fontSize: 11, marginTop: 3 }, removePhoto: { color: '#B33E42', fontSize: 12, fontWeight: '600', padding: 6 },
  field: { marginBottom: 13 }, label: { color: '#173B32', fontSize: 13, fontWeight: '700', marginBottom: 7 },
  eligibilityNote: { color: '#65766F', fontSize: 12, lineHeight: 18, marginTop: 2 },
  errors: { marginTop: 8, gap: 4 },
  groupWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 13 }, groupOption: { borderWidth: 1, borderColor: '#DCE6E0', borderRadius: 18, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#FFFFFF' },
  groupOptionSelected: { borderColor: '#24775D', backgroundColor: '#24775D' }, groupText: { color: '#52665D', fontSize: 13, fontWeight: '600' }, groupTextSelected: { color: '#FFFFFF' },
  input: { backgroundColor: '#F5F8F6', borderWidth: 1, borderColor: '#DCE6E0', borderRadius: 12, color: '#173B32', paddingHorizontal: 13, paddingVertical: 12, fontSize: 15 },
  error: { color: '#B33E42', fontSize: 13 },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#24775D', borderRadius: 13, padding: 14, marginTop: 14 },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 }, disabled: { opacity: 0.6 },
};
