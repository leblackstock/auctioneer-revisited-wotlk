"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function topLevelTocs() {
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .flatMap((entry) => {
      const directory = path.join(root, entry.name);
      return fs
        .readdirSync(directory)
        .filter((name) => name.toLowerCase().endsWith(".toc"))
        .map((name) => path.join(directory, name));
    });
}

test("custom rules are wired through every required runtime boundary", () => {
  const corePost = read("Auc-Advanced/CorePost.lua");
  const postMonitor = read("BeanCounter/PostMonitor.lua");
  const mail = read("BeanCounter/BeanCounterMail.lua");

  assert.match(corePost, /AucAdvanced\.ServerRules\.AdjustDeposit\(deposit\)/);
  assert.equal((corePost.match(/GetPostingDeposit\(request,/g) || []).length, 3);
  assert.match(postMonitor, /getAuctionDeposit\(itemLink, runTime, count\)/);
  assert.match(mail, /rules\.MatchesExpiration\(postTime, postRunTime, expiredTime\)/);
  assert.ok(
    (mail.match(/rules\.IsEventWithinAuction\(/g) || []).length >= 2,
    "sale and cancellation matching must use candidate-specific lifetimes",
  );
});

test("CalculateAuctionDeposit remains only in the two documented fallbacks", () => {
  const occurrences = [];

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if ([".git", "dist", "node_modules"].includes(entry.name)) continue;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".lua")) {
        const lines = fs.readFileSync(fullPath, "utf8").split(/\r?\n/);
        lines.forEach((line, index) => {
          if (line.includes("CalculateAuctionDeposit")) {
            occurrences.push({
              file: path.relative(root, fullPath).replaceAll("\\", "/"),
              line: index + 1,
              text: line.trim(),
            });
          }
        });
      }
    }
  }

  walk(root);
  assert.deepEqual(
    occurrences.map(({ file, text }) => ({ file, text })),
    [
      {
        file: "Auc-Advanced/CorePost.lua",
        text: "return CalculateAuctionDeposit(request.duration, request.count)",
      },
      {
        file: "BeanCounter/PostMonitor.lua",
        text: "return CalculateAuctionDeposit(runTime, count)",
      },
    ],
  );
});

test("every installable addon advertises the matched WotLK release", () => {
  const tocs = topLevelTocs();
  assert.equal(tocs.length, 16);

  for (const toc of tocs) {
    const contents = fs.readFileSync(toc, "utf8");
    assert.match(contents, /^## Interface: 30300$/m, path.relative(root, toc));
    assert.match(
      contents,
      /^## Version: 5\.9\.4961-Revisited\.1$/m,
      path.relative(root, toc),
    );
  }
});

test("server rules reuse Auctioneer SavedVariables and profile storage", () => {
  const toc = read("Auc-Advanced/Auc-Advanced.toc");
  const rules = read("Auc-Advanced/CoreServerRules.lua");

  assert.match(
    toc,
    /^## SavedVariables: AucAdvancedConfig, AucAdvancedData$/m,
  );
  assert.doesNotMatch(toc, /^## SavedVariables:.*ServerRules/m);
  for (const key of [
    "core.serverrules.enabled",
    "core.serverrules.depositpercent",
    "core.serverrules.minimumdeposit",
    "core.serverrules.durationmultiplier",
    "core.serverrules.tolerancehours",
  ]) {
    assert.ok(rules.includes(`"${key}"`), key);
  }
});

test("BeanCounter includes neutral Auction House data by default", () => {
  const config = read("BeanCounter/BeanCounterConfig.lua");
  const frames = read("BeanCounter/BeanCounterFrames.lua");

  assert.match(
    config,
    /\["util\.beancounter\.ButtonneutralCheck"\]\s*=\s*true/,
  );
  assert.match(
    frames,
    /frame\.neutralCheck:SetChecked\(get\("util\.beancounter\.ButtonneutralCheck"\)\)/,
  );
  assert.match(
    frames,
    /set\("util\.beancounter\.ButtonneutralCheck", frame\.neutralCheck:GetChecked\(\) and true or false\)/,
  );
});
