import { StatusBar } from 'react-native';
import AppNavigation from './src/navigation/AppNavigation';

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <AppNavigation />
    </>
  );
}
