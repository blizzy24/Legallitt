import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.controller";
import { PrismaService } from "../prisma.service";
import {activeAt, newest} from '../payments/price-quotes';
import {isServiceOffered} from '@legalitt/shared';
// Q79/Q113: hidden services (HIDDEN_SERVICES) are omitted from the list and their
// price lookup, like an inactive service. Their existing cases are unaffected.
@Controller("api/v1/services")
@UseGuards(AuthGuard)
export class ServicesController {
  constructor(private readonly prisma: PrismaService) {}
  @Get() async list() {
    const services = await (await this.prisma.getClient()).service.findMany({
      where: { active: true },
      orderBy: { code: "asc" },
    });
    return services.filter((s) => isServiceOffered(s.code));
  }
  @Get(":code") async one(@Param("code") code: string) {
    if (!isServiceOffered(code)) throw new NotFoundException("Service not found");
    const db = await this.prisma.getClient();
    const service = await db.service.findFirst({
      where: { code, active: true },
    });
    if (!service) throw new NotFoundException("Service not found");
    const now = new Date();
    const policy = await db.feePolicy.findFirst({where: {service_code: code, confirmed: true, ...activeAt(now)}, orderBy: newest});
    const pricing = await db.servicePricing.findMany({
      where: {
        service_code: code,
        ...(policy ? {confirmed: true, fee_policy_id: policy.id} : {}),
        effective_from: { lte: now },
        OR: [{ effective_to: null }, { effective_to: { gt: now } }],
      },
      orderBy: { effective_from: "desc" },
    });
    return {
      ...service,
      pricing_mode: ['district_court','high_court'].includes(code)&&await db.courtPolicy.findFirst({where:{service_code:code,effective_from:{lte:now}}})?'representation_advance':policy?.pricing_mode ?? 'unconfirmed',
      pricing: pricing.map((p) => ({
        ...p,
        base_amount_paise: p.base_amount_paise.toString(),
      })),
    };
  }
}
