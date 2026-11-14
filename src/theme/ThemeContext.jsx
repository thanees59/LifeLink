import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, StyleSheet } from 'react-native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { getDatabase } from '../database/database';

const ThemeContext = createContext(null);

const colors = {
  light: {
    background: '#F5F8F6', surface: '#FFFFFF', text: '#173B32', muted: '#65766F',
    subtle: '#52665D', border: '#DCE6E0', line: '#EDF1EE', soft: '#E6F3ED',
    softRed: '#FCE9E9', mutedSurface: '#F1EFEB', green: '#24775D', greenDark: '#173B32',
    greenHero: '#285447', greenHeroText: '#D3E2DB', greenEyebrow: '#B8DFCB',
    mutedGreen: '#8A9A93', statusGreen: '#82D2A6', red: '#B33E42', redBorder: '#E7C5C5',
  },
  dark: {
    background: '#101820', surface: '#1B2631', text: '#F2F5F7', muted: '#B0BEC5',
    subtle: '#CFD8DC', border: '#394957', line: '#34424E', soft: '#203C39',
    softRed: '#402A30', mutedSurface: '#303943', green: '#FF4D5A', greenDark: '#17232D',
    greenHero: '#24343F', greenHeroText: '#D7E0E5', greenEyebrow: '#FF9AA1',
    mutedGreen: '#9BAAB2', statusGreen: '#79D6A3', red: '#FF6872', redBorder: '#70434A',
  },
};

const colorMap = {
  '#F5F8F6': 'background', '#FFFFFF': 'surface', '#173B32': 'text', '#65766F': 'muted',
  '#52665D': 'subtle', '#DCE6E0': 'border', '#EDF1EE': 'line', '#E6F3ED': 'soft',
  '#FCE9E9': 'softRed', '#F1EFEB': 'mutedSurface', '#24775D': 'green', '#285447': 'greenHero',
  '#D3E2DB': 'greenHeroText', '#B8DFCB': 'greenEyebrow', '#8A9A93': 'mutedGreen',
  '#82D2A6': 'statusGreen', '#B33E42': 'red', '#E7C5C5': 'redBorder',
};

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState('system');
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme() ?? 'light');
  useEffect(() => {
    let active = true;
    getDatabase().then((db) => db.getFirstAsync("SELECT value FROM app_settings WHERE key = 'theme'")).then((row) => {
      if (active && ['light', 'dark', 'system'].includes(row?.value)) setPreferenceState(row.value);
    }).catch(() => {});
    const subscription = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(colorScheme ?? 'light'));
    return () => { active = false; subscription.remove(); };
  }, []);

  const setPreference = useCallback(async (value) => {
    if (!['light', 'dark', 'system'].includes(value)) return;
    const db = await getDatabase();
    await db.runAsync('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', 'theme', value);
    setPreferenceState(value);
  }, []);

  const mode = preference === 'system' ? systemScheme : preference;
  const value = useMemo(() => ({ preference, setPreference, mode, colors: colors[mode] }), [preference, setPreference, mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used inside ThemeProvider');
  return theme;
}

export function useThemedStyles(baseStyles) {
  const { colors: palette } = useTheme();
  return useMemo(() => {
    const replaceColors = (value, property = '') => {
      if (typeof value === 'string') {
        if (value.toUpperCase() === '#FFFFFF' && property === 'color') return value;
        if (value.toUpperCase() === '#173B32' && property === 'backgroundColor') return palette.greenDark;
        const token = colorMap[value.toUpperCase()];
        return token ? palette[token] : value;
      }
      if (Array.isArray(value)) return value.map((item) => replaceColors(item, property));
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceColors(item, key)]));
      return value;
    };
    return StyleSheet.create(replaceColors(baseStyles));
  }, [baseStyles, palette]);
}

export function getNavigationTheme(mode) {
  const dark = mode === 'dark';
  const baseTheme = dark ? DarkTheme : DefaultTheme;
  return {
    ...baseTheme,
    dark,
    colors: {
      ...baseTheme.colors,
      primary: dark ? colors.dark.green : colors.light.green,
      background: dark ? colors.dark.background : colors.light.background,
      card: dark ? colors.dark.surface : colors.light.surface,
      text: dark ? colors.dark.text : colors.light.text,
      border: dark ? colors.dark.border : colors.light.border,
      notification: dark ? colors.dark.red : colors.light.red,
    },
  };
}
