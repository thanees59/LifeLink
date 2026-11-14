import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen.jsx';
import DonorListScreen from '../screens/DonorListScreen.jsx';
import AddDonorScreen from '../screens/AddDonorScreen.jsx';
import DonorDetailsScreen from '../screens/DonorDetailsScreen.jsx';
import DonationHistoryScreen from '../screens/DonationHistoryScreen.jsx';
import AddDonationScreen from '../screens/AddDonationScreen.jsx';
import SettingsScreen from '../screens/SettingsScreen.jsx';
import DonorSignupRequestsScreen from '../screens/DonorSignupRequestsScreen.jsx';
import { Pressable, Text } from 'react-native';
import { useAuth } from '../auth/AuthContext.jsx';
import { useTheme, getNavigationTheme } from '../theme/ThemeContext.jsx';

const Stack = createNativeStackNavigator();

const screenOptions = (colors, onLogout) => ({
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' },
  contentStyle: { backgroundColor: colors.background },
  headerRight: () => <Pressable accessibilityRole="button" accessibilityLabel="Logout" onPress={onLogout} hitSlop={8} style={{ paddingVertical: 8, paddingLeft: 12 }}><Text style={{ color: colors.red, fontSize: 14, fontWeight: '700' }}>Logout</Text></Pressable>,
});

export default function AppNavigation() {
  const { role, donorId, signOut } = useAuth();
  const { mode, colors } = useTheme();
  return (
    <NavigationContainer theme={getNavigationTheme(mode)}>
      <Stack.Navigator initialRouteName={role === 'admin' ? 'Dashboard' : 'MyProfile'} screenOptions={screenOptions(colors, signOut)}>
        {role === 'admin' ? <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'LifeLink' }} /> : null}
        {role === 'admin' ? <Stack.Screen name="DonorRegistry" component={DonorListScreen} options={{ title: 'Donor Registry' }} /> : null}
        {role === 'admin' ? <Stack.Screen name="AddDonor" component={AddDonorScreen} options={({ route }) => ({ title: route.params?.donorId ? 'Edit Donor' : 'Add Donor' })} /> : null}
        {role === 'admin' ? <Stack.Screen name="DonorDetails" component={DonorDetailsScreen} options={{ title: 'Donor Details' }} /> : <Stack.Screen name="MyProfile" component={DonorDetailsScreen} initialParams={{ donorId }} options={{ title: 'My Profile' }} />}
        <Stack.Screen name="DonationHistory" component={DonationHistoryScreen} options={{ title: 'Donation History' }} />
        {role === 'admin' ? <Stack.Screen name="AddDonation" component={AddDonationScreen} options={({ route }) => ({ title: route.params?.donationId ? 'Edit Donation' : 'Add Donation' })} /> : null}
        {role === 'admin' ? <Stack.Screen name="DonorSignupRequests" component={DonorSignupRequestsScreen} options={{ title: 'Pending Registrations' }} /> : null}
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings & About' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
