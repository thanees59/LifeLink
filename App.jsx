import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import AppNavigation from './src/navigation/AppNavigation.jsx';
import { getDatabase } from './src/database/database';

export default function App() {
  useEffect(() => {
    getDatabase().catch((error) => console.error('LifeLink database initialization failed:', error));
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <AppNavigation />
    </>
  );
}
