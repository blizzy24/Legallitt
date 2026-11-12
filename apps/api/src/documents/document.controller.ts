import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { AuthGuard, type AuthRequest } from "../auth/auth.controller";
import { parse } from "../auth/auth.service";
import { DocumentService } from "./document.service";
@Controller("api/v1/documents")
@UseGuards(AuthGuard)
export class DocumentController {
  constructor(private readonly documents: DocumentService) {}
  @Post("presign") presign(@Req() req: AuthRequest, @Body() body: unknown) {
    return this.documents.presign(req.user!, body);
  }
  @Post(":id/complete") complete(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    parse(z.strictObject({}), body ?? {});
    return this.documents.complete(req.user!, parse(z.uuid(), id));
  }
  @Get(":id/url") url(@Req() req: AuthRequest, @Param("id") id: string) {
    return this.documents.url(req.user!, parse(z.uuid(), id));
  }
  @Get(":id/view") view(@Req() req: AuthRequest, @Param("id") id: string) {
    return this.documents.view(req.user!, parse(z.uuid(), id));
  }
  @Delete(":id") delete(@Req() req: AuthRequest, @Param("id") id: string) {
    return this.documents.delete(req.user!, parse(z.uuid(), id));
  }
}
