"use strict";
const { timingSafeEqual } = require("node:crypto");
const simulated = () =>
  process.env.ENVIRONMENT === "dev" && process.env.SMS_ENABLED === "false";
exports.define = async (event) => {
  const session = event.request.session || [];
  event.response.issueTokens = false;
  event.response.failAuthentication = false;
  if (
    !simulated() ||
    event.request.userNotFound ||
    (session.length >= 3 && !session.at(-1)?.challengeResult)
  ) {
    event.response.failAuthentication = true;
  } else if (
    session.at(-1)?.challengeName === "CUSTOM_CHALLENGE" &&
    session.at(-1).challengeResult
  ) {
    event.response.issueTokens = true;
  } else {
    event.response.challengeName = "CUSTOM_CHALLENGE";
  }
  return event;
};
exports.create = async (event) => {
  // Fail closed until the client selects an SMS provider and completes DLT.
  if (!simulated()) throw new Error("SMS provider is not configured");
  event.response.publicChallengeParameters = { delivery: "phone" };
  event.response.privateChallengeParameters = { issuedAt: String(Date.now()) };
  event.response.challengeMetadata = "PHONE_OTP";
  return event;
};
exports.verify = async (event) => {
  const answer = String(event.request.challengeAnswer || "");
  const issuedAt = Number(event.request.privateChallengeParameters?.issuedAt);
  const age = Date.now() - issuedAt;
  event.response.answerCorrect =
    simulated() &&
    !event.request.userNotFound &&
    Number.isFinite(issuedAt) &&
    age >= 0 &&
    age <= 300000 &&
    /^[0-9]{6}$/.test(answer) &&
    timingSafeEqual(Buffer.from(answer), Buffer.from("123456"));
  return event;
};
exports.preSignup = async (event) => {
  const role = event.request.userAttributes["custom:role"];
  const adminProvisioning = event.triggerSource === "PreSignUp_AdminCreateUser";
  if (
    !["client", "advocate", ...(adminProvisioning ? ["admin"] : [])].includes(
      role,
    )
  ) {
    throw new Error("Invalid registration role");
  }
  // Verification remains Cognito's job; do not auto-confirm email or phone.
  return event;
};
