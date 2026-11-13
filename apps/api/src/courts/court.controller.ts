import {Body,Controller,Get,Param,Patch,Post,Req,UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {AuthGuard,Roles,type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import {CourtRepresentationService} from './court.service';
const response=(value:unknown)=>JSON.parse(JSON.stringify(value,(_key,v)=>typeof v==='bigint'?v.toString():v));
@Controller('api/v1/courts') @UseGuards(AuthGuard)
export class CourtRepresentationController {
 constructor(private readonly courts:CourtRepresentationService){}
 @Get('settings/:service') async settings(@Req() r:AuthRequest,@Param('service') service:string){const value=await this.courts.settings(service);return response(r.user!.role==='client'?{...value,rates:[]}:value);}
 @Patch('settings/:service') @Roles('admin') update(@Req() r:AuthRequest,@Param('service') service:string,@Body() body:unknown){return this.courts.updateSettings(r.user!,service,body);}
 @Get() list(@Req() r:AuthRequest){return this.courts.list(r.user!).then(response);}
 @Post() @Roles('client') create(@Req() r:AuthRequest,@Body() body:unknown){return this.courts.create(r.user!,body).then(response);}
 @Get(':id') read(@Req() r:AuthRequest,@Param('id') id:string){return this.courts.read(r.user!,parse(z.uuid(),id)).then(response);}
 @Post(':id/quote') @Roles('client') quote(@Req() r:AuthRequest,@Param('id') id:string,@Body() body:unknown){return this.courts.quote(r.user!,parse(z.uuid(),id),body);}
 @Post(':id/pay') @Roles('client') pay(@Req() r:AuthRequest,@Param('id') id:string,@Body() body:unknown){return this.courts.pay(r.user!,parse(z.uuid(),id),body).then(response);}
 @Post(':id/actions/:action') action(@Req() r:AuthRequest,@Param('id') id:string,@Param('action') action:string,@Body() body:unknown){return this.courts.action(r.user!,parse(z.uuid(),id),action,body).then(response);}
}
