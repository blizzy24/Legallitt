import { SteppingMark } from './LegalittLoader';
import { loader as l } from '../constants/theme';

// The compact loader: the Legalitt mark turning in steps (components/LegalittLoader).
// It replaces the indeterminate ring design/29 drew on "Waiting for payment…".
export default function Spinner({ size = l.spinner }: { size?: number }) {
  return <SteppingMark size={size} />;
}
