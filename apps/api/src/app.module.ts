import { Controller, Get, Module } from "@nestjs/common";
import { AuthService } from "./auth/auth.service";
import {
  AuthController,
  AuthGuard,
  MeController,
} from "./auth/auth.controller";
import { PrismaService } from "./prisma.service";
import { CaseController } from "./cases/case.controller";
import { CaseRepository } from "./cases/case-repository";
import { CaseStateMachine } from "./cases/case-state-machine";

@Controller("health")
export class HealthController {
  // Liveness only. Database readiness is deliberately not implied.
  @Get()
  health() {
    return { status: "ok" };
  }
}

@Module({
  controllers: [HealthController, AuthController, MeController, CaseController],
  providers: [
    PrismaService,
    AuthService,
    AuthGuard,
    CaseRepository,
    CaseStateMachine,
  ],
  exports: [PrismaService],
})
export class AppModule {}
