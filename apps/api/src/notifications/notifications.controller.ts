import { Controller, Get, Post, Param, Query, Req, UseGuards, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { AuthGuard, type AuthRequest } from '../auth/auth.controller';
import { parse } from '../auth/auth.service';
import { PrismaService } from '../prisma.service';
import { caseScope, type CaseActor } from '../cases/case-access';
import type { Prisma } from '../generated/prisma/client';
const querySchema = z.strictObject({limit: z.coerce.number().int().min(1).max(100).default(40), cursor: z.string().max(200).optional()});
const cursorSchema = z.tuple([z.iso.datetime(), z.uuid()]);
@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}
  private scope(actor: CaseActor): Prisma.NotificationWhereInput {
    return {user_id: actor.id, OR: [{case_id: null}, {case_id_relation: {is: caseScope(actor)}}]};
  }
  async list(actor: CaseActor, query: unknown) {
    const {limit, cursor} = parse(querySchema, query);
    let after: [string, string] | undefined;
    if (cursor) {
      let value: unknown;
      try {value = JSON.parse(Buffer.from(cursor, 'base64url').toString());} catch {value = null;}
      after = parse(cursorSchema, value);
    }
    const db = await this.prisma.getClient();
    const scope = this.scope(actor);
    if (after && !await db.notification.findFirst({where: {...scope, id: after[1]}, select: {id: true}}))
      throw new BadRequestException('Invalid notification cursor');
    const [rows, unread_count] = await db.$transaction([
      // Anchor to the actual row: JS Date drops PostgreSQL's microseconds.
      // Reconstructing its timestamp would skip tied rows at a page boundary.
      db.notification.findMany({where: scope, ...(after ? {cursor: {id: after[1]}, skip: 1} : {}),
        orderBy: [{created_at: 'desc'}, {id: 'desc'}], take: limit + 1,
        select: {id: true, case_id: true, kind: true, title: true, body: true, created_at: true, read_at: true,
          case_id_relation: {select: {reference: true, status: true, service_code: true}}}}),
      db.notification.count({where: {...scope, read_at: null}}),
    ], {isolationLevel: 'RepeatableRead'});
    const more = rows.length > limit, items = rows.slice(0, limit), last = items.at(-1);
    return {items: items.map(({case_id_relation, ...row}) => ({...row, case: case_id_relation})), unread_count,
      next_cursor: more && last ? Buffer.from(JSON.stringify([last.created_at.toISOString(), last.id])).toString('base64url') : null};
  }
  async read(actor: CaseActor, id: string) {
    parse(z.uuid(), id);
    const db = await this.prisma.getClient();
    // Ownership plus current case membership; a guessed UUID never broadens access.
    return db.$transaction(async tx => {
      const row = await tx.notification.findFirst({where: {...this.scope(actor), id}, select: {id: true, read_at: true}});
      if (!row) throw new NotFoundException('Notification not found');
      if (row.read_at) return row;
      await tx.notification.updateMany({where: {...this.scope(actor), id, read_at: null}, data: {read_at: new Date()}});
      return tx.notification.findUniqueOrThrow({where: {id}, select: {id: true, read_at: true}});
    });
  }
  async readAll(actor: CaseActor) {
    const db = await this.prisma.getClient();
    const {count} = await db.notification.updateMany({where: {...this.scope(actor), read_at: null}, data: {read_at: new Date()}});
    return {count};
  }
}
@Controller('api/v1/notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly inbox: NotificationRepository) {}
  @Get() list(@Req() req: AuthRequest, @Query() query: unknown) {return this.inbox.list(req.user!, query);}
  @Post('read-all') readAll(@Req() req: AuthRequest) {return this.inbox.readAll(req.user!);}
  @Post(':id/read') read(@Req() req: AuthRequest, @Param('id') id: string) {return this.inbox.read(req.user!, id);}
}
