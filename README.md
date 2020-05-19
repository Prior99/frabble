# Frabble

<img align="right" width="200" height="200" src="https://raw.githubusercontent.com/Prior99/frabble/master/images/logo.png">

[![pipeline status](https://gitlab.com/prior99/frabble/badges/master/pipeline.svg)](https://github.com/Prior99/frabble)
[![coverage report](https://gitlab.com/prior99/frabble/badges/master/coverage.svg)](https://github.com/Prior99/frabble)

A multiplayer crossword written in Typescript.
The game uses WebRTC Data channels for true serverless multiplayer in the browser (Peer-To-Peer).

[![play](https://raw.githubusercontent.com/Prior99/frabble/master/images/play.png)](https://prior99.gitlab.io/frabble)

# Features

<p align="center">
    <img src="https://raw.githubusercontent.com/Prior99/frabble/master/images/screenshot-1.png">
</p>

The following is implemented:

 * P2P Multiplayer with an unlimited amount of players
 * Scoring
 * Official set of rules
 * Checking for turn validity
 * Passing and exchanging letters

Planned:

 * Multiple languages
 * Timer
 * Game over

Non-goals:

 * Dictionary checker

## Contributing

Contributions are welcome. Pull-Requests and Issues are happily accepted.

### Building, Testing and Linting

Yarn is used instead of NPM, so make sure it is installed (`npm i -g yarn`).

```
yarn
yarn start
```

should suffice.


## Contributors

 - Andra Rübsteck
 - Frederick Gnodtke
