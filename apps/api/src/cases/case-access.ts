import { ForbiddenException } from "@nestjs/common";
import type { Prisma } from "../generated/prisma/client";

export type CaseActor = {
  id: string;
  role: "client" | "advocate" | "admin";
};

// Every repository query starts with this predicate. Query parameters never
// supply identity or broaden this scope. Unassigned cases are not advocate-visible.
export function caseScope(actor: CaseActor): Prisma.CaseWhereInput {
  if (actor.role === "client")
    return { service_code: "legal_notice", client_id: actor.id };
  if (actor.role === "advocate")
    return { service_code: "legal_notice", advocate_id: actor.id };
  if (actor.role === "admin") return { service_code: "legal_notice" };
  throw new ForbiddenException("Role not permitted");
}
