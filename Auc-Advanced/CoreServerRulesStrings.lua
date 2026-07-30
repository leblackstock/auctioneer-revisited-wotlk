--[[
	Auctioneer Revisited
	Version: 5.9.4961-Revisited.1

	English strings for configurable private-server auction rules.

	License:
		This program is free software; you can redistribute it and/or
		modify it under the terms of the GNU General Public License
		as published by the Free Software Foundation; either version 2
		of the License, or (at your option) any later version.
]]

if not AuctioneerLocalizations or not AuctioneerLocalizations.enUS then return end

local strings = AuctioneerLocalizations.enUS

strings["ASR_Help_CustomRules"] = "What are custom server rules?"
strings["ASR_Help_CustomRulesAnswer"] = "Some private servers use auction deposits or durations that differ from standard Wrath of the Lich King. These profile settings keep Auctioneer estimates, posting checks, and BeanCounter reconciliation aligned with those rules."
strings["ASR_HelpTooltip_DepositPercent"] = "Scales Auctioneer's standard calculated deposit by this percentage before applying the configured minimum."
strings["ASR_HelpTooltip_DurationMultiplier"] = "Multiplies the selected auction duration when BeanCounter determines the expected expiration time."
strings["ASR_HelpTooltip_Enable"] = "Use the configured deposit, duration, and matching rules for this Auctioneer profile."
strings["ASR_HelpTooltip_MinimumDeposit"] = "Sets the smallest configured deposit, in copper, after the percentage is applied."
strings["ASR_HelpTooltip_Preset"] = "Applies a complete set of server-rule values to the current Auctioneer profile."
strings["ASR_HelpTooltip_Tolerance"] = "Allows this many hours of difference when BeanCounter compares auction mail with an expected event time."
strings["ASR_Interface_Custom"] = "Custom"
strings["ASR_Interface_DepositPercent"] = "Deposit rate percent"
strings["ASR_Interface_DurationMultiplier"] = "Auction-duration multiplier"
strings["ASR_Interface_Enable"] = "Enable custom server rules"
strings["ASR_Interface_Hellscream"] = "Hellscream"
strings["ASR_Interface_MinimumDeposit"] = "Minimum deposit (copper)"
strings["ASR_Interface_Preset"] = "Server-rule preset"
strings["ASR_Interface_ServerRules"] = "Server Rules"
strings["ASR_Interface_ServerRulesHeader"] = "Private-server auction rules"
strings["ASR_Interface_Standard"] = "Standard WotLK"
strings["ASR_Interface_Tolerance"] = "BeanCounter matching tolerance (hours)"
