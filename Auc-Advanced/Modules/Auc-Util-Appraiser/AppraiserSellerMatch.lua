--[[
	Auctioneer Revisited
	Version: 5.9.4961-Revisited.1

	Selected-seller price matching helpers for Appraiser.

	License:
		This program is free software; you can redistribute it and/or
		modify it under the terms of the GNU General Public License
		as published by the Free Software Foundation; either version 2
		of the License, or (at your option) any later version.
]]

if not AucAdvanced then return end

local lib = AucAdvanced.GetModule("Util", "Appraiser")
if not lib then return end

local function GetSellerPrices(selection)
	if type(selection) ~= "table" then return end

	local seller = selection[1]
	local bid = tonumber(selection[4])
	local buyout = tonumber(selection[6])
	if type(seller) ~= "string" or seller == "" then return end
	if not bid or bid < 1 or not buyout or buyout < 1 then return end
	if bid > buyout then return end

	return seller, math.floor(bid), math.floor(buyout)
end

function lib.GetSellerClickPrices(selection, mode)
	local seller, bid, buyout = GetSellerPrices(selection)
	if not seller then return end

	if mode == "undercut" then
		bid = math.max(1, math.floor(bid * 99 / 100))
		buyout = math.max(bid, math.floor(buyout * 99 / 100))
	elseif mode ~= "match" then
		return
	end

	return seller, bid, buyout
end

function lib.GetSellerMatchPrices(selection)
	return lib.GetSellerClickPrices(selection, "match")
end
