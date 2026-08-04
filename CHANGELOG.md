# Changelog

## Unreleased

- Made Appraiser's BeanCount matcher include both faction and neutral Auction
  House successes and failures without requiring a display toggle.
- Made the Hellscream server-rule preset the default for profiles without
  saved server-rule values.
- Added mutually exclusive Appraiser controls that either match a clicked
  seller's per-item prices or undercut both prices by 1% in Fixed pricing.
- Seller-click prices bypass the ordinary matcher and optional rounding so
  different stack sizes retain the selected auction's per-item prices.

## 5.9.4961-Revisited.1

- Added profile-aware Standard WotLK and Hellscream server-rule presets.
- Added configurable deposit percentage, minimum deposit, duration multiplier,
  and BeanCounter matching tolerance.
- Routed custom deposits through Auctioneer estimates, posting affordability
  checks, and BeanCounter posting records.
- Added candidate-specific BeanCounter matching for custom-rule sales,
  cancellations, and natural expirations.
- Enabled BeanCounter's neutral Auction House history filter by default while
  preserving a persistent user toggle.
- Preserved the upstream deposit API and BeanCounter matching paths when
  custom rules are disabled.
- Updated installable suite metadata for the WotLK 3.3.5a interface.
- Added Lua 5.1 parsing, production calculation tests, integration checks, and
  deterministic complete-suite packaging.
