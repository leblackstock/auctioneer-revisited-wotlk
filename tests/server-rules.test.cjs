"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const {
  lua,
  lauxlib,
  lualib,
  to_luastring,
  to_jsstring,
} = require("fengari");

const source = fs.readFileSync(
  path.resolve(__dirname, "../Auc-Advanced/CoreServerRules.lua"),
  "utf8",
);

function runLua(assertions) {
  const state = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(state);

  const bootstrap = `
    local values = {}
    local defaults = {}
    TestSettings = values
    AucAdvanced = {
      Settings = {
        SetDefault = function(key, value)
          if defaults[key] == nil then defaults[key] = value end
        end,
        GetSetting = function(key)
          if values[key] ~= nil then return values[key] end
          return defaults[key]
        end,
        SetSetting = function(key, value)
          values[key] = value
        end,
      },
      localizations = function(key) return key end,
    }
  `;

  const script = `${bootstrap}\n${source}\n${assertions}`;
  const status = lauxlib.luaL_dostring(state, to_luastring(script));
  if (status !== lua.LUA_OK) {
    const message = to_jsstring(lua.lua_tostring(state, -1));
    throw new Error(message);
  }
}

test("production deposit rules implement Standard and Hellscream presets", () => {
  runLua(`
    local rules = AucAdvanced.ServerRules
    assert(rules.GetPreset() == "standard")
    assert(rules.AdjustDeposit(5376) == 5376)
    assert(rules.AdjustDeposit(0) == 100)

    rules.ApplyPreset("hellscream")
    assert(rules.GetPreset() == "hellscream")
    assert(rules.AdjustDeposit(5376) == 1075)
    assert(rules.AdjustDeposit(338) == 67)
    assert(rules.AdjustDeposit(0) == 1)

    rules.ApplyPreset("standard")
    assert(rules.GetPreset() == "standard")
    assert(rules.AdjustDeposit(338) == 338)
    assert(rules.AdjustDeposit(0) == 100)
  `);
});

test("production duration rules calculate candidate-specific event windows", () => {
  runLua(`
    local rules = AucAdvanced.ServerRules
    rules.ApplyPreset("hellscream")

    local startTime = 1000
    local expected = startTime + (720 * 60 * 4)
    assert(rules.GetExpectedExpiration(startTime, 720) == expected)
    assert(rules.MatchesExpiration(startTime, 720, expected + (6 * 60 * 60)))
    assert(not rules.MatchesExpiration(startTime, 720, expected + (6 * 60 * 60) + 1))
    assert(rules.IsEventWithinAuction(startTime, 720, startTime + 60))
    assert(rules.IsEventWithinAuction(startTime, 720, expected + (6 * 60 * 60)))
    assert(not rules.IsEventWithinAuction(startTime, 720, expected + (6 * 60 * 60) + 1))
  `);
});

test("production Configure builder exposes every profile-aware server rule", () => {
  runLua(`
    local rules = AucAdvanced.ServerRules
    local controls = {}
    local gui = {
      AddTab = function() return 1 end,
      MakeScrollable = function() end,
      AddControl = function(self, id, controlType, column, ...)
        table.insert(controls, {controlType, column, ...})
      end,
      AddTip = function() end,
      AddHelp = function() end,
    }

    rules.AddConfig(gui)
    local keys = {}
    for _, control in ipairs(controls) do
      if control[1] == "Checkbox" then
        keys[control[4]] = true
      elseif control[1] == "NumberBox" then
        assert(control[3] == 1)
        keys[control[4]] = true
      end
    end

    assert(keys[rules.Keys.Enabled])
    assert(keys[rules.Keys.DepositPercent])
    assert(keys[rules.Keys.MinimumDeposit])
    assert(keys[rules.Keys.DurationMultiplier])
    assert(keys[rules.Keys.ToleranceHours])
  `);
});
