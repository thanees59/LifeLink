import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import DonorListScreen from '../screens/DonorListScreen';
import AddDonorScreen from '../screens/AddDonorScreen';
import DonorDetailsScreen from '../screens/DonorDetailsScreen';
import DonationHistoryScreen from '../screens/DonationHistoryScreen';
import AddDonationScreen from '../screens/AddDonationScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#FFFFFF' },
  headerTintColor: '#173B32',
  headerTitleStyle: { fontWeight: '700' },
  contentStyle: { backgroundColor: '#F5F8F6' },
};

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard" screenOptions={screenOptions}>
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'LifeLink' }} />
        <Stack.Screen name="DonorRegistry" component={DonorListScreen} options={{ title: 'Donor Registry' }} />
        <Stack.Screen name="AddDonor" component={AddDonorScreen} options={{ title: 'Add Donor' }} />
        <Stack.Screen name="DonorDetails" component={DonorDetailsScreen} options={{ title: 'Donor Details' }} />
        <Stack.Screen name="DonationHistory" component={DonationHistoryScreen} options={{ title: 'Donation History' }} />
        <Stack.Screen name="AddDonation" component={AddDonationScreen} options={{ title: 'Add Donation' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings & About' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
