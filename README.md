# Boardcord
A bot for playing quick minigames with other server members, right in Discord itself!

## Adding the bot
-- WIP --

## Self-hosting
If you want to host the bot yourself, then you'll first need to install node.js. I won't be getting into the instructions for that here, since it shouldn't be too hard to look up on your own - and if you can't complete this step, then self-hosting may not be the wisest idea anyways, as you may run into many basic issues in the attempt.

Once you have done so, follow these instructions:
1. Clone this repository to a channel of your choice.
2. In a terminal, open the folder, and run `npm init`.
3. Once you have done so, the following packages should be installed:
 * `discord.js`
 * `enmap`
4. In the `config` folder, edit `global_config_example.js` (see below) to your liking (most importantly, adding your own bot token), then rename the file to `global_config.js`.

After that, you should be ready to run the bot! Just run the command `node index.js` (or `node .` if you want to be fancy) and the bot should be up and running.

## Configuration
All global configurations are stored in a simple `.js` file with a module export. It should be well commented enough that edits are easily done to the desired values.

Per-server configuration (such as server-specific prefixes, game defaults, etc.) are all configured in-bot and stored in `*.sqlite` files using, well, SQLite. This probably shouldn't be human-edited.

All configuration files are stored in `./config` and its subfolders.
