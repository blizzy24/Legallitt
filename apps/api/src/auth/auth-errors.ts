import { z } from "zod";

export type AuthOperation =
  | "registration"
  | "confirmation"
  | "resend"
  | "login"
  | "refresh"
  | "otp.request"
  | "otp.verify";
const generic: Record<AuthOperation, string> = {
  registration: "Registration could not be completed",
  confirmation: "Verification failed",
  resend: "Verification code could not be resent",
  login: "Authentication failed",
  refresh: "Session expired",
  "otp.request": "Phone sign-in is not configured",
  "otp.verify": "Verification failed",
};
export function detailedAuthErrors() {
  return (
    process.env.ENVIRONMENT === "dev" &&
    ["development", "test"].includes(process.env.NODE_ENV ?? "")
  );
}
export function authMessage(operation: AuthOperation, error: unknown): string {
  if (!detailedAuthErrors()) return generic[operation];
  if (error instanceof z.ZodError) {
    const issue = error.issues[0];
    return issue?.code === "unrecognized_keys"
      ? "Invalid authentication fields"
      : (issue?.message ?? "Invalid authentication fields");
  }
  const failure = error as { name?: string; message?: string } | null;
  switch (failure?.name) {
    case "CodeMismatchException":
      return /max|exceed|attempt/i.test(failure.message ?? "")
        ? "Too many incorrect email codes. Resend the confirmation code and enter the code from your email; 123456 is only for demo phone sign-in"
        : "Incorrect email verification code. Enter the code from your email; 123456 is only for demo phone sign-in";
    case "ExpiredCodeException":
      return "The email verification code has expired. Resend the code and try again";
    case "UserNotFoundException":
      return operation === "otp.verify"
        ? "The selected demo account is missing from Cognito. Run the demo seed"
        : "No account exists for this email";
    case "NotAuthorizedException":
      if (operation === "refresh")
        return "Session expired. Please sign in again";
      return operation === "confirmation"
        ? "This account cannot be confirmed. It may already be confirmed; try signing in"
        : operation === "otp.verify"
          ? "Demo Cognito sign-in failed. Check the seeded account password and status"
          : "Email or password is incorrect";
    case "ServiceUnavailableException":
      return failure.message ?? "Authentication service is unavailable";
    case "UnauthorizedException":
      return failure.message ?? generic[operation];
    case "UsernameExistsException":
      return "An account with this email already exists";
    case "InvalidPasswordException": {
      const reason = failure.message?.toLowerCase() ?? "";
      if (reason.includes("uppercase"))
        return "Password must include an uppercase letter";
      if (reason.includes("lowercase"))
        return "Password must include a lowercase letter";
      if (reason.includes("numeric") || reason.includes("number"))
        return "Password must include a number";
      if (reason.includes("symbol")) return "Password must include a symbol";
      return "Password must be at least 8 characters and include uppercase, lowercase, a number and a symbol";
    }
    case "InvalidParameterException":
      return "Check your registration details, including the email address and phone number";
    case "TooManyRequestsException":
    case "LimitExceededException":
      return "Too many authentication attempts. Please try again later";
    case "CodeDeliveryFailureException":
      return "The verification email could not be sent. Please try again later";
    default:
      return operation === "registration"
        ? "Registration service is unavailable. Check the API logs"
        : "Authentication service is unavailable. Check the API logs";
  }
}
export function authDiagnostic(
  operation: AuthOperation,
  error: unknown,
  body: unknown,
  secrets: string[] = [],
) {
  const failure = error as {
    name?: string;
    message?: string;
    $metadata?: { requestId?: string; httpStatusCode?: number };
  } | null;
  const values = [
    ...(body && typeof body === "object" ? Object.values(body) : []),
    ...secrets,
  ];
  const redact = (message: string) => {
    let safe = message;
    for (const value of values)
      if (typeof value === "string" && value.length)
        safe = safe.split(value).join("[redacted]");
    return safe.replace(/[\r\n\t]/g, " ").slice(0, 2048);
  };
  return {
    event: `auth.${operation}.failed`,
    error: failure?.name ?? "UnknownError",
    // Never serialize the SDK error/request, body, credentials or tokens.
    reason: redact(
      error instanceof z.ZodError
        ? error.issues
            .map((issue) =>
              issue.code === "unrecognized_keys"
                ? "request: Unrecognized fields"
                : `${String(issue.path[0] ?? "request")}: ${issue.message}`,
            )
            .join("; ")
        : (failure?.message ?? "Unknown authentication failure"),
    ),
    requestId: failure?.$metadata?.requestId,
    httpStatus: failure?.$metadata?.httpStatusCode,
  };
}
