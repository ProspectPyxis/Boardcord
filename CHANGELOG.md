# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). All dates follow ISO format (year-month-day).

## [Unreleased]
### Changed
- Moved global_config file to root folder
- Miscellaneous method changes

## [0.1.0] - 2020-11-24
### Added
- Basic commands: `ping`, `help`, `credits`, `shutdown`
- Common core classes like `Game`, `GameSetup`
- Command, events, and games loading
- `setupgame` command, with subcommands `invite`, `option`, `turns`, `resend`, `leave`, `kick`, `start`, `cancel`, `redo`
- `game` command for managing the running game, with subcommands `resend`, `abort`
- New game: Tic Tac Toe
