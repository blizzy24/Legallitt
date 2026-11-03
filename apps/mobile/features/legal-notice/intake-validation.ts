import { LegalNoticeSubmissionSchema, LegalDemandSchema } from '@legalitt/shared';
import type { LegalNoticeForm } from '../../context/legalNotice';

export function validateNoticeStep(stage: string, form: LegalNoticeForm) {
  if (stage === 'step3' && (!form.issueType || !form.subjectMatter.trim()))
    throw new Error('Choose a notice type and enter the subject matter in dispute.');
  if (stage === 'step2') LegalNoticeSubmissionSchema.shape.noticee.parse(form.noticee);
  if (stage === 'step1') {
    const {age, salutation: _s, relation: _r, relativeName: _n, ...client} = form.client;
    LegalNoticeSubmissionSchema.shape.client.parse(client);
    if (age && (!Number.isSafeInteger(Number(age)) || Number(age) <= 0))
      throw new Error('Enter age as a positive whole number.');
  }
  if (stage === 'demand') {
    const demand = LegalDemandSchema.parse(form.legalDemand);
    if (!demand.selected.length && !demand.custom) throw new Error('Choose a legal demand or write your own.');
  }
}
