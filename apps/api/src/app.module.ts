import { AiModule } from './ai/ai.module';
import { NoticeIntakeAiController } from './cases/notice-intake-ai';
import {AdminCaseDetailRepository} from './admin-cases/admin-case-detail';
import {AdminAdvocatesController, AdminAdvocatesRepository} from './admin-cases/admin-advocates';
import {AdminCasesController} from './admin-cases/admin-cases.controller';
import {AdminCasesRepository} from './admin-cases/admin-cases.repository';
import {NoticeMessages,NoticeMessagesController} from './cases/notice-messages';
import { CourierModule } from "./courier/courier.module";
import { ShipmentService } from "./cases/shipment.service";
import { NoticePdfService } from "./cases/notice-pdf.service";
import { AdminUiModule } from "./admin-ui/admin-ui.module";
import { DemoModule } from "./demo/demo.module";
import { DatabaseModule } from "./database.module";
import { PaymentsModule } from './payments/payments.module';
import { PaymentsService } from './payments/payments.service';
import { PaymentsController } from './payments/payments.controller';
import { NotificationsModule } from './notifications/notifications.module';
import { PhoneAuthModule } from "./phone-auth/phone-auth.module";
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
  imports: [AiModule, CourierModule, AdminUiModule, DemoModule, DatabaseModule, PhoneAuthModule, PaymentsModule, NotificationsModule],
  controllers: [NoticeIntakeAiController, AdminAdvocatesController, AdminCasesController, NoticeMessagesController,
    PaymentsController,
    HealthController,
    AuthController,
    MeController,
    CaseController,
    NoticeController,
    ServicesController,
    DocumentController,
  ],
  providers: [AdminCaseDetailRepository, AdminAdvocatesRepository, AdminCasesRepository, NoticeMessages,
    ShipmentService,
    NoticePdfService,
    PaymentsService,
    AuthService,
    AuthGuard,
    CaseRepository,
    CaseStateMachine,
    DocumentService,
    DocumentStorage,
    FileInspector,
  ],
  exports: [DatabaseModule],
})
export class AppModule {}
