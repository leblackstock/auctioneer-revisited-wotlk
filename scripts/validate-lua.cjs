"use strict";

const fs = require("node:fs");
const path = require("node:path");
const luaparse = require("luaparse");

const root = path.resolve(__dirname, "..");
const modifiedRuntimeFiles = [
  "Auc-Advanced/CoreConfig.lua",
  "Auc-Advanced/CoreAppraiserRevisitedStrings.lua",
  "Auc-Advanced/CoreManifest.lua",
  "Auc-Advanced/CorePost.lua",
  "Auc-Advanced/CoreServerRules.lua",
  "Auc-Advanced/CoreServerRulesStrings.lua",
  "Auc-Advanced/CoreSettings.lua",
  "Auc-Advanced/Modules/Auc-Util-Appraiser/Appraiser.lua",
  "Auc-Advanced/Modules/Auc-Util-Appraiser/AppraiserSellerMatch.lua",
  "Auc-Advanced/Modules/Auc-Util-Appraiser/AprFrame.lua",
  "BeanCounter/BeanCounterConfig.lua",
  "BeanCounter/BeanCounterAPI.lua",
  "BeanCounter/BeanCounterFrames.lua",
  "BeanCounter/BeanCounterMail.lua",
  "BeanCounter/PostMonitor.lua",
];
const files = modifiedRuntimeFiles.map((file) => path.join(root, file));

const failures = [];
for (const file of files) {
  try {
    const source = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    luaparse.parse(source, { luaVersion: "5.1" });
  } catch (error) {
    failures.push(`${path.relative(root, file)}: ${error.message}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Parsed all ${files.length} modified runtime Lua files as Lua 5.1.`);
}
