import PlaceholderScreen from '../components/PlaceholderScreen';

export default function AddDonationScreen({ navigation }) {
  return <PlaceholderScreen navigation={navigation} title="Add a Donation" description="A form for recording a donation event will be added in a later step." nextSteps={["Choose an existing donor", "Enter date and location", "Add optional notes"]} />;
}
