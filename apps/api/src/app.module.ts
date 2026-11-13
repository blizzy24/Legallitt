import {AdvocateCompletionController, AdvocateCompletionService} from './completion/advocate-completion';
import {AccountDeletionsAdminController, AccountDeletionsAdminService} from './account/account-deletions-admin';
import {AdvocateVerificationController} from './advocate-verification/advocate-verification.controller';
import {AdvocateVerificationService} from './advocate-verification/advocate-verification.service';
import {WalletController} from './wallet/wallet.controller';
import {WalletService} from './wallet/wallet.service';
import {SupportController} from './support/support.controller';
import {SupportSettings,SupportSettingsController} from './support/support-settings';
import {SupportService} from './support/support.service';
import {AccountDataController} from './account/account-data.controller';
import {AccountDataService} from './account/account-data.service';
import {FirAdminService} from './cases/fir-admin.service';
import {FirFlowService} from './cases/fir-flow.service';
import {ConsultationController} from './consultations/consultation.controller';
import {ConsultationService} from './consultations/consultation.service';
import {ConsultationPayments} from './consultations/consultation-payments';
import {ConsultationReports} from './consultations/consultation-reports';
import {CancellationsController} from './cancellations/cancellations.controller';
import {CancellationsService} from './cancellations/cancellations.service';
import {ServiceReportsController} from './service-reports/service-reports.controller';
import {ServiceReportsService} from './service-reports/service-reports.service';
import {ReportWorkflowService} from './service-reports/report-workflow.service';
import {ReportTariffs,ReportTariffsController} from './service-reports/report-tariffs';
import {FirController} from './cases/fir.controller';
import {FirService} from './cases/fir.service';
import { NotificationsController, NotificationRepository } from './notifications/notifications.controller';
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
import {NoticeFlowController} from './cases/notice-flow.controller';
import {NoticeFlowService} from './cases/notice-flow.service';
import {NOTICE_EMAIL, SesNoticeEmail} from './cases/notice-email';
import {NoticeDraftAiController} from './cases/notice-draft-ai';
import {NoticeReminders} from './cases/notice-reminders';

@Controller("health")
export class HealthController {
  // Liveness only. Database readiness is deliberately not implied.
  @Get()
  health() {
    return { status: "ok" };
  }
}

import {APP_INTERCEPTOR} from '@nestjs/core';
import {ContactPrivacyInterceptor} from './cases/contact-privacy';
import {AdvocateSignatures,AdvocateSignatureController} from './account/advocate-signature';
import {NoticeSigning,NoticeSigningController} from './cases/notice-signing';
import {AccountController} from './account/account.controller';
import {AccountService} from './account/account.service';
import {ACCOUNT_COGNITO, CognitoAccountAdapter} from './account/account-cognito';

@Module({
  imports: [AiModule, CourierModule, AdminUiModule, DemoModule, DatabaseModule, PhoneAuthModule, PaymentsModule, NotificationsModule],
  controllers: [AdvocateSignatureController,NoticeSigningController,WalletController, AdvocateVerificationController, AdvocateCompletionController, AccountDeletionsAdminController, AccountController, AccountDataController, SupportController, ConsultationController, FirController, NotificationsController, NoticeIntakeAiController, AdminAdvocatesController, AdminCasesController, NoticeMessagesController,
    PaymentsController, ServiceReportsController, CancellationsController, SupportSettingsController, ReportTariffsController,
    HealthController,
    AuthController,
    MeController,
    CaseController,
    NoticeController,
    NoticeFlowController,
    NoticeDraftAiController,
    ServicesController,
    DocumentController,
  ],
  providers: [{provide:APP_INTERCEPTOR,useClass:ContactPrivacyInterceptor},AdvocateSignatures,NoticeSigning,WalletService, AdvocateVerificationService, AdvocateCompletionService, AccountDeletionsAdminService, AccountService, AccountDataService, {provide: ACCOUNT_COGNITO, useClass: CognitoAccountAdapter}, SupportService, ConsultationService, ConsultationPayments, ConsultationReports, FirAdminService, FirFlowService, FirService, NotificationRepository, AdminCaseDetailRepository, AdminAdvocatesRepository, AdminCasesRepository, NoticeMessages,
    ShipmentService,
    NoticePdfService,
    NoticeFlowService,
    NoticeReminders,
    {provide: NOTICE_EMAIL, useClass: SesNoticeEmail},
    PaymentsService, ServiceReportsService, ReportWorkflowService, CancellationsService, SupportSettings, ReportTariffs,
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
