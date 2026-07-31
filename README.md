# Auctioneer Revisited for WotLK 3.3.5a

Auctioneer Revisited is a maintained fork of Auctioneer Suite 5.9.4961
(WhackyWallaby) for Wrath of the Lich King 3.3.5a servers. The first release
adds profile-aware private-server auction rules while preserving the original
Auctioneer and BeanCounter SavedVariables.

Current version: `5.9.4961-Revisited.1`

## Server Rules

Open Auctioneer's Configure window and select **Server Rules**. The settings
belong to the active Auctioneer profile.

| Preset | Custom rules | Deposit | Minimum | Duration | Tolerance |
| --- | --- | ---: | ---: | ---: | ---: |
| Standard WotLK | Off | 100% | Original 1 silver behavior | 1x | Original matching |
| Hellscream | On | 20% | 1 copper | 4x | 6 hours |

With custom rules enabled, the adjusted deposit is:

```text
floor(standard calculated deposit * deposit rate percent / 100)
```

The configured minimum is applied after scaling. Auctioneer uses that result
for displayed estimates, deposit-adjusted pricing, posting affordability
checks, and BeanCounter posting records.

BeanCounter uses each posting's recorded start time and selected duration when
custom rules are enabled. Expirations must fall within the configured
tolerance of the expected expiration. Sales and cancellations must fall
within the candidate auction's effective lifetime, including tolerance.

## Appraiser Seller Matching

Enable **Match clicked seller** beneath Appraiser's competing-auction table,
then click anywhere in a seller's row. Appraiser copies that auction's exact
per-item starting bid and buyout, switches the item to Fixed pricing, and
disables ordinary competition matching. The checkbox does not post an auction.
Alt-clicking a seller continues to manage the seller ignore list.

Seller-matched values bypass Appraiser's optional rounding so posting a
different stack size preserves the selected auction's per-item prices.
Manually changing the price, pricing model, or ordinary matching option clears
the seller-match marker.

## Installation

1. Exit the game completely.
2. Back up the existing Auctioneer Suite directories under
   `Interface\AddOns`.
3. Back up `AucAdvanced.lua`, `AucAdvanced.lua.bak`, `BeanCounter.lua`, and
   `BeanCounter.lua.bak` from the account's `WTF\Account\<account>\SavedVariables`
   directory.
4. Remove the old Auctioneer Suite addon directories. Do not mix old and new
   module folders.
5. Extract the complete release ZIP into `Interface\AddOns`.
6. Start the game, enable the suite, and choose a Server Rules preset.

The release ZIP contains the full matched suite: Auctioneer, BeanCounter,
Enchantrix, Informant, Stubby, SlideBar, Swatter, and all bundled Auctioneer
modules.

## Upgrade And Restore

For an upgrade, exit the game, repeat the backups, replace every suite
directory with the complete new release, and retain the SavedVariables.

To restore the previous installation, exit the game, remove all Revisited
suite directories, restore the backed-up addon directories, and restore the
SavedVariables only if a data rollback is also required.

Selecting **Standard WotLK** disables the fork's custom calculation and
matching paths without deleting any profile or BeanCounter data.

## Development

Install the pinned development dependencies and run the complete validation:

```powershell
npm install
npm run validate
```

`npm run validate` runs the production Lua calculation tests, verifies the
runtime wiring and metadata, parses every modified runtime Lua file as Lua 5.1,
creates a deterministic full-suite ZIP, and verifies its contents.

Automated tests cannot replace in-game posting and mail validation. Use
[docs/IN_GAME_VALIDATION.md](docs/IN_GAME_VALIDATION.md) before publishing a
release.

## Upstream And License

The source baseline is the official Auctioneer Suite 5.9.4961 WhackyWallaby
release. Archive provenance and its SHA-256 digest are recorded in
[docs/UPSTREAM.md](docs/UPSTREAM.md).

Auctioneer Revisited preserves upstream notices and is distributed under the
GNU General Public License, version 2 or later. See [LICENSE](LICENSE).
