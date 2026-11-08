import PlaceholderScreen from '../components/PlaceholderScreen';

export default function DonorDetailsScreen({ navigation }) {
  return <PlaceholderScreen navigation={navigation} title="Donor Details" description="A selected donor's profile and donation history will be shown here." nextSteps={["Review donor information", "Edit or remove a donor record", "View this donor's previous donations"]} />;
}
