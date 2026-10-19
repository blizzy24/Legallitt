// Messages (design/142 and design/143).
//
// The conversation list reuses the advocate records in data/advocates.ts rather than
// carrying its own copies: a conversation holds an advocate ID and the thread looks
// the name, initials and location up. Only Legalitt Support, which is not an
// advocate, carries its own display fields.
//
// design/142 introduces a third advocate, Adv. Rohan Mehta, who was not in
// SAVED_ADVOCATES. He has been added there, to the existing record set, rather than
// defined here as a parallel record.

import { SAVED_ADVOCATES } from './advocates';

export type ConversationFilter = 'all' | 'unread' | 'advocates' | 'support';

export type Conversation = {
  id: string;
  /** Null for Legalitt Support, which has no advocate record. */
  advocateId: string | null;
  /** Used when advocateId is null. */
  name?: string;
  initials?: string;
  /** "Verified" for advocates, "Official" for support. */
  badge: 'verified' | 'official';
  online: boolean;
  timestamp: string;
  /** design/142 prefixes advocate rows with "Matter:" and support rows with nothing. */
  context: string;
  contextPrefixed: boolean;
  preview: string;
  unread: number;
  kind: 'advocate' | 'support';
};

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'adv-priya-sharma',
    advocateId: 'adv-priya-sharma',
    badge: 'verified',
    online: true,
    timestamp: '10:42 AM',
    context: 'Rahul Sharma vs. Amit Verma',
    contextPrefixed: true,
    preview: 'Please review the property documents…',
    unread: 2,
    kind: 'advocate',
  },
  {
    id: 'adv-neha-verma',
    advocateId: 'adv-neha-verma',
    badge: 'verified',
    online: false,
    timestamp: 'Yesterday',
    context: 'Ananya Singh vs. Rajesh Singh',
    contextPrefixed: true,
    preview: 'I have reviewed the documents you…',
    unread: 0,
    kind: 'advocate',
  },
  {
    id: 'legalitt-support',
    advocateId: null,
    name: 'Legalitt Support',
    initials: '✦',
    badge: 'official',
    online: false,
    timestamp: '08 Sep',
    context: 'Help Desk • Client Services',
    contextPrefixed: false,
    preview: 'Your representation request has been…',
    unread: 0,
    kind: 'support',
  },
  {
    id: 'adv-rohan-mehta',
    advocateId: 'adv-rohan-mehta',
    badge: 'verified',
    online: true,
    timestamp: '07 Sep',
    context: 'Vivek Jain vs. Mehta Traders',
    contextPrefixed: true,
    preview: 'Additional information is required for…',
    unread: 1,
    kind: 'advocate',
  },
];

export function conversationById(id: string): Conversation | undefined {
  return CONVERSATIONS.find((c) => c.id === id);
}

/** Display name, initials and location, resolved from the advocate record. */
export function conversationParty(c: Conversation) {
  const advocate = c.advocateId ? SAVED_ADVOCATES.find((a) => a.id === c.advocateId) : undefined;
  return {
    name: advocate?.name ?? c.name ?? 'Conversation',
    initials: advocate?.initials ?? c.initials ?? '?',
    /** design/143 shows just the city, where the advocate record holds city and state. */
    city: advocate ? advocate.location.split(',')[0].trim() : '',
  };
}

export const MESSAGES_FILTERS: { id: ConversationFilter; label: string }[] = [
  { id: 'all', label: 'All Chats' },
  { id: 'unread', label: 'Unread' },
  { id: 'advocates', label: 'Advocates' },
  { id: 'support', label: 'Support' },
];

export const MESSAGES_FOOTER = 'End-to-end encrypted lawyer-client privileged chat';

// ── Thread (design/143) ──────────────────────────────────────────────────────

export type ThreadMessage =
  | { kind: 'text'; mine: boolean; text: string; time: string; failed?: boolean }
  | {
      kind: 'document';
      mine: boolean;
      name: string;
      size: string;
      type: string;
      time: string;
    };

/** design/143 draws Priya Sharma's thread. The others open with just the divider. */
export const THREADS: Record<string, ThreadMessage[]> = {
  'adv-priya-sharma': [
    {
      kind: 'text',
      mine: false,
      text: 'Please upload the previous property agreement before our next discussion.',
      time: '10:42 AM',
    },
    { kind: 'text', mine: true, text: 'I have uploaded the agreement.', time: '10:45 AM' },
    {
      kind: 'document',
      mine: true,
      name: 'Property_Agreement.pdf',
      size: '1.8 MB',
      type: 'PDF Document',
      time: '10:46 AM',
    },
    {
      kind: 'text',
      mine: false,
      text: 'Thank you. I’ll review it and let you know if anything else is required.',
      time: '10:47 AM',
    },
    { kind: 'text', mine: true, text: 'I also have the previous court order.', time: '10:49 AM' },
    {
      kind: 'text',
      mine: true,
      text: 'Should I send the certified copy or the scan?',
      time: '10:49 AM',
      // The only failed-send state designed anywhere in the app.
      failed: true,
    },
  ],
};

export const THREAD_CONTEXT: Record<string, { matter: string; category: string }> = {
  'adv-priya-sharma': { matter: 'Rahul Sharma vs. Amit Verma', category: 'Property Dispute' },
  'adv-neha-verma': { matter: 'Ananya Singh vs. Rajesh Singh', category: 'Family Law' },
  'adv-rohan-mehta': { matter: 'Vivek Jain vs. Mehta Traders', category: 'Commercial Dispute' },
  'legalitt-support': { matter: 'Help Desk', category: 'Client Services' },
};
