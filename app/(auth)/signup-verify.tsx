import OtpScreen from '../../components/OtpScreen';

// Sign-up verification (design/137). Identical to design/135 but for the header
// title and where it goes next, so it shares components/OtpScreen.tsx.
export default function SignupVerifyScreen() {
  return (
    <OtpScreen title="Sign Up" next="/(auth)/signup-success" changeTo="/(auth)/signup" />
  );
}
