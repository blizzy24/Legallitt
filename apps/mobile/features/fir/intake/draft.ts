// Opening the client's FIR draft from the landing (C1) and the explainer (C2).
import type {Href} from 'expo-router';
import {backend} from '../../../lib/auth';
import {DATA_SOURCE} from '../../../lib/data-source';

/**
 * The client's newest unsubmitted FIR request, or a new one when there is none
 * (flow C1 "creates or resumes the draft case"). Resolves null in fixture mode,
 * where the steps run without a saved case.
 */
export async function openFirDraft(): Promise<string | null> {
  return (await openFirDraftAt())?.caseId ?? null;
}
/** The same draft with the step the client last reached, so a saved request resumes where it stopped (flow C3). */
export async function openFirDraftAt(): Promise<{caseId: string; step: number} | null> {
  if (DATA_SOURCE !== 'api') return null;
  const page = await backend.cases(undefined, 'fir_draft');
  const drafts = page.items
    .filter(c => c.service_code === 'fir_draft' && c.status === 'draft')
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  if (drafts[0]) return {caseId: drafts[0].id, step: savedFirStep((drafts[0].details as {intake_step?: unknown} | null)?.intake_step)};
  return {caseId: (await backend.createCase({service_code: 'fir_draft'})).id, step: 1};
}
export const savedFirStep = (value: unknown) => Math.max(1, Math.min(5, Number(value) || 1));
/**
 * Where "Continue with Quick Submission" (C1) / "Send a FIR Draft" (C2) lands:
 * always Step 1 of the newest unsubmitted draft (or a new one). Every saved
 * entry is kept, so Continue walks forward through the filled steps.
 */
export async function openFirDraftHref(): Promise<Href> {
  const draft = await openFirDraftAt();
  return firStepHref(1, draft?.caseId);
}

/** /fir/stepN with the case and any extra params (returnTo=review). */
export function firStepHref(step: number, caseId?: string | null, extra: Record<string, string> = {}): Href {
  const query = new URLSearchParams({...(caseId ? {caseId} : {}), ...extra}).toString();
  return `/fir/step${step}${query ? `?${query}` : ''}` as Href;
}

/** Which step shows the Step 1–3 validation key (shared firIntakeErrors). */
export function firErrorStep(key: string): 1 | 2 | 3 {
  if (['fullName', 'mobile', 'email', 'type', 'state', 'district', 'policeStation', 'placeAddress', 'placeCity', 'placePin'].includes(key)) return 1;
  if (['date', 'time', 'location', 'description'].includes(key)) return 2;
  return 3;
}

export const FIR_STEP_NAMES = ['Basic Details', 'Incident Details', 'People Involved', 'Documents & Evidence', 'Review & Submit'] as const;
