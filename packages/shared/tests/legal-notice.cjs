const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  LegalNoticeIntakeSchema,
  LegalNoticeSubmissionSchema,
} = require("../dist");

test("Legal Notice intake permits draft fields but rejects arbitrary JSON and identity uploads", () => {
  assert.deepEqual(LegalNoticeIntakeSchema.parse({}), {});
  assert.deepEqual(
    LegalNoticeIntakeSchema.parse({ client: { fullName: " Draft " } }),
    { client: { fullName: "Draft" } },
  );
  for (const input of [
    { aadhaar: "123456789012" },
    { client: { address: "Aadhaar 1234 5678 9012" } },
    { documents: ["identity.png"] },
    { noticee: { unknown: "value" } },
    { issueType: "invented-issue" },
    { status: "paid" },
    [],
  ])
    assert.equal(LegalNoticeIntakeSchema.safeParse(input).success, false);
  assert.equal(LegalNoticeSubmissionSchema.safeParse({}).success, false);
  const details = {
    client: {
      fullName: "Test client",
      mobile: "2025550101",
      address: "Test address",
    },
    noticee: {
      fullName: "Test noticee",
      mobile: "2025550102",
      email: "noticee@example.invalid",
      address: "Test address",
    },
    issueType: "property-dispute",
  };
  assert.equal(LegalNoticeSubmissionSchema.safeParse(details).success, true);
  assert.equal(
    LegalNoticeSubmissionSchema.safeParse({
      ...details,
      noticee: { ...details.noticee, email: "" },
    }).success,
    false,
  );
});
