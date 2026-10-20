const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("case mutations and append-only events have a single production writer", () => {
  const owner = path.resolve("src/cases/case-state-machine.ts");
  function inspect(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "generated") inspect(file);
      } else if (file.endsWith(".ts")) {
        const source = fs.readFileSync(file, "utf8");
        // A regression gate: new endpoint/seed modules cannot bypass the writer
        // with ORM mutations or literal SQL writes. Test fixtures are not scanned.
        if (path.resolve(file) !== owner) {
          assert.doesNotMatch(source, /\.case(?:Event)?\.(?:create|update|upsert|delete)\w*\s*\(/, file);
          assert.doesNotMatch(source, /\b(?:UPDATE|INSERT\s+INTO|DELETE\s+FROM)\s+"?(?:cases|case_events)"?\b/i, file);
        }
        assert.doesNotMatch(source, /\.caseEvent\.(?:update|upsert|delete)\w*\s*\(/, `${file}: events are append-only`);
      }
    }
  }
  inspect("src");
  inspect("prisma");
});
