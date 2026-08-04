# In-Game Validation

Run this checklist on a disposable SavedVariables backup before publishing a
release.

## Setup

- Confirm every suite folder comes from the same Revisited ZIP.
- Confirm the addon list reports `5.9.4961-Revisited.1`.
- Confirm existing Auctioneer profiles and BeanCounter history load.
- Change profiles, run `/reload`, and confirm each profile retains its preset
  and numeric values.

## Standard WotLK

- Apply the Standard WotLK preset.
- Confirm ordinary 12, 24, and 48-hour deposit displays.
- Post an auction and verify the affordability check matches the server API.
- Confirm existing BeanCounter sale, cancellation, and expiration matching.

## Hellscream

- Apply the Hellscream preset and run `/reload`.
- Confirm `5376c` standard deposit displays as `1075c`.
- Confirm `338c` standard deposit displays as `67c`.
- Confirm a calculated value below `1c` displays as `1c`.
- Test an insufficient-funds rejection.
- Post one 12-hour selection and verify the server treats it as 48 hours.
- Complete a successful sale and collect the auction mail.
- Cancel an auction and collect the returned item.
- Allow an auction to expire naturally and collect the returned item.
- Collect multiple auction mails with Postal or another bulk-mail addon.
- Confirm every event reconciles to the correct BeanCounter posting record.
- Confirm no `Failure for completedAuctions`, `failedAuctions`, or
  `cancelledAuctions` message is produced for the tested records.

## Appraiser Seller Click Pricing

- Select an item in Appraiser and refresh its competing auctions.
- Under **Click seller:**, enable **Match** beneath the results.
- Click a seller row with both a bid and buyout.
- Confirm Appraiser changes the item to Fixed pricing and unchecks ordinary
  price matching.
- Confirm Bid per item and Buy per item exactly match the selected row's
  Min/ea and Buy/ea values.
- Change the posting stack size and confirm the displayed stack totals retain
  the same per-item prices, even when Appraiser rounding is enabled.
- With that seller still highlighted, enable **Undercut 1%**.
- Confirm **Match** becomes unchecked and the posting price immediately changes
  to 99% of both selected per-item prices, rounded down to whole copper.
- Re-enable **Match** and confirm **Undercut 1%** becomes unchecked and the
  exact selected prices are restored.
- Click the active mode again and confirm both modes are unchecked. Select a
  different row and confirm the current posting price remains unchanged.
- Test a 1-copper bid and buyout and confirm **Undercut 1%** keeps both values
  at 1 copper.
- Alt-click the same seller and confirm the existing ignore dialog still
  opens without changing the posting price.
- Click a bid-only auction and confirm Appraiser leaves the current price
  unchanged.
- Confirm no auction is queued until the normal Post Items command is used.

## Restore

- Exit the game.
- Restore the addon and SavedVariables backups.
- Confirm the restored suite loads before deleting the validation backups.
