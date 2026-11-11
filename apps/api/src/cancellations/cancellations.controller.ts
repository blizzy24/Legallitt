import {Body, Controller, Get, Param, Post, Query, Req, UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {AuthGuard, Roles, type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import {CancellationsService} from './cancellations.service';

const id = (value: string) => parse(z.uuid(), value);
const json = async (p: Promise<unknown>) => JSON.parse(JSON.stringify(await p, (_, v) => typeof v === 'bigint' ? v.toString() : v));

@Controller('api/v1') @UseGuards(AuthGuard)
export class CancellationsController {
  constructor(private readonly cancellations: CancellationsService) {}
  @Get('cases/:id/cancellation') read(@Req() req: AuthRequest, @Param('id') v: string) {return json(this.cancellations.read(req.user!, id(v)));}
  @Post('cases/:id/cancellation') cancel(@Req() req: AuthRequest, @Param('id') v: string, @Body() body: unknown) {return json(this.cancellations.cancel(req.user!, id(v), body));}
  @Get('admin/cancellations') @Roles('admin') queue(@Req() req: AuthRequest, @Query() query: {status?: string}) {
    return json(this.cancellations.queue(req.user!, parse(z.strictObject({status: z.enum(['pending', 'decided']).optional()}), query)));
  }
  @Post('admin/cancellations/:requestId/decide') @Roles('admin') decide(@Req() req: AuthRequest, @Param('requestId') v: string, @Body() body: unknown) {
    return json(this.cancellations.decide(req.user!, id(v), body));
  }
}
