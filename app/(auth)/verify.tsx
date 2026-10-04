import OtpScreen from '../../components/OtpScreen';

// Login verification (design/135). SIX boxes, replacing the previous four-box screen.
// The screen itself is components/OtpScreen.tsx, shared with sign-up (design/137).
export default function VerifyScreen() {
  return <OtpScreen title="Login" next="/(auth)/role" changeTo="/(auth)/login" />;
}
