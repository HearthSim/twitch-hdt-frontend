# Twitch Extension for Hearthstone Deck Tracker
[![Travis](https://img.shields.io/travis/HearthSim/twitch-hdt-frontend/master.svg)](https://travis-ci.org/HearthSim/twitch-hdt-frontend)

This repository contains the official Twitch extension for Hearthstone Deck Tracker.

Follow the [setup guide](https://hsdecktracker.net/twitch/setup/) to add the extension to your channel.

## Features

- Twitch overlay extension for Hearthstone streams
- Automatic deck list and game state from Hearthstone Deck Tracker (Windows)
- Fully configurable by the broadcaster using the Twitch Dashboard
- Viewers can hover over minions, heroes, hero powers, weapons, secrets and quests
- Movable deck list with hoverable cards and "Copy Deck" button for viewers
- Card statistics panel powered by HSReplay.net
- High resolution card art

## Supported browsers

- Internet Explorer 11
- Last 2 Chrome versions
- Last 2 Firefox versions
- Safari 9

## Development

- Install dependencies: `yarn install`
- Run development server: `yarn dev`
- Release build: `yarn build`
- (Re)format code: `yarn format`
- Lint code: `yarn lint`

## Related projects

- [Hearthstone Deck Tracker](https://github.com/hearthsim/Hearthstone-Deck-Tracker): Tracks Hearthstone games and emits messages
- [Extension Backend Service (EBS)](https://github.com/HearthSim/twitch-hdt-ebs): Verifies setup and relays game messages to the Twitch PubSub service

## License

Copyright © HearthSim - All Rights Reserved
