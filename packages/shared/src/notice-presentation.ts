/** Display labels only. Stored methods, document keys and event times stay unchanged. */
export const noticeMethodLabel = (method: string) => ({courier: 'Courier', email: 'Email', whatsapp: 'WhatsApp'}[method] ?? 'Delivery');
export function noticeDate(value?: string | null): string | undefined {
  if (!value || Number.isNaN(Date.parse(value))) return undefined;
  const date = new Date(value);
  return date.toLocaleDateString('en-GB', {timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric'}) + ', ' +
    date.toLocaleTimeString('en-US', {timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true});
}
export function noticeCalendarDate(value?: string | null): string | undefined {
  if (!value || Number.isNaN(Date.parse(value))) return undefined;
  return new Date(value).toLocaleDateString('en-GB', {timeZone:'Asia/Kolkata',day:'numeric',month:'short',year:'numeric'});
}
export function noticeDocumentLabel(doc: {kind?: string; slot_label?: string | null; filename?: string}): string {
  if (doc.kind === 'id_proof' || /^Identity[-_ ]proof/i.test(doc.filename ?? '')) return 'Identity proof (Aadhaar / PAN)';
  const labels: Record<string, string> = {legal_notice: 'Legal Notice PDF', notice_cheque: 'Cheque', notice_return_memo: 'Bank return memo', notice_booking_receipt: 'Courier booking receipt', notice_delivery_proof: 'Delivery proof', notice_reply: 'Reply received', notice_change_attachment: 'Requested changes attachment', notice_additional_document: 'Additional document'};
  return doc.slot_label || labels[doc.kind ?? ''] || 'Supporting document';
}
