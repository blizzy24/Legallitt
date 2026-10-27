import {useAdvocateNoticeModel} from '../../../features/legal-notice/useAdvocateNoticeModel';
import NoticeResponseScreen from '../../../components/NoticeResponseScreen';

// Advocate — legal notice response editor (design/267).
//
// ⚠ WHY THIS IS A SECOND ROUTE. design/189's response screen is already built
// at app/advocate/notice/[id]/response.tsx. A pixel diff of 267 against 189
// found them identical above the footer — same header, same rich-text toolbar,
// same letterhead and printed body, to sub-pixel anti-aliasing — and different
// only in the footer: 189 has Edit Draft / Save & Upload and a FILLED "Share
// for Review"; 267 has Back / Confirm & Upload and an OUTLINED "Generate Draft
// with AI". One component, two variants.
//
// ⚠ ELEVENTH AI SURFACE IN THIS APP. "Generate Draft with AI" is drawn and does
// nothing. No model, no request, no generated text.
//
// STATIC, NOT WIRED: the rich-text toolbar (Paragraph / B / I / U / lists /
// undo / redo) is inert. No editor engine is specified anywhere in the designs.
export default function AdvocateNoticeResponseEditorScreen() {
  const model=useAdvocateNoticeModel('response');
  return <NoticeResponseScreen variant="generate" caseId={model.controller.id??'ln-2026-1048'}
    data={model.data.ADV_NOTICE_RESPONSE} fields={model.documentFields} navigate={model.navigate} onSave={model.onSaveDraft} />;
}
