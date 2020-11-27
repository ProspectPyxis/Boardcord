# Boardcord

A bot for playing quick minigames with other server members, right in Discord itself!<br>
*This bot is currently in early alpha - code is very much subject to breakage and refactoring. You have been warned!*

## Adding the bot

-- WIP --

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md).

## Dependencies

This bot requires the following packages at the minimum:
- `discord.js`
- `enmap` and `better-sqlite-pool`
- `winston` and `logform`
- `nanoid`
- `knuth-shuffle`
- `number-words`

Certain games may require these additional packages:
- `2d-array-rotation`
- `chance`

## Self-hosting

If you want to host the bot yourself, then you'll first need to install node.js. I won't be getting into the instructions for that here, since it shouldn't be too hard to look up on your own - and if you can't complete this step, then self-hosting may not be the wisest idea anyways, as you may run into many basic issues in the attempt.

Once you have done so, follow these instructions:

1. Open the terminal, CD into a folder of your choice, then clone the repository by running the following (this command specifically is recommended as to not clone the `gh-pages` branch unnecessarily):
```
$ git clone --single-branch -b master https://github.com/ProspectPyxis/Boardcord.git .
```
2. In a terminal, open the folder, and run `npm init`.
3. Once you have done so, install the required dependencies (see above).
4. In the `config` folder, edit `global_config.js.example` (see below) to your liking (most importantly, adding your own bot token), then rename the file to `global_config.js`.

After that, you should be ready to run the bot! Just run the command `node index.js` (or `node .` if you want to be fancy) and the bot should be up and running.

## Configuration

-- WIP --
