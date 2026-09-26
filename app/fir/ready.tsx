import { StyleSheet, Text, View } from 'react-native';

import ServiceHeader from '../../components/ServiceHeader';
import { colors, firShell as f, font, space } from '../../constants/theme';

// Placeholder — screen to come (design/47, 48, 49 build in a later group).
export default function FirReadyScreen() {
  return (
    <View style={styles.screen}>
      <ServiceHeader title="FIR Draft Ready" />
      <View style={styles.body}>
        <Text style={styles.text}>FIR Draft Ready</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: f.bg,
  },
  body: {
    padding: space.screenX,
    alignItems: 'center',
  },
  text: {
    fontFamily: font.appSemi,
    fontSize: f.titleSize,
    color: colors.textBody,
  },
});
