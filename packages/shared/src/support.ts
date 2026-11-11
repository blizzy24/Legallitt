import type {ServiceCode} from './services';

// D-26 Contact Support (profile-21). Subject options are not drawn beyond the
// "Select an issue" placeholder; this list is D-57.
export const SUPPORT_SUBJECTS = [
  {code: 'payment', label: 'Payment or refund question'},
  {code: 'case_progress', label: 'Question about my case progress'},
  {code: 'documents', label: 'Documents or uploads'},
  {code: 'advocate', label: 'My advocate'},
  {code: 'account', label: 'Account or sign-in'},
  {code: 'app_problem', label: 'Something isn’t working in the app'},
  {code: 'other', label: 'Something else'},
] as const;
export const SUPPORT_RELATED_TO = [
  {code: 'case', label: 'Case'}, {code: 'consultation', label: 'Consultation'}, {code: 'payment', label: 'Payment'},
  {code: 'account', label: 'Account'}, {code: 'other', label: 'Other Legal Assistance'},
] as const;
export const SUPPORT_CONTACT_METHODS = [
  {code: 'chat', label: 'Chat', hint: 'In-App'}, {code: 'email', label: 'Email', hint: 'Default'}, {code: 'phone', label: 'Phone', hint: 'Direct Call'},
] as const;

export type SupportMessageView = {id: string; body: string; from: 'support' | 'requester'; mine: boolean; created_at: string; read_at: string | null};
export type SupportTicketView = {
  id: string; kind: 'ticket' | 'callback' | 'chat'; status: 'open' | 'closed';
  subject: string | null; related_to: string | null; contact_method: string | null;
  contact_name: string | null; contact_phone: string | null; case_id: string | null;
  /** Service screen the request came from (Request Chat / Request Callback), e.g. fir_draft. */
  service_code?: string | null;
  created_at: string; closed_at: string | null; messages: SupportMessageView[];
};
export type SupportAdminTicket = SupportTicketView & {
  description: string | null;
  requester: {id: string; name: string; email: string | null; phone: string | null; role: string};
  case: {id: string; reference: string; service_code: string} | null;
};
export type SupportInboxRow = {
  id: string; kind: 'ticket' | 'callback' | 'chat'; status: 'open' | 'closed'; subject: string | null;
  service_code?: string | null;
  requester: {id: string; name: string; role: string};
  last_message: string | null; created_at: string;
  /** Oldest requester message not yet answered by support; null when answered or closed. */
  waiting_since: string | null; unread: number;
};

/** D-28: one row per case conversation or support request. */
export type MessagesInboxItem = {
  kind: 'case' | 'support'; key: string;
  case_id: string | null; thread_id: string | null; ticket_id: string | null;
  title: string; verified: boolean; reference: string | null; service_code: ServiceCode | null;
  matter_type: string | null; matter: string | null; status: string;
  last_message: {body: string | null; attachment: string | null; mine: boolean; created_at: string} | null;
  unread: number;
};
export type ThreadMessage = {
  id: string; thread_id: string; sender_id: string; body: string | null; document_id: string | null; created_at: string; read_at: string | null;
  document?: {id: string; filename: string; mime_type: string; size_bytes: string} | null;
};

/** D-01 replacement for the drawn "end-to-end encrypted privileged chat" line. */
export const MESSAGES_PRIVACY_LINE = 'Messages are private to you, your advocate and Legalitt support.';
