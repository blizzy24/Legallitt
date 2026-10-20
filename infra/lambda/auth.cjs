"use strict";
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
