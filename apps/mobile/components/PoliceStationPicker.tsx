import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, ink } from '../constants/theme';
import { POLICE_STATIONS } from '../data/policeStations';

export default function PoliceStationPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const matches = POLICE_STATIONS.filter(station => station.toLowerCase().includes(query.trim().toLowerCase()));
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Select police station" onPress={() => { setQuery(''); setOpen(true); }} style={styles.field}>
      <Text style={styles.value}>{value || 'Select Police Station'}</Text><ChevronDown size={20} color={ink.accent} />
    </Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: Math.max(20, insets.bottom) }]}>
          <Text style={styles.title}>Select Police Station</Text>
          <TextInput autoFocus accessibilityLabel="Search police stations" placeholder="Search station or city" value={query} onChangeText={setQuery} style={styles.search} />
          <ScrollView keyboardShouldPersistTaps="handled">
            {matches.map(station => <Pressable key={station} accessibilityRole="radio" accessibilityState={{ checked: value === station }} onPress={() => { onChange(station); setOpen(false); }} style={styles.option}>
              <Text style={styles.value}>{station}{value === station ? ' ✓' : ''}</Text>
            </Pressable>)}
            {!matches.length && <Text style={styles.empty}>No matching stations</Text>}
          </ScrollView>
          <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={styles.option}><Text style={styles.value}>Close</Text></Pressable>
        </View>
      </View>
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  field: { minHeight: 48, borderWidth: 1, borderColor: colors.brand, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  value: { fontFamily: font.appBody, fontSize: 14, color: colors.textPrimary, flexShrink: 1 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { backgroundColor: colors.card, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '75%' },
  title: { fontFamily: font.appSemi, fontSize: 20, color: colors.textPrimary },
  search: { fontFamily: font.appBody, fontSize: 16, padding: 14, borderWidth: 1, borderColor: colors.brand, borderRadius: 10, marginVertical: 16 },
  option: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.screenBg },
  empty: { padding: 20, fontFamily: font.appBody, color: colors.textBody },
});
