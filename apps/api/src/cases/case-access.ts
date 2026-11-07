import { ForbiddenException } from "@nestjs/common";
import type { Prisma } from "../generated/prisma/client";
import type { ServiceCode } from '@legalitt/shared';

export type CaseActor = {
  id: string;
  trigger?: "system";
  source?: "simulated";
  role: "client" | "advocate" | "admin";
};

// Every repository query starts with this predicate. Query parameters never
// supply identity or broaden this scope. Unassigned cases are not advocate-visible.
export function caseScope(actor: CaseActor, service?: ServiceCode): Prisma.CaseWhereInput {
  // Service is an optional narrowing filter, never an alternative to ownership.
  const filter = service ? {service_code: service} : {};
  if (actor.role === "client")
    return { ...filter, client_id: actor.id };
  if (actor.role === "advocate")
    return { ...filter, advocate_id: actor.id };
  if (actor.role === "admin") return filter;
  throw new ForbiddenException("Role not permitted");
}
