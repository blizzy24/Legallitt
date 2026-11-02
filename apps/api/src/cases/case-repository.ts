import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";
import { CaseStatusSchema } from "@legalitt/shared";
import { parse } from "../auth/auth.service";
import { PrismaService } from "../prisma.service";
import { caseScope, type CaseActor } from "./case-access";

const cursorSchema = z.strictObject({
  id: z.uuid(),
  created_at: z.iso.datetime(),
});
export const caseListSchema = z.strictObject({
  status: CaseStatusSchema.optional(),
  role: z.enum(["client", "advocate", "admin"]).optional(),
  cursor: z.string().max(1024).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const eventListSchema = z.strictObject({
  cursor: z
    .string()
    .regex(/^[1-9]\d{0,18}$/)
    .refine((v) => BigInt(v) <= 9223372036854775807n)
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

function decodeCursor(value: string) {
  let decoded: unknown;
  try {
    decoded = JSON.parse(Buffer.from(value, "base64url").toString());
  } catch {
    decoded = null;
  }
  return parse(cursorSchema, decoded);
}

@Injectable()
export class CaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async read(actor: CaseActor, id: string) {
    const db = await this.prisma.getClient();
    const record = await db.case.findFirst({
      where: { AND: [caseScope(actor), { id }] },
      include: {
        case_parties_case_id_relations: true,
        // The advocate's drawn facts (design 437) travel with the case; the id
        // alone would leave the card empty.
        advocate_id_relation:{select:{id:true,full_name:true,advocate_profiles_user_id_relations:{select:{
          years_experience:true,practice_areas:true,bar_council_number:true,enrolment_year:true,rating_avg:true,rating_count:true,
          verification:true,verified_at:true,city:true,state:true,photo_key:true,bio:true,courts:true,languages:true,education:true}}}},
        case_events_case_id_relations: { orderBy: { id: "asc" } },
        documents_case_id_relations: {
          where: { status: "uploaded" },
          orderBy: [{ created_at: "asc" }, { id: "asc" }],
        },
        shipments_case_id_relations: true,
        drafts_case_id_relations: {
          include: {
            draft_reviews_draft_id_relations: {
              orderBy: { created_at: "asc" },
            },
          },
          orderBy: { version: "asc" },
        },
      },
    });
    // Same response for a missing case and an inaccessible case.
    if (!record) throw new NotFoundException("Case not found");
    const {
      case_parties_case_id_relations: parties,
      advocate_id_relation: advocate,
      case_events_case_id_relations: events,
      documents_case_id_relations: documents,
      drafts_case_id_relations: allDrafts,
      shipments_case_id_relations: shipments,
      ...caseRecord
    } = record;
    // A client's first access to any draft version requires the advocate's
    // explicit send event. Unsaved/unsent revisions never leak through GET.
    const sent = new Set(
      events
        .filter(
          (e) =>
            e.to_status === "client_review" && e.from_status !== e.to_status,
        )
        .map((e) => (e.payload as { draft_id?: string }).draft_id),
    );
    const drafts = allDrafts.filter(
      (d) => actor.role !== "client" || sent.has(d.id),
    );
    const reviews = drafts.flatMap((d) => d.draft_reviews_draft_id_relations);
    const {advocate_profiles_user_id_relations: profile = null, ...advocateUser} = advocate ?? {};
    return { ...caseRecord, parties, advocate: advocate ? {...advocateUser, profile} : advocate, events, documents, drafts, reviews, shipments };
  }

  async list(actor: CaseActor, query: unknown) {
    const input = parse(caseListSchema, query);
    const cursor = input.cursor ? decodeCursor(input.cursor) : undefined;
    const db = await this.prisma.getClient();
    // role is a view filter only. A caller cannot assume another identity/role.
    const rows = await db.case.findMany({
      where: {
        AND: [
          caseScope(actor),
          ...(input.role && input.role !== actor.role
            ? [{ id: { in: [] } }]
            : []),
          ...(input.status ? [{ status: input.status }] : []),
          ...(cursor
            ? [
                {
                  OR: [
                    { created_at: { gt: new Date(cursor.created_at) } },
                    {
                      created_at: new Date(cursor.created_at),
                      id: { gt: cursor.id },
                    },
                  ],
                },
              ]
            : []),
        ],
      },
      orderBy: [{ created_at: "asc" }, { id: "asc" }],
      include: { advocate_id_relation: { select: { id: true, full_name: true } } },
      take: input.limit + 1,
    });
    const items = rows.slice(0, input.limit).map(({ advocate_id_relation: advocate, ...record }) => ({ ...record, advocate }));
    const last = items.at(-1);
    return {
      items,
      next_cursor:
        rows.length > input.limit && last
          ? Buffer.from(
              JSON.stringify({
                id: last.id,
                created_at: last.created_at.toISOString(),
              }),
            ).toString("base64url")
          : null,
    };
  }

  async events(actor: CaseActor, id: string, query: unknown) {
    const input = parse(eventListSchema, query);
    const db = await this.prisma.getClient();
    // Relation filtering keeps authorisation in the data query even if the case
    // is reassigned between checking existence and reading its events.
    if (
      !(await db.case.findFirst({
        where: { AND: [caseScope(actor), { id }] },
        select: { id: true },
      }))
    )
      throw new NotFoundException("Case not found");
    const rows = await db.caseEvent.findMany({
      where: {
        case_id: id,
        case_id_relation: { is: caseScope(actor) },
        ...(input.cursor ? { id: { gt: BigInt(input.cursor) } } : {}),
      },
      orderBy: { id: "asc" },
      take: input.limit + 1,
    });
    const items = rows.slice(0, input.limit);
    return {
      items,
      next_cursor:
        rows.length > input.limit ? items.at(-1)!.id.toString() : null,
    };
  }
}
