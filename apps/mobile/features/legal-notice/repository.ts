import type { ApiClient } from '@legalitt/shared';
import { backend } from '../../lib/auth';

/** Legal Notice operations only. Views consume controller data and callbacks. */
export type NoticeRepository = Pick<ApiClient,
  'service' | 'case' | 'cases' | 'requests' | 'createCase' | 'saveIntake' |
  'generateNoticeSubject' | 'generateNoticeDemands' |
  'submit' | 'pay' | 'accept' | 'start' | 'decline' | 'saveDraft' | 'renderDraft' | 'sendDraft' |
  'approve' | 'requestChanges' | 'dispatch' | 'presign' | 'upload' |
  'documentUrl' | 'deleteDocument' | 'saveShipment' | 'bookShipment' | 'receiveShipment' | 'caseThread' | 'messages' | 'sendMessage' | 'readMessages'
>;

export const apiNoticeRepository: NoticeRepository = backend;
