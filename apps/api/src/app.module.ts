import { ServicesController } from "./cases/services.controller";
import { NoticeController } from "./cases/notice.controller";
import { DocumentController } from "./documents/document.controller";
import { DocumentService } from "./documents/document.service";
import { DocumentStorage } from "./documents/document-storage";
import { FileInspector } from "./documents/file-inspector";
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
  controllers: [
    HealthController,
    AuthController,
    MeController,
    CaseController,
    NoticeController,
    ServicesController,
    DocumentController,
  ],
  providers: [
    PrismaService,
    AuthService,
    AuthGuard,
    CaseRepository,
    CaseStateMachine,
    DocumentService,
    DocumentStorage,
    FileInspector,
  ],
  exports: [PrismaService],
})
export class AppModule {}
