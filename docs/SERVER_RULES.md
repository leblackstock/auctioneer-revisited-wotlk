# Server Rules Design

## Settings

Server rules use the existing `AucAdvancedConfig` profile system:

- `core.serverrules.enabled`
- `core.serverrules.depositpercent`
- `core.serverrules.minimumdeposit`
- `core.serverrules.durationmultiplier`
- `core.serverrules.tolerancehours`

No SavedVariable was added. Existing profiles and account data retain their
original format.

## Deposit Flow

`GetDepositCost` first computes Auctioneer's normal raw deposit from vendor
value, faction, stack size, and selected duration.

When custom rules are enabled:

```text
adjusted = floor(rawStandardDeposit * depositPercent / 100)
deposit = max(adjusted, minimumDepositCopper)
```

When custom rules are disabled, Auctioneer retains its original 1-silver
minimum. Posting affordability checks and BeanCounter PostMonitor retain the
original `CalculateAuctionDeposit` API path under the Standard preset.

With custom rules enabled, those paths use `GetDepositCost`. If item data is
unavailable, they safely fall back to `CalculateAuctionDeposit` rather than
blocking a post or losing a BeanCounter record.

## BeanCounter Matching

For a recorded duration in minutes:

```text
effectiveDurationSeconds =
    recordedDurationMinutes * 60 * configuredDurationMultiplier

expectedExpiration =
    recordedStartTime + effectiveDurationSeconds
```

Natural expirations match when the event time is within the configured
tolerance of `expectedExpiration`.

Completed sales and cancellations can occur before expiration, so they match
only candidates whose event time falls between the posting time and expected
expiration, extended by the configured tolerance. When several candidates
remain:

- Expirations choose the smallest difference from expected expiration.
- Completed sales choose the candidate whose expected expiration is closest.
- Cancellations choose the most recently posted valid candidate.

The original fixed and broad matching rules remain in place only when custom
rules are disabled, which makes Standard WotLK a true compatibility preset.

## Active Deposit API Calls

Two `CalculateAuctionDeposit` calls intentionally remain:

- `Auc-Advanced/CorePost.lua`: Standard-preset behavior and item-data fallback.
- `BeanCounter/PostMonitor.lua`: Standard-preset behavior and item-data fallback.

No other active Lua path calls the API directly. All Auctioneer display,
search-profit, and deposit-adjusted pricing paths already use
`GetDepositCost`, whose implementation is now settings-aware.
