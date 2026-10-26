import { UnauthorizedException } from '@nestjs/common';
import { z } from 'zod';
import type { PrismaService } from '../prisma.service';
import type { PhoneAuthPort, PhoneSession } from './phone-auth.port';
import { demoAccounts, demoPassword, requireDemoMode } from './demo-accounts';
export class SimulatedPhoneAuth implements PhoneAuthPort {
  readonly responseMetadata = {simulated: true};
  constructor(private readonly prisma: PrismaService) {}
  private async audit(identifier: string, event: string, userId?: string) {
    await (await this.prisma.getClient()).authEvent.create({data: {
      identifier, event, user_id: userId, simulated: true,
    }});
  }
  async request(body: unknown): Promise<{requested: true; simulated: true}> {
    requireDemoMode();
    const {phone} = z.strictObject({phone: z.string().trim().min(1).max(64)}).parse(body);
    await this.audit(phone, 'otp_requested');
    return {requested: true, simulated: true};
  }
  async verify(body: unknown, signIn: (input: {email: string; password: string}) => Promise<PhoneSession>, secrets: string[]) {
    requireDemoMode();
    // Only the identifier is copied to the audit; never the request object/code.
    const identifier = z.object({phone: z.string().max(64)}).safeParse(body);
    try {
      const input = z.strictObject({phone: z.string().trim().min(1).max(64), code: z.literal('123456', {error: 'Incorrect demo phone code. Enter 123456'}), role: z.enum(['client','advocate'])}).parse(body);
      const password = await demoPassword();
      secrets.push(password, demoAccounts[input.role].email);
      const result = await signIn({email: demoAccounts[input.role].email, password});
      if ('confirmationRequired' in result || result.user.role !== input.role)
        throw new UnauthorizedException('Demo account is not configured: check the seeded role and email verification');
      await this.audit(input.phone, 'otp_verified', result.user.id);
      return {...result, simulated: true};
    } catch (error) {
      await this.audit(identifier.success ? identifier.data.phone : '', 'otp_failed');
      throw error;
    }
  }
}
