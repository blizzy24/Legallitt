import type { ApiClient } from '@legalitt/shared';
import { backend } from '../../lib/auth';

/** Legal Notice operations only. Views consume controller data and callbacks. */
export type NoticeRepository = Pick<ApiClient,
  'service' | 'case' | 'cases' | 'requests' | 'createCase' | 'saveIntake' |
  'submit' | 'pay' | 'accept' | 'decline' | 'saveDraft' | 'sendDraft' |
  'approve' | 'requestChanges' | 'dispatch' | 'presign' | 'upload' |
  'documentUrl' | 'deleteDocument' | 'saveShipment' | 'bookShipment' | 'receiveShipment'
>;

export const apiNoticeRepository: NoticeRepository = backend;
