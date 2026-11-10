import type {FirApproval} from '@legalitt/shared';
export function firApproval(events: {type: string; created_at: Date; payload: unknown}[]): FirApproval | null {
  const sent = events.filter(e=>e.type==='fir_draft_submitted').sort((a,b)=>(b.payload as {version:number}).version-(a.payload as {version:number}).version)[0];
  if (!sent) return null;
  const p = sent.payload as {draft_id: string; version: number; document_id: string};
  const approved = events.find(e => e.type === 'fir_draft_approved'&&(e.payload as {draft_id?:string}).draft_id===p.draft_id);
  return {...p, submitted_at: sent.created_at.toISOString(), approved_at: approved?.created_at.toISOString() ?? null};
}
