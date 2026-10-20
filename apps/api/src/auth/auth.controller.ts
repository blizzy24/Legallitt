import {
  Body,
  CanActivate,
  Controller,
  ExecutionContext,
  Get,
  Injectable,
  Patch,
  Post,
  Req,
  SetMetadata,
  UnauthorizedException,
  ForbiddenException,
  UseGuards,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "./auth.service";
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);
export type AuthRequest = {
  headers: { authorization?: string };
  user?: Awaited<ReturnType<AuthService["identity"]>>;
};
export function bearer(req: AuthRequest) {
  const match = req.headers.authorization?.match(/^Bearer (\S+)$/);
  if (!match) throw new UnauthorizedException("Sign in required");
  return match[1];
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    req.user = await this.auth.identity(bearer(req));
    const roles = this.reflector.getAllAndOverride<string[]>("roles", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (roles && !roles.includes(req.user.role))
      throw new ForbiddenException("Role not permitted");
    return true;
  }
}
@Controller("api/v1/auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post("register") register(@Body() body: unknown) {
    return this.auth.register(body);
  }
  @Post("confirm") confirm(@Body() body: unknown) {
    return this.auth.confirm(body);
  }
  @Post("resend") resend(@Body() body: unknown) {
    return this.auth.resend(body);
  }
  @Post("login") login(@Body() body: unknown) {
    return this.auth.login(body);
  }
  @Post("refresh") refresh(@Body() body: unknown) {
    return this.auth.refresh(body);
  }
  @Post("otp/request") requestOtp(@Body() body: unknown) {
    return this.auth.requestOtp(body);
  }
  @Post("otp/verify") verifyOtp(@Body() body: unknown) {
    return this.auth.verifyOtp(body);
  }
}
@Controller("api/v1/me")
@UseGuards(AuthGuard)
export class MeController {
  constructor(private readonly auth: AuthService) {}
  @Get() me(@Req() req: AuthRequest) {
    return req.user;
  }
  @Patch() update(@Req() req: AuthRequest, @Body() body: unknown) {
    return this.auth.updateMe(bearer(req), body);
  }
}
