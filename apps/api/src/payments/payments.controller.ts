import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthRequest } from '../auth/auth.controller';
import { PaymentsService } from './payments.service';
const json = (value: unknown) => JSON.parse(JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v));
@Controller('api/v1/payments')
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}
  @Post('quotes') quote(@Req() req: AuthRequest, @Body() body: unknown) {
    return this.payments.quote(req.user!, body).then(json);
  }
  @Post('intents') intent(@Req() req: AuthRequest, @Body() body: unknown, @Headers('idempotency-key') key?: string) {
    return this.payments.intent(req.user!, body, key).then(json);
  }
}
