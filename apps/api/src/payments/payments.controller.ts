import { Body, Controller, Get, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthRequest } from '../auth/auth.controller';
import { PaymentsService } from './payments.service';
const json = (value: unknown) => JSON.parse(JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v));
@Controller('api/v1/payments')
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}
  @Post('checkouts') checkout(@Req() req:AuthRequest,@Body() body:unknown){return this.payments.checkout(req.user!,body).then(json);}
  @Get('checkouts/:id') checkoutStatus(@Req() req:AuthRequest,@Param('id') id:string){return this.payments.checkoutStatus(req.user!,id).then(json);}
  @Post('checkouts/:id/simulate') simulate(@Req() req:AuthRequest,@Param('id') id:string){return this.payments.simulateCheckout(req.user!,id).then(json);}
  @Post('notice-courier-retry') courierRetry(@Req() req:AuthRequest,@Body() body:unknown){return this.payments.noticeCourierRetry(req.user!,body).then(json);}
  @Post('quotes') quote(@Req() req: AuthRequest, @Body() body: unknown) {
    return this.payments.quote(req.user!, body).then(json);
  }
  @Post('intents') intent(@Req() req: AuthRequest, @Body() body: unknown, @Headers('idempotency-key') key?: string) {
    return this.payments.intent(req.user!, body, key).then(json);
  }
}
