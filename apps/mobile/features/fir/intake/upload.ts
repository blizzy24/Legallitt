// One-file upload for the FIR Step 4 slots (flow C6). Handles the slot's accepted
// types and size limit before anything is sent, and passes the custom slot name.
// FIR collects no identity proof (ISHAAN-ANSWERS 2026-11-12 Q114).
import * as DocumentPicker from 'expo-document-picker';
import {Platform} from 'react-native';
import {documentMaxBytes, type ApiDocument, type PresignInput} from '@legalitt/shared';
import {backend} from '../../../lib/auth';

/** Documents as the API returns them for FIR (the shared type predates this column). */
export type FirDocument = ApiDocument & {slot_label?: string | null};

const BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', mp4: 'video/mp4', mp3: 'audio/mpeg',
};
const LABELS: Record<string, string> = {
  'application/pdf': 'PDF', 'image/jpeg': 'JPEG', 'image/png': 'PNG', 'video/mp4': 'MP4', 'audio/mpeg': 'MP3',
};
export const acceptLabel = (accept: readonly string[]) => accept.map(m => LABELS[m] ?? m).join(', ');

// Same rule as the API: metadata never carries a full 12-digit ID number.
const FULL_ID = /(?:^|[^\d])\d{4}[ -]?\d{4}[ -]?\d{4}(?!\d)/;
function safeFilename(name: string, kind: string, ext: string) {
  let clean = name.replace(/[\x00-\x1f\x7f/\\]/g, '_').replace(/\.{2,}/g, '.').replace(/\$\{/g, '').trim();
  if (clean.length > 120) clean = clean.slice(-120);
  if (!clean || FULL_ID.test(clean)) clean = `${kind.replace(/_/g, '-')}-document${ext ? `.${ext}` : ''}`;
  return clean;
}

export type UploadOptions = {
  caseId: string;
  kind: string;
  accept: readonly string[];
  slotLabel?: string;
};

/** Lets the person choose one file and uploads it. Resolves null when they cancel. */
export async function pickAndUpload(o: UploadOptions): Promise<FirDocument | null> {
  const picked = await DocumentPicker.getDocumentAsync({type: [...o.accept], copyToCacheDirectory: true, multiple: false});
  if (picked.canceled || !picked.assets?.length) return null;
  const file = picked.assets[0]!;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mime = file.mimeType && o.accept.includes(file.mimeType) ? file.mimeType : BY_EXTENSION[ext] ?? file.mimeType ?? '';
  if (!o.accept.includes(mime)) throw new Error(`${file.name} can’t be added here. Choose a ${acceptLabel(o.accept)} file.`);
  const max = documentMaxBytes(mime);
  if (file.size && file.size > max) throw new Error(`${file.name} is larger than ${Math.round(max / 1_000_000)} MB. Choose a smaller file.`);
  const ticket = await backend.presign({
    case_id: o.caseId,
    kind: o.kind,
    filename: safeFilename(file.name, o.kind, ext),
    mime: mime as PresignInput['mime'],
    ...(o.slotLabel ? {slot_label: o.slotLabel} : {}),
  });
  const webFile = (file as {file?: File}).file;
  const body = Platform.OS === 'web'
    ? webFile ?? await (await fetch(file.uri)).blob()
    : {uri: file.uri, name: ticket.document.filename, type: mime};
  return await backend.upload(ticket, body) as FirDocument;
}
