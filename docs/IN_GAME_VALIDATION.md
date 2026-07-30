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

## Restore

- Exit the game.
- Restore the addon and SavedVariables backups.
- Confirm the restored suite loads before deleting the validation backups.
