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
strings["APPR_Help_SellerPriceUnavailable"] = "That auction does not have a usable seller, bid, and buyout price to match."
strings["APPR_HelpTooltip_MatchSellerPrice"] = "When enabled, clicking a seller copies that auction's exact per-item bid and buyout into Fixed pricing. Alt-click still manages the seller ignore list."
strings["APPR_Interface_MatchSellerPrice"] = "Match clicked seller"
