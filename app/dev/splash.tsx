import { useLocalSearchParams } from 'expo-router';

import AnimatedSplash from '../../components/AnimatedSplash';
import { DEV_PREVIEW_TOGGLES } from '../../constants/dev';

// DEVELOPMENT ONLY — the animated splash on its own. ?t=1.2 holds the timeline at
// that second (for the screenshot checks); without it the splash runs and stays.
export default function DevSplashScreen() {
  const { t } = useLocalSearchParams<{ t?: string }>();
  if (!DEV_PREVIEW_TOGGLES) return null;
  return <AnimatedSplash ready={false} warm={false} freezeAt={t === undefined ? undefined : Number(t)} onMounted={() => {}} onDone={() => {}} />;
}
