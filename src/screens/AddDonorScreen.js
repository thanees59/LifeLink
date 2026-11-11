import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import DonorForm from '../components/DonorForm';
import { createDonor, getDonorById, updateDonor } from '../database/donorTable';

export default function AddDonorScreen({ navigation, route }) {
  const donorId = route.params?.donorId;
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(Boolean(donorId));

  useEffect(() => {
    if (!donorId) return;
    getDonorById(donorId).then(setDonor).finally(() => setLoading(false));
  }, [donorId]);

  if (loading) return <View><ActivityIndicator color="#24775D" style={{ marginTop: 40 }} /></View>;

  return <DonorForm initialValues={donor} submitLabel={donorId ? 'Save changes' : 'Save donor'} onSubmit={async (values) => {
    if (donorId) {
      await updateDonor(donorId, values);
      navigation.goBack();
    } else {
      const result = await createDonor(values);
      navigation.replace('DonorDetails', { donorId: result.lastInsertRowId });
    }
  }} />;
}
