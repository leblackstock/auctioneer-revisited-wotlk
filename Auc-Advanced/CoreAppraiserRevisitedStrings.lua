--[[
	Auctioneer Revisited
	Version: 5.9.4961-Revisited.1

	English strings for Revisited Appraiser features.

	License:
		This program is free software; you can redistribute it and/or
		modify it under the terms of the GNU General Public License
		as published by the Free Software Foundation; either version 2
		of the License, or (at your option) any later version.
]]

if not AuctioneerLocalizations or not AuctioneerLocalizations.enUS then return end

local strings = AuctioneerLocalizations.enUS

strings["APPR_Help_SellerPriceMatched"] = "Matched %s at %s bid and %s buyout per item."
strings["APPR_Help_SellerPriceUndercut"] = "Undercut %s by 1%% at %s bid and %s buyout per item."
strings["APPR_Help_SellerPriceUnavailable"] = "That auction does not have a usable seller, bid, and buyout price."
strings["APPR_HelpTooltip_MatchSellerPrice"] = "Click to copy the highlighted seller's exact per-item bid and buyout into Fixed pricing. Click again to turn seller-click pricing off."
strings["APPR_HelpTooltip_UndercutSellerPrice"] = "Click to price 1% below the highlighted seller's per-item bid and buyout. Click again to turn seller-click pricing off."
strings["APPR_Interface_ClickSellerPrice"] = "Click seller:"
strings["APPR_Interface_MatchSellerPrice"] = "Match"
strings["APPR_Interface_UndercutSellerPrice"] = "Undercut 1%"
