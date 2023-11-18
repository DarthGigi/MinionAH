# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
