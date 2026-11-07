import { z } from 'zod';
import { ServiceCodeSchema } from './entities';
import { LegalNoticeIntakeSchema, LegalNoticeMatterTypeSchema, LegalNoticeTierSchema } from './legal-notice';

// Existing notice intake is unchanged. Other services can create an empty spine;
// their intake contracts/workflows must be implemented separately.
export const CreateNoticeCaseSchema = z.strictObject({
  service_code: z.literal('legal_notice'),
  tier: LegalNoticeTierSchema.optional(),
  details: LegalNoticeIntakeSchema.default({}),
  matter_type: LegalNoticeMatterTypeSchema.nullable().optional(),
});
export const CreateCaseSchema = z.union([
  CreateNoticeCaseSchema,
  z.strictObject({service_code: ServiceCodeSchema.exclude(['legal_notice'])}),
]);
export type CreateCaseInput = z.input<typeof CreateCaseSchema>;
