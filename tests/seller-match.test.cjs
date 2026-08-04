"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  lua,
  lauxlib,
  lualib,
  to_luastring,
  to_jsstring,
} = require("fengari");

const root = path.resolve(__dirname, "..");
const helperSource = fs.readFileSync(
  path.join(
    root,
    "Auc-Advanced/Modules/Auc-Util-Appraiser/AppraiserSellerMatch.lua",
  ),
  "utf8",
);

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function runLua(assertions) {
  const state = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(state);

  const bootstrap = `
    SellerMatchModule = {}
    AucAdvanced = {
      GetModule = function(moduleType, moduleName)
        assert(moduleType == "Util")
        assert(moduleName == "Appraiser")
        return SellerMatchModule
      end,
    }
  `;

  const status = lauxlib.luaL_dostring(
    state,
    to_luastring(`${bootstrap}\n${helperSource}\n${assertions}`),
  );
  if (status !== lua.LUA_OK) {
    throw new Error(to_jsstring(lua.lua_tostring(state, -1)));
  }
}

test("seller matching returns exact per-item bid and buyout values", () => {
  runLua(`
    local row = {
      "Guildmate", "48h", 20, 1234, 1300, 1500,
      24680, 26000, 30000, "item:12345:0:0:0:0:0:0:0:80",
    }
    local seller, bid, buyout = SellerMatchModule.GetSellerMatchPrices(row)
    assert(seller == "Guildmate")
    assert(bid == 1234)
    assert(buyout == 1500)

    row[3] = 5
    seller, bid, buyout = SellerMatchModule.GetSellerMatchPrices(row)
    assert(seller == "Guildmate")
    assert(bid == 1234)
    assert(buyout == 1500)
  `);
});

test("seller click pricing undercuts both per-item prices by 1 percent", () => {
  runLua(`
    local row = {
      "Guildmate", "48h", 20, 1234, 1300, 1500,
      24680, 26000, 30000, "item:12345:0:0:0:0:0:0:0:80",
    }
    local seller, bid, buyout = SellerMatchModule.GetSellerClickPrices(row, "undercut")
    assert(seller == "Guildmate")
    assert(bid == 1221)
    assert(buyout == 1485)

    row[4] = 1
    row[6] = 1
    seller, bid, buyout = SellerMatchModule.GetSellerClickPrices(row, "undercut")
    assert(seller == "Guildmate")
    assert(bid == 1)
    assert(buyout == 1)

    assert(SellerMatchModule.GetSellerClickPrices(row, "unknown") == nil)
  `);
});

test("seller matching rejects incomplete or invalid auction rows", () => {
  runLua(`
    assert(SellerMatchModule.GetSellerMatchPrices(nil) == nil)
    assert(SellerMatchModule.GetSellerMatchPrices({}) == nil)
    assert(SellerMatchModule.GetSellerMatchPrices({"", "48h", 1, 100, 0, 200}) == nil)
    assert(SellerMatchModule.GetSellerMatchPrices({"Alt", "48h", 1, 100, 0, 0}) == nil)
    assert(SellerMatchModule.GetSellerMatchPrices({"Alt", "48h", 1, 201, 0, 200}) == nil)
    assert(SellerMatchModule.GetSellerClickPrices(nil, "undercut") == nil)
    assert(SellerMatchModule.GetSellerClickPrices({}, "undercut") == nil)
  `);
});

test("Appraiser wires mutually exclusive seller-click pricing modes", () => {
  const appraiser = read(
    "Auc-Advanced/Modules/Auc-Util-Appraiser/Appraiser.lua",
  );
  const frame = read(
    "Auc-Advanced/Modules/Auc-Util-Appraiser/AprFrame.lua",
  );
  const embed = read(
    "Auc-Advanced/Modules/Auc-Util-Appraiser/Embed.xml",
  );
  const toc = read("Auc-Advanced/Auc-Advanced.toc");

  assert.match(
    appraiser,
    /SetDefault\("util\.appraiser\.matchseller", false\)/,
  );
  assert.match(
    appraiser,
    /SetDefault\("util\.appraiser\.undercutseller", false\)/,
  );
  assert.match(frame, /CreateFrame\("CheckButton", "AppraiserMatchSeller"/);
  assert.match(
    frame,
    /CreateFrame\("CheckButton", "AppraiserUndercutSeller"/,
  );
  assert.match(
    frame,
    /frame\.imageview\.purchase\.matchSeller:SetChecked\(matchSeller\)[\s\S]*?frame\.imageview\.purchase\.undercutSeller:SetChecked\(undercutSeller\)/,
  );
  assert.match(frame, /set\("util\.appraiser\.matchseller", matchSeller\)/);
  assert.match(
    frame,
    /set\("util\.appraiser\.undercutseller", undercutSeller\)/,
  );
  assert.match(frame, /lib\.GetSellerClickPrices\(selected, mode\)/);
  assert.match(frame, /set\(itemSetting\.\."\.match", "off"\)/);
  assert.match(frame, /set\(itemSetting\.\."\.model", "fixed"\)/);
  assert.match(frame, /set\(itemSetting\.\."\.fixed\.bid", bid\)/);
  assert.match(frame, /set\(itemSetting\.\."\.fixed\.buy", buyout\)/);
  assert.match(frame, /set\(itemSetting\.\."\.sellermatch", seller\)/);
  assert.match(
    frame,
    /set\(itemSetting\.\."\.sellermatch", seller\)\s+lib\.ClearItem\(\)\s+frame\.salebox\.model\.value = "fixed"/,
  );
  assert.match(
    frame,
    /if IsAltKeyDown\(\) then[\s\S]*?else\s+local mode = private\.GetSellerClickMode\(\)\s+if mode then private\.ApplySelectedSellerPrice\(mode\) end/,
  );
  assert.match(
    frame,
    /if applySelection and mode and frame\.imageview\.sheet:GetSelection\(\) then\s+private\.ApplySelectedSellerPrice\(mode\)/,
  );
  assert.match(
    frame,
    /elseif \(callback == "OnClickCell"\) then\s+--[^\n]+\s+private\.onClick\(button, row, column, curDir\)/,
  );
  assert.match(
    frame,
    /if frame\.IsSellerMatched\(sig\) then return value end/,
  );
  assert.equal(
    (frame.match(/frame\.GetPostingBid\(itemBid(?: [^,\n]+)?, sig\)/g) || [])
      .length,
    4,
  );
  assert.equal(
    (frame.match(/frame\.GetPostingBuy\(itemBuy(?: [^,\n]+)?, sig\)/g) || [])
      .length,
    4,
  );

  const applyStart = frame.indexOf(
    "function private.ApplySelectedSellerPrice(mode)",
  );
  const applyEnd = frame.indexOf(
    "function private.SetSellerClickMode",
    applyStart,
  );
  const applyBlock = frame.slice(applyStart, applyEnd);
  assert.ok(applyStart >= 0 && applyEnd > applyStart);
  assert.doesNotMatch(applyBlock, /PostAuction|QueueBuy/);

  const strings = read("Auc-Advanced/CoreAppraiserRevisitedStrings.lua");
  assert.match(strings, /\["APPR_Interface_ClickSellerPrice"\] = "Click seller:"/);
  assert.match(strings, /\["APPR_Interface_MatchSellerPrice"\] = "Match"/);
  assert.match(
    strings,
    /\["APPR_Interface_UndercutSellerPrice"\] = "Undercut 1%"/,
  );

  const appraiserIndex = embed.indexOf('<Script file="Appraiser.lua"/>');
  const helperIndex = embed.indexOf(
    '<Script file="AppraiserSellerMatch.lua"/>',
  );
  const frameIndex = embed.indexOf('<Script file="AprFrame.lua"/>');
  assert.ok(appraiserIndex >= 0);
  assert.ok(helperIndex > appraiserIndex);
  assert.ok(frameIndex > helperIndex);
  assert.match(toc, /^CoreAppraiserRevisitedStrings\.lua$/m);
});
