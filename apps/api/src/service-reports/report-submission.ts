import {BadRequestException} from '@nestjs/common';
import {isReportService, reportIntakeProblems} from '@legalitt/shared';
import type {Prisma} from '../generated/prisma/client';

/** Submission gate, called by CaseStateMachine before draft → submitted. Kept
 *  free of service imports so the state machine can depend on it. */
export async function assertReportSubmittable(tx: Prisma.TransactionClient, record: {id: string; service_code: string; details: unknown; tier: string | null}) {
  if (!isReportService(record.service_code)) return;
  const documents = await tx.document.findMany({where: {case_id: record.id, status: 'uploaded'}, select: {kind: true}});
  const problems = reportIntakeProblems(record.service_code, record.details, record.tier, documents);
  if (problems.length) throw new BadRequestException({message: problems.map(p => p.message).join('\n'), issues: problems});
}
