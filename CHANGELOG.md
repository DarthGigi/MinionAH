# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.7] - 2024-01-17

### Changed

- Changed every SVG icon to use [Lucide](https://lucide.dev/) instead of [Heroicons](https://heroicons.com/)

## [1.2.6] - 2024-01-17

### Added

- Added a status indicator for the chat message being sent
- Added more fluid animations to the chat system
- A new API endpoint to get or create chat messages

### Changed

- Refactored the chat code to be more efficient, consistent, and robust
- Changed the chat system to use the new API endpoint instead of forms and SvelteKit actions

## [1.2.5] - 2024-01-17

### Added

- Added the Inter font and set it as a default font if the Minecraft font isn't used

### Changed

- Changed the OG image generation
  - Change URLs to use [MinionAH OG](https://og.minionah.com) instead

### Removed

- Removed the code of the OG image generation
- Removed unused packages

### Fixed

- Fixed the rate limits rules
- Fixed the copy button not copying the right URLs

## [1.2.4] - 2024-01-15

### Added

- Added the ability to set preferences for MinionAH
  - Added a setting dropdown to navbar to set
    - Roman numerals, on or off
    - Minecraft font, on or off

### Changed

- Changed the profile dropdown styling to match the other dropdown styles

### Fixed

- Fixed the tier selector on the home page not triggering a search the first time

## [1.2.3] - 2024-01-14

### Changed

- Changed code to improve Accessibility and Best Practices score in Lighthouse

### Fixed

- Fixed the new message indicator not showing up
- Fixed the last login time not being updated

### Security

- Updated dependencies
- Added CSP and CSRF configurations

## [1.2.2] - 2023-12-17

### Added

- Added a public item craft cost calculation API
- Added a cron job to update the craft cost of minions every 24 hours
- Added price info to the minion profile card popup

## [1.2.1] - 2023-12-13

### Changed

- Changed components to use forms.
  - Wrapped the Tier selector component in a form.
  - Wrapped the Minion selector component in a form.
- Changed all the forms to use [superforms](https://superforms.rocks/)
  - Added better status messages.
  - Added better error handling.
- Refactored code to be more efficient and robust.

### Removed

- Removed unused Minecraft auth/token code.

## [1.2.0] - 2023-12-08

### Changed

- Changed the OAuth2 provider from Microsoft to Mc-Auth.com.
- Changed the Login page design.

### Added

- Added Signup page.

## [1.1.0] - 2023-12-04

### Changed

- Changed the OAuth2 provider from Discord to Microsoft.
- Changed the view of the profile page
  - Redesigned the profile view.
    - Added a 3D model view of the user's Minecraft avatar.
- Changed the hover view of the minion card.
  - Added a 3D head model view of the minion.
  - Added a 3D head model view of the user's Minecraft avatar.
- Changed the navigation bar.
  - Placed the navigation bar on the bottom of the screen on mobile devices.

## [1.0.3] - 2023-11-18

### Changed

- Change the default amount of minions that load from 9 to 18.

### Fixed

- Fixed a duplication of minions bug that would occur when loading more minions.
  - This was introduced by the `loadMinions` API endpoint change in [1.0.2](#102---2023-11-16).

## [1.0.3] - 2023-11-18

### Added

- SEO improvements.
  - Updated various meta tags.
  - Added a robots.txt file.
  - Added a sitemap.xml route.
- Added some links in the logo dropdown menu.
  - Added a Home link.
  - Added GitHub link.

### Changed

- Changed some links in the logo dropdown menu.
  - Indented the links under the About link.
- Changed the OG image generation.
  - Better failure handling.
  - Standardized the image size to 1200x630.

## [1.0.2] - 2023-11-16

### Added

- Alert when something goes wrong.

### Changed

- Changed the `loadMinions` API endpoint from `POST` to `GET`.
- Changed the rate-limiting system.

## [1.0.1] - 2023-11-15

### Added

- Added a dropdown to the logo button.
  - Added an About link.
  - Added Newsroom link.
  - Added Community link.
  - Added Privacy Policy link.
  - Added Terms of Service link.

### Removed

- Removed the Community button from the navbar.

## [1.0.0] - 2023-11-13

### Added

- Added a changelog.
- Added a chat system.
  - Added a chat overview page.
  - Added a chat page for each user.
  - Added an unread message indicator on the home page if the user is logged in.
- Added a view button to view a minion's listing.
- Added tooltips
  - Added a tooltip to the Mithril Infusion icon
  - Added a tooltip to the minion's name in the minion card
  - Added a tooltip to the user's name in the minion card
- Faster database speeds.

### Changed

- Rebuilt the minion selector on the profile page.
  - Added a search bar.
  - Performance improvements.
  - Accessibility improvements.
- Rebuilt the tier selector globally.
  - Performance improvements.
  - Accessibility improvements.
- Rebuilt the input fields globally.
  - Performance improvements.
  - Accessibility improvements.
- Changed the Mithril Infusion checkbox to a switch on the profile page.
- Changed the layout of the minion creation form on the profile page.
- Changed the dialogs on the profile page after creating or deleting a minion.
  - New design.
  - More reliable.
  - Performance improvements.
  - Accessibility improvements.
- Changed the user avatar globally.
  - New design.
  - Uses a fallback now.
  - Performance improvements.
- Changed the share button globally.
  - Added an animation
- Added a new hover effect to the minion card.
  - Now shows the total price
- Changed the profile button dropdown.
  - Rebuilt the dropdown.
    - Performance improvements.
    - Accessibility improvements.
  - Added chats link.
  - Changed the design a bit.

## Fixed

- OG image generation for embeds.
- Various bugs.

## Security

- Updated auth library to the latest version.

## [0.1.0] - Unknown Date

Initial release.
