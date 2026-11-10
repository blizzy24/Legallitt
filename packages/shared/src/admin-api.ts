import type { AdminCaseBucket, CaseStatus } from './lifecycle';
import type { ServiceCode } from './services';
export type AdminCaseQuery = {service?: ServiceCode; bucket?: AdminCaseBucket; search?: string; cursor?: string; limit?: number; queue?: 'approval'};
export type AdminCaseRow = {
  service_code: ServiceCode;
  id: string; reference: string;
  client: {id: string; name: string};
  matter_type: string | null;
  parties: {kind: string; name: string}[];
  advocate: {id: string; name: string} | null;
  documents: {client: number; admin: number; generated: number; advocate: number};
  simulated_documents: {client: number; admin: number; generated: number; advocate: number};
  simulated: boolean;
  status: CaseStatus; bucket: AdminCaseBucket;
  sub_status?: string | null; approval?: import('./fir').FirApproval | null;
  // The versioned base fee quoted to this case, not a hard-coded current rate.
  amount_paise: string | null;
  created_at: string;
};
export type AdminCasePage = {
  items: AdminCaseRow[]; next_cursor: string | null;
  counts: Record<AdminCaseBucket, number>; total: number; filtered_total: number;
  approval_waiting?: number;
};

export type AdminAdvocate = {
  id: string; name: string; practice_areas: string[]; city: string | null; open_cases: number;
};

export type AdminContact = {name: string | null; email: string | null; phone: string | null; address: string | null; relationship?: string | null; role: string;
  /** Sender only: the intake's introduction fields, as the notice prints them. */
  salutation?: string | null; age?: number | null; relation?: string | null; relative_name?: string | null};
export type AdminCaseDetail = {
  approval?: import('./fir').FirApproval | null;
  service_code: ServiceCode;
  id: string; reference: string; status: CaseStatus; sub_status: string | null;
  matter_type: string | null; tier: string | null; simulated: boolean; created_at: string;
  advocate_id: string | null; contacts: AdminContact[];
  pricing: {base_amount_paise: string; gst_bps: number; confirmed: boolean} | null;
  intake: Record<string, unknown>;
  events: {id: string; type: string; from_status: string | null; to_status: string | null;
    actor: {name: string; role: string | null} | null; source: string; payload: Record<string, unknown>; created_at: string}[];
  documents: {id: string; filename: string; kind: string; origin: 'client' | 'advocate' | 'admin' | 'generated';
    owner: string; status: string; mime_type: string; page_count: number | null; size_bytes: string;
    simulated: boolean; created_at: string; final: boolean; draft_version: number | null;
    identity_evidence?: import('./fir-identity').IdentityEvidence | null}[];
  drafts: {id: string; version: number; content: Record<string, unknown>; document_id: string | null;
    generated_by: string | null; author: string; created_at: string}[];
  payments: {id: string; purpose: string; base_amount_paise: string; gst_paise: string; total_paise: string;
    status: string; payer: {name: string; role: string}; simulated: boolean; created_at: string; captured_at: string | null}[];
  shipments: import('./shipments').ApiShipment[];
};
