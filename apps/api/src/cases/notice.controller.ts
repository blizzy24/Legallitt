import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { CaseStatus } from "@legalitt/shared";
import { AuthGuard, Roles, type AuthRequest } from "../auth/auth.controller";
import { parse } from "../auth/auth.service";
import { ShipmentService } from "./shipment.service";
import { NoticePdfService } from "./notice-pdf.service";
import { CaseStateMachine } from "./case-state-machine";
import { CaseRepository } from "./case-repository";
const id = (value: string) => parse(z.uuid(), value);
const empty = (body: unknown) => parse(z.strictObject({}), body ?? {});
async function json(value: Promise<unknown>) {
  return JSON.parse(
    JSON.stringify(await value, (_, v) =>
      typeof v === "bigint" ? v.toString() : v,
    ),
  );
}
@Controller("api/v1")
@UseGuards(AuthGuard)
export class NoticeController {
  constructor(
    private readonly state: CaseStateMachine,
    private readonly cases: CaseRepository,
    private readonly shipments: ShipmentService,
    private readonly pdf: NoticePdfService,
  ) {}
  @Get("advocate/requests") @Roles("advocate") requests(
    @Req() req: AuthRequest,
  ) {
    return json(this.cases.list(req.user!, { status: "assigned", limit: 100 }));
  }
  @Post("cases/:id/accept") accept(
    @Req() req: AuthRequest,
    @Param("id") value: string,
    @Body() body: unknown,
  ) {
    empty(body);
    return json(
      this.state.transition(req.user!, id(value), CaseStatus.advocate_accepted),
    );
  }
  @Post("cases/:id/start") start(
    @Req() req: AuthRequest,
    @Param("id") value: string,
    @Body() body: unknown,
  ) {
    empty(body);
    return json(this.state.startDrafting(req.user!, id(value)));
  }
  @Post("cases/:id/decline") decline(
    @Req() req: AuthRequest,
    @Param("id") value: string,
    @Body() body: unknown,
  ) {
    return json(this.state.decline(req.user!, id(value), body));
  }
  @Post("cases/:id/drafts") draft(
    @Req() req: AuthRequest,
    @Param("id") value: string,
    @Body() body: unknown,
  ) {
    return json(this.state.saveNoticeDraft(req.user!, id(value), body));
  }
  @Get("cases/:id/drafts") drafts(
    @Req() req: AuthRequest,
    @Param("id") value: string,
  ) {
    return json(this.cases.read(req.user!, id(value)).then((r) => r.drafts));
  }
  // The PDF is filed first, then the lifecycle moves; if the move is refused the
  // file is discarded, so a case never advances without its document.
  @Post("cases/:id/drafts/:draftId/send") async send(
    @Req() req: AuthRequest,
    @Param("id") value: string,
    @Param("draftId") draft: string,
    @Body() body: unknown,
  ) {
    empty(body);
    const document = await this.pdf.draft(req.user!, id(value), id(draft));
    try {
      return await json(this.state.sendNoticeDraft(req.user!, id(value), id(draft)));
    } catch (error) {
      await this.pdf.discard(req.user!, document.id);
      throw error;
    }
  }
  @Post("cases/:id/drafts/:draftId/approve") async approve(
    @Req() req: AuthRequest,
    @Param("id") value: string,
    @Param("draftId") draft: string,
    @Body() body: unknown,
  ) {
    empty(body);
    const approvedAt = new Date();
    const document = await this.pdf.final(req.user!, id(value), id(draft), approvedAt);
    try {
      return await json(
        this.state.reviewNoticeDraft(req.user!, id(value), id(draft), "approved", body ?? {}, { approvedAt, noticeDocumentId: document.id }),
      );
    } catch (error) {
      await this.pdf.discard(req.user!, document.id);
      throw error;
    }
  }
  @Post("cases/:id/drafts/:draftId/request-changes") changes(
    @Req() req: AuthRequest,
    @Param("id") value: string,
    @Param("draftId") draft: string,
    @Body() body: unknown,
  ) {
    return json(
      this.state.reviewNoticeDraft(
        req.user!,
        id(value),
        id(draft),
        "changes_requested",
        body,
      ),
    );
  }
  @Post("admin/cases/:id/assign") @Roles("admin") assign(
    @Req() req: AuthRequest,
    @Param("id") value: string,
    @Body() body: unknown,
  ) {
    return json(this.state.assign(req.user!, id(value), body));
  }

  @Post("cases/:id/shipment/received") receiveShipment(@Req() req: AuthRequest, @Param("id") value: string, @Body() body: unknown) {
    empty(body);
    return json(this.shipments.receive(req.user!, id(value)));
  }
  @Post("cases/:id/shipment") saveShipment(@Req() req: AuthRequest, @Param("id") value: string, @Body() body: unknown) {
    return json(this.shipments.save(req.user!, id(value), body));
  }
  @Post("cases/:id/shipment/book") bookShipment(@Req() req: AuthRequest, @Param("id") value: string, @Body() body: unknown) {
    return json(this.shipments.save(req.user!, id(value), body, true));
  }
  @Post("cases/:id/dispatch") dispatch(
    @Req() req: AuthRequest,
    @Param("id") value: string,
    @Body() body: unknown,
  ) {
    return json(this.state.dispatch(req.user!, id(value), body));
  }
  @Post("admin/cases/:id/shipment/status") @Roles("admin") shipmentStatus(@Req() req: AuthRequest, @Param("id") value: string, @Body() body: unknown) {
    return json(this.shipments.advance(req.user!, id(value), body));
  }
  @Post(["admin/cases/:id/deliver", "cases/:id/delivered"]) @Roles("admin") deliver(
    @Req() req: AuthRequest,
    @Param("id") value: string,
    @Body() body: unknown,
  ) {
    return json(this.state.deliver(req.user!, id(value), body).then(record => ({...record, ...(req.user!.source === "simulated" ? {simulated: true} : {})})));
  }
}
