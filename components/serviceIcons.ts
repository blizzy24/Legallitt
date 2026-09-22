import {
  Blend,
  ClipboardList,
  CreditCard,
  FileText,
  House,
  Landmark,
  MessageCircle,
  MessageSquare,
  PenLine,
  ShieldCheck,
  SquarePen,
  UserCheck,
  type LucideIcon,
} from 'lucide-react-native';

import type { ServiceIconKey } from '../data/services';

// Service chips use lucide outline icons. The filled tab bar icons come from
// @expo/vector-icons (MaterialCommunityIcons) — see components/TabBar.tsx.
export const SERVICE_ICONS: Record<ServiceIconKey, LucideIcon> = {
  'message-circle': MessageCircle,
  'message-square': MessageSquare,
  'file-text': FileText,
  'clipboard-list': ClipboardList,
  'pen-line': PenLine,
  'credit-card': CreditCard,
  house: House,
  'shield-check': ShieldCheck,
  blend: Blend,
  landmark: Landmark,
  'user-check': UserCheck,
  'square-pen': SquarePen,
};

export const serviceIcon = (key: ServiceIconKey): LucideIcon => SERVICE_ICONS[key];
