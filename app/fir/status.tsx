import { StyleSheet, Text, View } from 'react-native';

import ServiceHeader from '../../components/ServiceHeader';
import { colors, firShell as f, font, space } from '../../constants/theme';

// Placeholder — screen to come (design/47, 48, 49 build in a later group).
export default function FirStatusScreen() {
  return (
    <View style={styles.screen}>
      <ServiceHeader title="Request Status" />
      <View style={styles.body}>
        <Text style={styles.text}>Request Status</Text>
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
