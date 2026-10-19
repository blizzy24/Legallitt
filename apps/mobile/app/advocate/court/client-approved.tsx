import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CourtScreen, CourtSheet } from '../../../components/court/CourtKit';
import { advCourtClientApproved, advCourtPreFiling } from '../../../constants/theme';
import { COURT_CLIENT_APPROVED, COURT_PRE_FILING } from '../../../data/advocateCourt';

// Advocate — client approved (design/383): a sheet over the pre-filing review
// (382). Measured at 1.000 px/pt on a 2x upscale; the export is 408 wide with
// the sheet's shadow. ⚠ 383's dimmed background is a different screen,
// drawn nowhere else (see COURT_CLIENT_APPROVED). Continue opens 378.

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/advocate/court/pre-filing-review' as Href);
}

export default function AdvocateCourtClientApprovedScreen() {
  return (
    <View style={styles.fill}>
      <CourtScreen spec={COURT_PRE_FILING} tokens={advCourtPreFiling} />
      <CourtSheet blocks={COURT_CLIENT_APPROVED} tokens={advCourtClientApproved} onClose={close} />
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
