import { Controller, Get, Module } from "@nestjs/common";
import { AuthService } from "./auth/auth.service";
import {
  AuthController,
  AuthGuard,
  MeController,
} from "./auth/auth.controller";
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
  controllers: [HealthController, AuthController, MeController],
  providers: [PrismaService, AuthService, AuthGuard],
  exports: [PrismaService],
})
export class AppModule {}
