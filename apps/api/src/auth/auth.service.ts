import {
  BadRequestException,
  Injectable,
  Logger,
  HttpException,
  UnauthorizedException,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  InitiateAuthCommand,
  type AuthenticationResultType,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { z } from "zod";
import { PrismaService } from "../prisma.service";
import { demoAccounts, demoPassword, requireDemoMode } from "./demo";

import {
  authDiagnostic,
  authMessage,
  detailedAuthErrors,
  type AuthOperation,
} from "./auth-errors";
class ReportedAuthFailure extends HttpException {}

const roles = z.enum(["client", "advocate", "admin"]);
const configSchema = z.object({
  userPoolId: z.string().startsWith("ap-south-1_"),
  clientId: z.string().min(1),
});
export const registerSchema = z
  .object({
    email: z.email({ error: "Enter a valid email address" }),
    // Matches the deployed Cognito pool policy; do not weaken it for demos.
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(256, "Password must be at most 256 characters")
      .regex(/[A-Z]/, "Password must include an uppercase letter")
      .regex(/[a-z]/, "Password must include a lowercase letter")
      .regex(/[0-9]/, "Password must include a number")
      .regex(/[^A-Za-z0-9\s]/, "Password must include a symbol"),
    name: z.string().trim().min(1, "Enter your full name").max(200),
    role: z.enum(["client", "advocate"]),
    phone: z
      .string()
      .regex(/^\+[1-9]\d{7,14}$/)
      .optional(),
  })
  .strict();
export function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new BadRequestException("Invalid request");
  return parsed.data;
}
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly cognito = new CognitoIdentityProviderClient({
    region: "ap-south-1",
  });
  private configuration?: Promise<z.infer<typeof configSchema>>;
  private verifier?: ReturnType<typeof CognitoJwtVerifier.create>;
  constructor(private readonly prisma: PrismaService) {}
  private config() {
    if (!this.configuration)
      this.configuration = (async () => {
        if (!process.env.AUTH_CONFIG_SECRET_ARN)
          throw new ServiceUnavailableException(
            "Auth configuration is required",
          );
        const secrets = new SecretsManagerClient({ region: "ap-south-1" });
        try {
          const value = await secrets.send(
            new GetSecretValueCommand({
              SecretId: process.env.AUTH_CONFIG_SECRET_ARN,
            }),
          );
          return configSchema.parse(JSON.parse(value.SecretString ?? "{}"));
        } finally {
          secrets.destroy();
        }
      })().catch((error) => {
        this.configuration = undefined;
        throw error;
      });
    return this.configuration;
  }
  private async authOperation<T>(
    operation: AuthOperation,
    body: unknown,
    action: () => Promise<T>,
    secrets: string[] = [],
  ): Promise<T> {
    try {
      return await action();
    } catch (error) {
      if (error instanceof ReportedAuthFailure) throw error;
      this.logger.error(authDiagnostic(operation, error, body, secrets));
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : error instanceof z.ZodError
            ? 400
            : ["login", "refresh", "otp.verify"].includes(operation)
              ? 401
              : 400;
      const message = authMessage(operation, error);
      throw new ReportedAuthFailure(
        {
          message,
          error:
            status === 401
              ? "Unauthorized"
              : status === 503
                ? "Service Unavailable"
                : "Bad Request",
          statusCode: status,
        },
        status,
      );
    }
  }
  async register(body: unknown) {
    return this.authOperation("registration", body, async () => {
      const input = registerSchema.parse(body);
      const config = await this.config();
      await this.cognito.send(
        new SignUpCommand({
          ClientId: config.clientId,
          Username: input.email,
          Password: input.password,
          UserAttributes: [
            { Name: "email", Value: input.email },
            { Name: "name", Value: input.name },
            { Name: "custom:role", Value: input.role },
            ...(input.phone
              ? [{ Name: "phone_number", Value: input.phone }]
              : []),
          ],
        }),
      );
      return { confirmationRequired: true };
    });
  }
  async confirm(body: unknown) {
    return this.authOperation("confirmation", body, async () => {
      const input = z
        .object({
          email: z.email(),
          code: z
            .string()
            .regex(/^\d{6}$/, "Enter the six-digit code from your email"),
        })
        .strict()
        .parse(body);
      const config = await this.config();
      await this.cognito.send(
        new ConfirmSignUpCommand({
          ClientId: config.clientId,
          Username: input.email,
          ConfirmationCode: input.code,
        }),
      );
      return { confirmed: true };
    });
  }
  async resend(body: unknown) {
    try {
      return await this.authOperation("resend", body, async () => {
        const input = z.object({ email: z.email() }).strict().parse(body);
        const config = await this.config();
        await this.cognito.send(
          new ResendConfirmationCodeCommand({
            ClientId: config.clientId,
            Username: input.email,
          }),
        );
        return { requested: true };
      });
    } catch (error) {
      // Preserve production's non-enumerating acknowledgement, but never lose its diagnostic.
      if (detailedAuthErrors()) throw error;
      return { requested: true };
    }
  }
  private async session(
    result?: AuthenticationResultType,
    refreshToken?: string,
  ) {
    if (!result?.IdToken || !result.AccessToken)
      throw new UnauthorizedException("Authentication failed");
    const user = await this.identity(result.IdToken);
    return {
      user,
      tokens: {
        idToken: result.IdToken,
        accessToken: result.AccessToken,
        refreshToken: result.RefreshToken ?? refreshToken,
        expiresIn: result.ExpiresIn,
      },
    };
  }
  async login(body: unknown) {
    return this.authOperation("login", body, () => this.signIn(body));
  }
  private async signIn(body: unknown) {
    const input = z
      .object({ email: z.email(), password: z.string().min(1).max(256) })
      .strict()
      .parse(body);
    const config = await this.config();
    let result;
    try {
      result = await this.cognito.send(
        new InitiateAuthCommand({
          ClientId: config.clientId,
          AuthFlow: "USER_PASSWORD_AUTH",
          AuthParameters: { USERNAME: input.email, PASSWORD: input.password },
        }),
      );
    } catch (error) {
      if ((error as { name?: string }).name === "UserNotConfirmedException")
        return { confirmationRequired: true as const };
      throw error;
    }
    return this.session(result.AuthenticationResult);
  }
  async refresh(body: unknown) {
    return this.authOperation("refresh", body, async () => {
      const input = z
        .object({ refreshToken: z.string().min(1).max(8192) })
        .strict()
        .parse(body);
      const config = await this.config();
      const result = await this.cognito.send(
        new InitiateAuthCommand({
          ClientId: config.clientId,
          AuthFlow: "REFRESH_TOKEN_AUTH",
          AuthParameters: { REFRESH_TOKEN: input.refreshToken },
        }),
      );
      return this.session(result.AuthenticationResult, input.refreshToken);
    });
  }
  async requestOtp(body: unknown) {
    return this.authOperation("otp.request", body, async () => {
      requireDemoMode();
      z.object({ phone: z.string().max(64) })
        .strict()
        .parse(body);
      return { requested: true };
    });
  }
  async verifyOtp(body: unknown) {
    const secrets: string[] = [];
    return this.authOperation(
      "otp.verify",
      body,
      async () => {
        requireDemoMode();
        const input = z
          .object({
            phone: z.string().max(64),
            code: z.string().regex(/^\d{6}$/, "Enter the six-digit demo code"),
            role: z.enum(["client", "advocate"]),
          })
          .strict()
          .parse(body);
        if (input.code !== "123456")
          throw new UnauthorizedException(
            "Incorrect demo phone code. Enter 123456",
          );
        const password = await demoPassword();
        secrets.push(password, demoAccounts[input.role].email);
        const result = await this.signIn({
          email: demoAccounts[input.role].email,
          password,
        });
        if ("confirmationRequired" in result || result.user.role !== input.role)
          throw new UnauthorizedException(
            "Demo account is not configured: check the seeded role and email verification",
          );
        return result;
      },
      secrets,
    );
  }
  async identity(token: string) {
    const config = await this.config();
    // ID tokens carry Cognito's immutable custom:role claim. Check token_use,
    // issuer, audience, signature and expiry; never accept an arbitrary JWT role.
    if (!this.verifier)
      this.verifier = CognitoJwtVerifier.create({
        userPoolId: config.userPoolId,
        tokenUse: "id",
        clientId: config.clientId,
      });
    let claims;
    try {
      claims = await this.verifier.verify(token);
    } catch {
      throw new UnauthorizedException("Invalid session");
    }
    const role = roles.safeParse(claims["custom:role"]);
    if (!role.success || typeof claims.name !== "string" || !claims.name)
      throw new UnauthorizedException("Incomplete identity");
    const db = await this.prisma.getClient();
    const user = await db.user.upsert({
      where: { cognito_sub: claims.sub },
      create: {
        cognito_sub: claims.sub,
        role: role.data,
        full_name: claims.name,
        email: typeof claims.email === "string" ? claims.email : null,
        phone:
          typeof claims.phone_number === "string" ? claims.phone_number : null,
        email_verified: claims.email_verified === true,
        phone_verified: claims.phone_number_verified === true,
      },
      update: {},
    });
    if (user.status !== "active" || user.role !== role.data)
      throw new UnauthorizedException("Account is not active");
    return {
      id: user.id,
      role: user.role,
      name: user.full_name,
      email: user.email,
      phone: user.phone,
      emailVerified: user.email_verified,
      phoneVerified: user.phone_verified,
    };
  }
  async updateMe(token: string, body: unknown) {
    const input = parse(
      z.object({ name: z.string().trim().min(1).max(200) }).strict(),
      body,
    );
    const me = await this.identity(token);
    const db = await this.prisma.getClient();
    await db.user.update({
      where: { id: me.id },
      data: { full_name: input.name, updated_at: new Date() },
    });
    return { ...me, name: input.name };
  }
}
