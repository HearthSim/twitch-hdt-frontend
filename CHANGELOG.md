# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Added support for decks in the Classic format type

### Fixed
- Fixed a potential crash when receiving a bad format type through pubsub

### Removed
- Removed the Standard year from copied decks

## [1.1.1] - 2020-11-11
### Fixed
- Fixed two Bob's Buddy percentages being swapped on mobile

## [1.1.0] - 2020-07-30
### Added
- Added Bob's Buddy integration for Battlegrounds  
  *This allows users to view the Battlegrounds outcome odds at their own leisure*

### Fixed
- Improved the scaling behaviour of the deck overlay
- Removed incorrect fatigue tooltip in Battlegrounds

## [1.0.1] - 2020-06-12
### Fixed
- Fixed broken copy behaviour in Chrome by adding a fallback modal

## [1.0.0] - 2020-04-10
### Added
- Added Google Analytics
- Added support for Hearthstone Battlegrounds
- Added a text-based fallback for the copy deck button on mobile
- Added dark theme support to Extension Configuration

### Changed
- Updated for Hearthstone's Year of the Phoenix
- Updated overlay positions for current Twitch player layout
- Improved the unpin behaviour to feel more snappy

### Removed
- Removed Stream preview due to deprecation of unauthenticated API requests

## Fixed
- Fixed passives and buffs having a mana cost of zero in the deck list
- Fixed deck list showing up when playing with an empty deck

## [0.4.1] - 2018-07-19
### Fixed
- Fixed full card art on mobile not respecting the viewer's language
- Replace outdated "activate overlay" image in broadcaster settings

## [0.4.0] - 2018-07-18
### Added
- Added localized card names and art based on the viewer's language

### Fixed
- Fixed deck list buttons being blocked by the Twitch player in windowed mode

## [0.3.0] - 2018-04-10
### Added
- Added mobile support  
  *Mobile viewers can view and copy the deck list on their device*

### Changed
- Show "HSReplay.net" in deck list title when deck has no name

## [0.2.2] - 2018-02-08
### Fixed
- Fixed stream delay being ignored

## [0.2.1] - 2018-02-08
### Changed
- Make the statistics panel only appear after a slight delay

### Fixed
- Ensure "Copy deck" button always copies a canonical deck
- Fixed statistics panel result not being cached
- Fixed deck list position resetting whenever a game ends

## [0.2.0] - 2018-01-18
### Added
- Added statistics panel when hovering collectible cards  
  *Shows various card statistics powered by HSReplay.net*
- Added stream backlinking from HSReplay.net  
  *Can be toggled on or off on the configuration page*
- Added board positioning to configuration page
- Added stream thumbnail to configuration page
- Added toggle for board tooltips to configuration page

### Changed
- Improved icons in deck list header
- Improved scroll behaviour on configuration page

## [0.1.2] - 2017-11-17
### Fixed
- Fixed background image size of card tiles

## [0.1.1] - 2017-11-16
### Added
- Added drag and drop to deck list for viewers  
  *Viewers can use this to override the deck list position on their device*

### Changed
- Updated Hearthstone Deck Tracker download url
- Updated connectivity error message in setup

### Fixed
- Fixed left panel in configuration screen overflowing
- Fixed deck list not reappearing after mouse is kept still
- Fixed too much whitespace when deck list was aligned to left
- Fixed typo in setup

## [0.1.0] - 2017-10-26
### Added
- Added pin/unpin behaviour to deck list  
  *The deck list will now vanish if it's unpinned and the mouse is either offstream or kept still*
- Added flash effect to changing cards in deck list
- Added tooltip for remaining cards in deck

### Changed
- Improved the scaling behaviour of the deck list
- Improved connection setup
- Improved deck list icons
- Updated Hearthstone Deck Tracker download url

### Fixed
- Fixed deck list resetting itself whenever a game ends
- Fixed cards appearing as created if they were in the initial deck but also created
- Fixed black icons in Firefox
- Fixed focus lingering on "Copy deck" button

### Removed
- Removed deck list collapsing as it can now be unpinned

## [0.0.2] - 2017-10-11
### Added
- Added automatic overlay hiding after one minute of inactivity  
  *The overlay will only disappear if you stop playing Hearthstone, not during a long turn*

### Fixed
- Fixed "Show deck list" setting being inverted
- Fixed overlay not disappearing after a match is over
- Fixed missing star on legendary cards in deck list

## 0.0.1 - 2017-10-11
### Added
- Added hover zones for minions, heroes, hero powers, weapons, secrets and quest
- Added a deck list with hover zones over each card
- Added setup interface with connection guide and basic overlay configuration

[Unreleased]: https://github.com/HearthSim/hdt-twitch-extension/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/HearthSim/hdt-twitch-extension/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/HearthSim/hdt-twitch-extension/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/HearthSim/hdt-twitch-extension/compare/v0.4.1...v1.0.0
[0.4.1]: https://github.com/HearthSim/hdt-twitch-extension/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/HearthSim/hdt-twitch-extension/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/HearthSim/hdt-twitch-extension/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/HearthSim/hdt-twitch-extension/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/HearthSim/hdt-twitch-extension/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/HearthSim/hdt-twitch-extension/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/HearthSim/hdt-twitch-extension/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/HearthSim/hdt-twitch-extension/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/HearthSim/hdt-twitch-extension/compare/v0.0.2...v0.1.0
[0.0.2]: https://github.com/HearthSim/hdt-twitch-extension/compare/v0.0.1...v0.0.2
