import { Controller, Get, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Controller("health")
export class HealthController {
  // Liveness only. Database readiness is deliberately not implied.
  @Get()
  health() {
    return { status: "ok" };
  }
}

@Module({
  controllers: [HealthController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
