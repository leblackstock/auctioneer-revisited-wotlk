--[[
	Auctioneer Revisited
	Version: 5.9.4961-Revisited.1

	Profile-aware private-server auction rules.

	License:
		This program is free software; you can redistribute it and/or
		modify it under the terms of the GNU General Public License
		as published by the Free Software Foundation; either version 2
		of the License, or (at your option) any later version.

		This program is distributed in the hope that it will be useful,
		but WITHOUT ANY WARRANTY; without even the implied warranty of
		merchantability or FITNESS FOR A PARTICULAR PURPOSE. See the
		GNU General Public License for more details.
]]

if not AucAdvanced or not AucAdvanced.Settings then return end

AucAdvanced.ServerRules = {}
local lib = AucAdvanced.ServerRules
local settings = AucAdvanced.Settings
local floor = math.floor
local abs = math.abs
local max = math.max
local min = math.min
local tonumber = tonumber
local _TRANS = AucAdvanced.localizations

local KEY_ENABLED = "core.serverrules.enabled"
local KEY_DEPOSIT_PERCENT = "core.serverrules.depositpercent"
local KEY_MINIMUM_DEPOSIT = "core.serverrules.minimumdeposit"
local KEY_DURATION_MULTIPLIER = "core.serverrules.durationmultiplier"
local KEY_TOLERANCE_HOURS = "core.serverrules.tolerancehours"

local STANDARD_MINIMUM_DEPOSIT = 100
local STANDARD_TOLERANCE_HOURS = 6

settings.SetDefault(KEY_ENABLED, false)
settings.SetDefault(KEY_DEPOSIT_PERCENT, 100)
settings.SetDefault(KEY_MINIMUM_DEPOSIT, STANDARD_MINIMUM_DEPOSIT)
settings.SetDefault(KEY_DURATION_MULTIPLIER, 1)
settings.SetDefault(KEY_TOLERANCE_HOURS, STANDARD_TOLERANCE_HOURS)

local function getNumber(key, fallback, minimum, maximum)
	local value = tonumber(settings.GetSetting(key)) or fallback
	value = max(minimum, min(maximum, value))
	return value
end

function lib.IsEnabled()
	return settings.GetSetting(KEY_ENABLED) and true or false
end

function lib.GetDepositPercent()
	return getNumber(KEY_DEPOSIT_PERCENT, 100, 0, 1000)
end

function lib.GetMinimumDeposit()
	return floor(getNumber(KEY_MINIMUM_DEPOSIT, STANDARD_MINIMUM_DEPOSIT, 0, 100000000))
end

function lib.GetDurationMultiplier()
	if not lib.IsEnabled() then return 1 end
	return getNumber(KEY_DURATION_MULTIPLIER, 1, 1, 20)
end

function lib.GetToleranceHours()
	return getNumber(KEY_TOLERANCE_HOURS, STANDARD_TOLERANCE_HOURS, 0, 168)
end

function lib.GetToleranceSeconds()
	return lib.GetToleranceHours() * 60 * 60
end

function lib.AdjustDeposit(standardDeposit)
	standardDeposit = tonumber(standardDeposit)
	if not standardDeposit then return end
	standardDeposit = floor(max(0, standardDeposit))

	if not lib.IsEnabled() then
		return max(standardDeposit, STANDARD_MINIMUM_DEPOSIT)
	end

	local adjustedDeposit = floor(standardDeposit * lib.GetDepositPercent() / 100)
	return max(adjustedDeposit, lib.GetMinimumDeposit())
end

function lib.GetEffectiveDurationSeconds(recordedDurationMinutes)
	recordedDurationMinutes = tonumber(recordedDurationMinutes)
	if not recordedDurationMinutes then return end
	return recordedDurationMinutes * 60 * lib.GetDurationMultiplier()
end

function lib.GetExpectedExpiration(startTime, recordedDurationMinutes)
	startTime = tonumber(startTime)
	local duration = lib.GetEffectiveDurationSeconds(recordedDurationMinutes)
	if not startTime or not duration then return end
	return startTime + duration
end

function lib.MatchesExpiration(startTime, recordedDurationMinutes, eventTime)
	eventTime = tonumber(eventTime)
	local expectedExpiration = lib.GetExpectedExpiration(startTime, recordedDurationMinutes)
	if not eventTime or not expectedExpiration then return false end
	return abs(eventTime - expectedExpiration) <= lib.GetToleranceSeconds()
end

function lib.IsEventWithinAuction(startTime, recordedDurationMinutes, eventTime)
	startTime = tonumber(startTime)
	eventTime = tonumber(eventTime)
	local expectedExpiration = lib.GetExpectedExpiration(startTime, recordedDurationMinutes)
	if not startTime or not eventTime or not expectedExpiration then return false end
	local tolerance = lib.GetToleranceSeconds()
	return eventTime >= startTime - tolerance and eventTime <= expectedExpiration + tolerance
end

function lib.ApplyPreset(preset)
	if preset == "hellscream" then
		settings.SetSetting(KEY_DEPOSIT_PERCENT, 20)
		settings.SetSetting(KEY_MINIMUM_DEPOSIT, 1)
		settings.SetSetting(KEY_DURATION_MULTIPLIER, 4)
		settings.SetSetting(KEY_TOLERANCE_HOURS, 6)
		settings.SetSetting(KEY_ENABLED, true)
	elseif preset == "standard" then
		settings.SetSetting(KEY_ENABLED, false)
		settings.SetSetting(KEY_DEPOSIT_PERCENT, 100)
		settings.SetSetting(KEY_MINIMUM_DEPOSIT, STANDARD_MINIMUM_DEPOSIT)
		settings.SetSetting(KEY_DURATION_MULTIPLIER, 1)
		settings.SetSetting(KEY_TOLERANCE_HOURS, STANDARD_TOLERANCE_HOURS)
	end
end

function lib.GetPreset()
	if not lib.IsEnabled() then return "standard" end
	if lib.GetDepositPercent() == 20
		and lib.GetMinimumDeposit() == 1
		and lib.GetDurationMultiplier() == 4
		and lib.GetToleranceHours() == 6
	then
		return "hellscream"
	end
	return "custom"
end

function lib.PresetSetting(operation, value)
	if operation == "getdefault" then
		return "standard"
	elseif operation == "getsetting" then
		return lib.GetPreset()
	elseif operation == "set" then
		lib.ApplyPreset(value)
	end
end

function lib.AddConfig(gui)
	local id = gui:AddTab(_TRANS("ASR_Interface_ServerRules"))
	gui:MakeScrollable(id)

	gui:AddControl(id, "Header", 0, _TRANS("ASR_Interface_ServerRulesHeader"))
	gui:AddControl(id, "Selectbox", 0, 1, {
		{"standard", _TRANS("ASR_Interface_Standard")},
		{"hellscream", _TRANS("ASR_Interface_Hellscream")},
		{"custom", _TRANS("ASR_Interface_Custom")},
	}, lib.PresetSetting, _TRANS("ASR_Interface_Preset"))
	gui:AddTip(id, _TRANS("ASR_HelpTooltip_Preset"))

	gui:AddControl(id, "Checkbox", 0, 1, KEY_ENABLED, _TRANS("ASR_Interface_Enable"))
	gui:AddTip(id, _TRANS("ASR_HelpTooltip_Enable"))

	gui:AddControl(id, "NumberBox", 0, 1, KEY_DEPOSIT_PERCENT, 0, 1000, _TRANS("ASR_Interface_DepositPercent"))
	gui:AddTip(id, _TRANS("ASR_HelpTooltip_DepositPercent"))

	gui:AddControl(id, "NumberBox", 0, 1, KEY_MINIMUM_DEPOSIT, 0, 100000000, _TRANS("ASR_Interface_MinimumDeposit"))
	gui:AddTip(id, _TRANS("ASR_HelpTooltip_MinimumDeposit"))

	gui:AddControl(id, "NumberBox", 0, 1, KEY_DURATION_MULTIPLIER, 1, 20, _TRANS("ASR_Interface_DurationMultiplier"))
	gui:AddTip(id, _TRANS("ASR_HelpTooltip_DurationMultiplier"))

	gui:AddControl(id, "NumberBox", 0, 1, KEY_TOLERANCE_HOURS, 0, 168, _TRANS("ASR_Interface_Tolerance"))
	gui:AddTip(id, _TRANS("ASR_HelpTooltip_Tolerance"))

	gui:AddHelp(id, "custom server rules",
		_TRANS("ASR_Help_CustomRules"),
		_TRANS("ASR_Help_CustomRulesAnswer"))
end

lib.Keys = {
	Enabled = KEY_ENABLED,
	DepositPercent = KEY_DEPOSIT_PERCENT,
	MinimumDeposit = KEY_MINIMUM_DEPOSIT,
	DurationMultiplier = KEY_DURATION_MULTIPLIER,
	ToleranceHours = KEY_TOLERANCE_HOURS,
}
