import { z } from "zod";

export const REGISTRATION_FAILURE = "Registration could not be completed";
export function registrationMessage(error: unknown): string {
  // Details are deliberately opt-in locally, never enabled by a missing env var.
  if (
    process.env.ENVIRONMENT !== "dev" ||
    !["development", "test"].includes(process.env.NODE_ENV ?? "")
  )
    return REGISTRATION_FAILURE;
  if (error instanceof z.ZodError) {
    const issue = error.issues[0];
    return issue?.code === "unrecognized_keys"
      ? "Invalid registration fields"
      : (issue?.message ?? "Invalid registration fields");
  }
  const failure = error as { name?: string; message?: string } | null;
  switch (failure?.name) {
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
      return "Too many registration attempts. Please try again later";
    case "CodeDeliveryFailureException":
      return "The verification email could not be sent. Please try again later";
    default:
      return "Registration service is unavailable. Check the API logs";
  }
}
export function registrationDiagnostic(error: unknown, body: unknown) {
  const failure = error as {
    name?: string;
    message?: string;
    $metadata?: { requestId?: string; httpStatusCode?: number };
  } | null;
  const values = body && typeof body === "object" ? Object.values(body) : [];
  const redact = (message: string) => {
    let safe = message;
    for (const value of values)
      if (typeof value === "string" && value.length)
        safe = safe.split(value).join("[redacted]");
    return safe.replace(/[\r\n\t]/g, " ").slice(0, 2048);
  };
  return {
    event: "auth.registration.failed",
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
        : (failure?.message ?? "Unknown registration failure"),
    ),
    requestId: failure?.$metadata?.requestId,
    httpStatus: failure?.$metadata?.httpStatusCode,
  };
}
