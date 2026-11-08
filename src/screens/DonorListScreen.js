import PlaceholderScreen from '../components/PlaceholderScreen';

export default function DonorListScreen({ navigation }) {
  return <PlaceholderScreen navigation={navigation} title="Donor Registry" description="Your locally saved donor list will appear here." nextSteps={["Search donors by name", "Filter by blood group and district", "Open a donor's details"]} />;
}
