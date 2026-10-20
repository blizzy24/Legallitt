import {
  BadRequestException,
  Injectable,
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

const roles = z.enum(["client", "advocate", "admin"]);
const configSchema = z.object({
  userPoolId: z.string().startsWith("ap-south-1_"),
  clientId: z.string().min(1),
});
export const registerSchema = z
  .object({
    email: z.email(),
    password: z.string().min(8).max(256),
    name: z.string().trim().min(1).max(200),
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
  async register(body: unknown) {
    const input = parse(registerSchema, body);
    const config = await this.config();
    try {
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
    } catch {
      throw new BadRequestException("Registration could not be completed");
    }
  }
  async confirm(body: unknown) {
    const input = parse(
      z
        .object({ email: z.email(), code: z.string().regex(/^\d{6}$/) })
        .strict(),
      body,
    );
    const config = await this.config();
    try {
      await this.cognito.send(
        new ConfirmSignUpCommand({
          ClientId: config.clientId,
          Username: input.email,
          ConfirmationCode: input.code,
        }),
      );
      return { confirmed: true };
    } catch {
      throw new BadRequestException("Verification failed");
    }
  }
  async resend(body: unknown) {
    const input = parse(z.object({ email: z.email() }).strict(), body);
    const config = await this.config();
    try {
      await this.cognito.send(
        new ResendConfirmationCodeCommand({
          ClientId: config.clientId,
          Username: input.email,
        }),
      );
    } catch {}
    return { requested: true };
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
    const input = parse(
      z
        .object({ email: z.email(), password: z.string().min(1).max(256) })
        .strict(),
      body,
    );
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
        return { confirmationRequired: true };
      throw new UnauthorizedException("Authentication failed");
    }
    return this.session(result.AuthenticationResult);
  }
  async refresh(body: unknown) {
    const input = parse(
      z.object({ refreshToken: z.string().min(1).max(8192) }).strict(),
      body,
    );
    const config = await this.config();
    try {
      const result = await this.cognito.send(
        new InitiateAuthCommand({
          ClientId: config.clientId,
          AuthFlow: "REFRESH_TOKEN_AUTH",
          AuthParameters: { REFRESH_TOKEN: input.refreshToken },
        }),
      );
      return await this.session(
        result.AuthenticationResult,
        input.refreshToken,
      );
    } catch {
      throw new UnauthorizedException("Session expired");
    }
  }
  async requestOtp(body: unknown) {
    requireDemoMode();
    // The displayed number is not an identity and is never sent to Cognito.
    parse(z.object({ phone: z.string().max(64) }).strict(), body);
    return { requested: true };
  }
  async verifyOtp(body: unknown) {
    requireDemoMode();
    const input = parse(
      z
        .object({
          phone: z.string().max(64),
          code: z.string().regex(/^\d{6}$/),
          role: z.enum(["client", "advocate"]),
        })
        .strict(),
      body,
    );
    if (input.code !== "123456")
      throw new UnauthorizedException("Verification failed");
    const result = await this.login({
      email: demoAccounts[input.role].email,
      password: await demoPassword(),
    });
    if ("confirmationRequired" in result || result.user.role !== input.role)
      throw new UnauthorizedException("Demo account is not configured");
    return result;
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
