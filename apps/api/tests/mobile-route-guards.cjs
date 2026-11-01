const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
test("mobile auth registry covers every root navigator screen and all advocate paths", () => {
  const groups = {
    public: [],
    advocate: [],
    clientTabs: [],
    authenticated: [],
  };
  function add(name) {
    const group =
      name === "index" ||
      name.startsWith("(auth)/") ||
      name.startsWith("onboarding/")
        ? "public"
        : name.startsWith("advocate/") || name === "(advocate)"
          ? "advocate"
          : name === "(tabs)"
            ? "clientTabs"
            : "authenticated";
    groups[group].push(name);
  }
  function walk(folder, prefix = "") {
    for (const name of fs.readdirSync(folder).sort()) {
      const file = path.join(folder, name);
      if (fs.statSync(file).isDirectory()) {
        if (fs.existsSync(path.join(file, "_layout.tsx"))) add(prefix + name);
        else walk(file, prefix + name + "/");
      } else if (name.endsWith(".tsx") && !name.startsWith("_"))
        add(prefix + name.slice(0, -4));
    }
  }
  walk("../mobile/app");
  assert.deepEqual(require("../../mobile/lib/auth-routes.json"), groups);
  assert.ok(
    groups.authenticated.some((name) =>
      name.startsWith("services/district-court/advocate/"),
    ),
  );
  assert.ok(groups.advocate.some((name) => name.startsWith("advocate/")));
});

test('mobile source contains no blocking browser alert calls', () => {
  const root = path.resolve(__dirname, '../../mobile');
  const violations = [];
  function inspect(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', 'dist', '.expo', 'assets'].includes(entry.name)) continue;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) inspect(file);
      else if (/\.[cm]?[jt]sx?$/.test(entry.name) && /\b(?:window\.|globalThis\.)?alert\s*\(/.test(fs.readFileSync(file, 'utf8')))
        violations.push(path.relative(root, file));
    }
  }
  inspect(root);
  assert.deepEqual(violations, [], 'Use inline screen feedback, never a blocking browser alert');
});
