import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.controller";
import { PrismaService } from "../prisma.service";
@Controller("api/v1/services")
@UseGuards(AuthGuard)
export class ServicesController {
  constructor(private readonly prisma: PrismaService) {}
  @Get() async list() {
    return (await this.prisma.getClient()).service.findMany({
      where: { active: true },
      orderBy: { code: "asc" },
    });
  }
  @Get(":code") async one(@Param("code") code: string) {
    const db = await this.prisma.getClient();
    const service = await db.service.findFirst({
      where: { code, active: true },
    });
    if (!service) throw new NotFoundException("Service not found");
    const now = new Date();
    const pricing = await db.servicePricing.findMany({
      where: {
        service_code: code,
        effective_from: { lte: now },
        OR: [{ effective_to: null }, { effective_to: { gt: now } }],
      },
      orderBy: { effective_from: "desc" },
    });
    return {
      ...service,
      pricing: pricing.map((p) => ({
        ...p,
        base_amount_paise: p.base_amount_paise.toString(),
      })),
    };
  }
}
