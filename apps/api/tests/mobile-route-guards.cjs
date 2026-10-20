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
