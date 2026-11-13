import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodGroupFilter({ selected = 'All', onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {BLOOD_GROUPS.map((group) => {
        const active = selected === group;
        return (
          <Pressable key={group} onPress={() => onSelect?.(group)} style={[styles.chip, active && styles.activeChip]}>
            <Text style={[styles.label, active && styles.activeLabel]}>{group}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  chip: { borderWidth: 1, borderColor: '#DCE6E0', borderRadius: 18, paddingVertical: 8, paddingHorizontal: 13, backgroundColor: '#FFFFFF' },
  activeChip: { borderColor: '#24775D', backgroundColor: '#24775D' },
  label: { color: '#52665D', fontSize: 13, fontWeight: '600' },
  activeLabel: { color: '#FFFFFF' },
});
