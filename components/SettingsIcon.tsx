import {
  BadgeCheck,
  Banknote,
  Bell,
  ChevronRight,
  Clock,
  Coins,
  CreditCard,
  FileText,
  Files,
  Languages,
  Lock,
  MessageSquare,
  Mic,
  LogIn,
  UserRound,
  Users,
  Video,
} from 'lucide-react-native';

/** Icon lookup for the advocate settings rows (designs 245–260). */
const MAP = {
  user: UserRound,
  badge: BadgeCheck,
  lock: Lock,
  login: LogIn,
  docs: Files,
  file: FileText,
  users: Users,
  bell: Bell,
  chat: MessageSquare,
  coins: Coins,
  clock: Clock,
  video: Video,
  mic: Mic,
  lang: Languages,
  card: CreditCard,
  bank: Banknote,
  chevron: ChevronRight,
} as const;

export type SettingsIconName = keyof typeof MAP;

export default function SettingsIcon({
  name,
  size,
  color,
}: {
  name: string;
  size: number;
  color: string;
}) {
  const Icon = MAP[(name as SettingsIconName) in MAP ? (name as SettingsIconName) : 'user'];
  return <Icon size={size} color={color} strokeWidth={1.8} />;
}
