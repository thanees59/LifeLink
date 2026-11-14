import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import DonorForm from '../components/DonorForm.jsx';
import { createDonor, deleteDonor, getDonorById, updateDonor } from '../database/donorTable';
import { getDonorCredentialUsername, saveDonorCredential } from '../database/authTable';
import { useTheme, useThemedStyles } from '../theme/ThemeContext.jsx';

export default function AddDonorScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(screenStyles);
  const donorId = route.params?.donorId;
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(Boolean(donorId));

  useEffect(() => {
    if (!donorId) return;
    Promise.all([getDonorById(donorId), getDonorCredentialUsername(donorId)]).then(([row, username]) => setDonor({ ...row, account_username: username })).finally(() => setLoading(false));
  }, [donorId]);

  if (loading) return <View style={styles.page}><ActivityIndicator color={colors.green} style={{ marginTop: 40 }} /></View>;

  return <DonorForm initialValues={donor} submitLabel={donorId ? 'Save changes' : 'Save donor'} onSubmit={async (values) => {
    let savedDonorId = donorId;
    if (donorId) {
      await updateDonor(donorId, values);
    } else {
      const result = await createDonor(values);
      savedDonorId = result.lastInsertRowId;
    }
    try {
      if (values.account_username.trim() && values.account_password) {
        await saveDonorCredential(savedDonorId, values.account_username, values.account_password);
      }
    } catch (error) {
      if (!donorId) await deleteDonor(savedDonorId);
      throw error;
    }
    if (donorId) navigation.goBack();
    else navigation.replace('DonorDetails', { donorId: savedDonorId });
  }} />;
}

const screenStyles = { page: { flex: 1, backgroundColor: '#F5F8F6' } };
