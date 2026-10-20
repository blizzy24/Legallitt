import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { CaseStatus } from "@legalitt/shared";
import { AuthGuard, type AuthRequest } from "../auth/auth.controller";
import { parse } from "../auth/auth.service";
import { CaseRepository } from "./case-repository";
import { CaseStateMachine } from "./case-state-machine";

// JSON has no bigint type. Event IDs and document byte counts use lossless decimal
// strings; no monetary calculation or payment endpoint is part of this step.
async function json(value: Promise<unknown>) {
  return JSON.parse(
    JSON.stringify(await value, (_, v) =>
      typeof v === "bigint" ? v.toString() : v,
    ),
  );
}
const id = (value: string) => parse(z.uuid(), value);
@Controller("api/v1/cases")
@UseGuards(AuthGuard)
export class CaseController {
  constructor(
    private readonly cases: CaseRepository,
    private readonly state: CaseStateMachine,
  ) {}
  @Post() create(@Req() req: AuthRequest, @Body() body: unknown) {
    return json(this.state.create(req.user!, body));
  }
  @Get() list(@Req() req: AuthRequest, @Query() query: unknown) {
    return json(this.cases.list(req.user!, query));
  }
  @Get(":id") read(@Req() req: AuthRequest, @Param("id") value: string) {
    return json(this.cases.read(req.user!, id(value)));
  }
  @Patch(":id") update(
    @Req() req: AuthRequest,
    @Param("id") value: string,
    @Body() body: unknown,
  ) {
    return json(this.state.updateDraft(req.user!, id(value), body));
  }
  @Post(":id/submit") submit(
    @Req() req: AuthRequest,
    @Param("id") value: string,
    @Body() body: unknown,
  ) {
    parse(z.strictObject({}), body ?? {});
    return json(
      this.state.submitForPayment(req.user!, id(value)),
    );
  }
  @Post(":id/cancel") cancel(
    @Req() req: AuthRequest,
    @Param("id") value: string,
    @Body() body: unknown,
  ) {
    parse(z.strictObject({}), body ?? {});
    return json(
      this.state.transition(req.user!, id(value), CaseStatus.cancelled),
    );
  }
  @Get(":id/events") events(
    @Req() req: AuthRequest,
    @Param("id") value: string,
    @Query() query: unknown,
  ) {
    return json(this.cases.events(req.user!, id(value), query));
  }
}
