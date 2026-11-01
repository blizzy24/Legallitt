import type { LegalNoticeForm } from '../../context/legalNotice';
import type { InvoiceLine, ServiceTier } from '../../data/legalNotice';

/** Presentation contract: no backend client or data-source flag. */
export type NoticeIntakeModel = {
  error?: string;
  back: () => void;
  form: LegalNoticeForm;
  update: (patch: Partial<LegalNoticeForm>) => void;
  updateClient: (patch: Partial<LegalNoticeForm['client']>) => void;
  updateNoticee: (patch: Partial<LegalNoticeForm['noticee']>) => void;
  continue: () => void;
  navigate: (path: string) => void;
  tiers: (Omit<ServiceTier, 'price'> & { price: number | null })[];
  invoice: { service: string; refId: string; requestId: string };
  invoiceLines: InvoiceLine[];
  summary: { client: string; noticeType: string; noticee: string[]; summary: string; documents: number };
};
