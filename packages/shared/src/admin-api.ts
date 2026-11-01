import type { AdminCaseBucket, CaseStatus } from './lifecycle';
import type { ServiceCode } from './services';
export type AdminCaseQuery = {service?: ServiceCode; bucket?: AdminCaseBucket; search?: string; cursor?: string; limit?: number};
export type AdminCaseRow = {
  id: string; reference: string;
  client: {id: string; name: string};
  matter_type: string | null;
  parties: {kind: string; name: string}[];
  advocate: {id: string; name: string} | null;
  documents: {client: number; admin: number; generated: number; advocate: number};
  simulated_documents: {client: number; admin: number; generated: number; advocate: number};
  simulated: boolean;
  status: CaseStatus; bucket: AdminCaseBucket;
  // The versioned base fee quoted to this case, not a hard-coded current rate.
  amount_paise: string | null;
  created_at: string;
};
export type AdminCasePage = {
  items: AdminCaseRow[]; next_cursor: string | null;
  counts: Record<AdminCaseBucket, number>; total: number; filtered_total: number;
};

export type AdminAdvocate = {
  id: string; name: string; practice_areas: string[]; city: string | null; open_cases: number;
};
