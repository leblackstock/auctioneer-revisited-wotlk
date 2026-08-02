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
  path.resolve(__dirname, "../BeanCounter/BeanCounterAPI.lua"),
  "utf8",
);

function runLua(assertions) {
  const state = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(state);

  const bootstrap = `
    function LibStub()
      return { Set = function() end }
    end

    function strsplit(delimiter, value)
      local fields = {}
      local start = 1
      while true do
        local position = string.find(value, delimiter, start, true)
        if not position then
          table.insert(fields, string.sub(value, start))
          break
        end
        table.insert(fields, string.sub(value, start, position - 1))
        start = position + string.len(delimiter)
      end
      return table.unpack(fields)
    end

    tinsert = table.insert
    tremove = table.remove
    sort = table.sort
    strlower = string.lower
    time = function() return 10000 end
    GetRealmName = function() return "Garrosh" end

    BeanCounter = {
      getLocals = function()
        return {
          realmName = "Garrosh",
          playerData = true,
          debugPrint = function() end,
        }, function() end, function() return false end, function() end,
          function(key) return key end
      end,
    }

    BeanCounterDB = {
      Garrosh = {
        Cloudbreaker = {
          completedAuctions = {
            ["36912"] = {
              faction = { "2;1;1;1;1;1;seller;9900;x;x" },
            },
          },
          completedAuctionsNeutral = {
            ["36912"] = {
              neutral = {
                "3;1;1;1;1;1;seller;9800;x;x",
                "4;1;1;1;1;1;seller;9700;x;x",
              },
            },
          },
          failedAuctions = {
            ["36912"] = {
              faction = { "5;1;1;1;1;1;seller;9600;x;x" },
            },
          },
          failedAuctionsNeutral = {
            ["36912"] = {
              neutral = { "6;1;1;1;1;1;seller;9500;x;x" },
            },
          },
        },
      },
    }
  `;

  const script = `${bootstrap}\n${source}\n${assertions}`;
  const status = lauxlib.luaL_dostring(state, to_luastring(script));
  if (status !== lua.LUA_OK) {
    const message = to_jsstring(lua.lua_tostring(state, -1));
    throw new Error(message);
  }
}

test("BeanCount matcher combines faction and neutral auction outcomes", () => {
  runLua(`
    BeanCounter.API.decodeLink = function() return "36912" end
    BeanCounter.API.SplitServerKey = function() return "Garrosh" end

    local success, failed = BeanCounter.API.getAHSoldFailed(
      "Cloudbreaker", "item:36912", nil, "Garrosh-Horde"
    )
    assert(success == 3)
    assert(failed == 2)

    local recentSuccess, recentFailed, successQty, failedQty =
      BeanCounter.API.getAHSoldFailed(
        "Cloudbreaker", "item:36912", 1, "Garrosh-Horde"
      )
    assert(recentSuccess == 3)
    assert(recentFailed == 2)
    assert(successQty == 9)
    assert(failedQty == 11)
  `);
});
