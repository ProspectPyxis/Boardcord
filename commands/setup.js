const GameSetup = require('../classes/GameSetup.js');
exports.run = async (bot, message, args) => { // eslint-disable-line no-unused-vars
    if (bot.activeGames[message.guild.id] && bot.activeGames[message.guild.id][message.channel.id]) {
        // bot.logger.log('debug', bot.activeGames[message.guild.id][message.channel.id] instanceof Game);
        if (bot.activeGames[message.guild.id][message.channel.id] instanceof GameSetup) {
            if (args[0].match(/^(leave|resend)$/i) && !bot.activeGames[message.guild.id][message.channel.id].players.some(e => e.id == message.author.id))
                return message.channel.send(`${message.author} You must be in the game to make changes to it!`);
            if (bot.activeGames[message.guild.id][message.channel.id].gm.id !== message.author.id)
                return message.channel.send(`${message.author} Only the host of the game may set it up!`);
            else
                bot.activeGames[message.guild.id][message.channel.id].interpretCommand(message, args);
        } else { // Implicit assumption that if it's not GameSetup then it must be an instance of Game
            if (args[0] === 'redo') {
                if (bot.activeGames[message.guild.id][message.channel.id].timeout)
                    bot.activeGames[message.guild.id][message.channel.id].renewGame(message);
                else {
                    let temp = await message.channel.send("The game running in this channel hasn't completed yet!");
                    temp.delete({ timeout: 3000 });
                    return;
                }
            } else {
                let temp = await message.channel.send("A game is already running in this channel!");
                temp.delete({ timeout: 3000 });
                return;
            }
        }
    } else {
        if (bot.activeGames[message.guild.id] && Object.keys(bot.activeGames[message.guild.id]).length >= bot.config.gamesPerSever)
            return message.channel.send(`The game limit per guild has been hit. Please wait for an existing game to end before trying again. (limit: ${bot.config.gamesPerSever})`);

        // Check if using variant shortcut
        if (args.indexOf("/") !== -1) {
            var variant = args.slice(args.indexOf("/") + 1, args.length);
            args = args.slice(0, args.indexOf("/"));
        }

        // Check if game exists
        let gameIndex = bot.games.findIndex(element => element.matchName(args.join(' '), false))
        if (gameIndex === -1)
            return message.channel.send("The game you input could not be found!");

        if (!bot.activeGames[message.guild.id]) bot.activeGames[message.guild.id] = {};
        if (!bot.activeGames[message.guild.id][message.channel.id]) bot.activeGames[message.guild.id][message.channel.id] = new GameSetup(bot, message, bot.games[gameIndex]);

        if (variant) {
            bot.activeGames[message.guild.id][message.channel.id].setVariant(variant.join(' '));
        }

        await bot.activeGames[message.guild.id][message.channel.id].init();
    }
};

exports.conf = {
    enabled: true,
    aliases: ["newgame", "setupgame"],
    requireManageServer: false,
    botOwnerOnly: false,
    hidden: false
};

exports.help = {
    name: "setup",
    description: "Starts a game setup menu, allowing you to invite other players or set game options. Once setup has started, you can also use this command to invite players and set up game options.",
    usage: "setup [game] OR setupgame [invite/option/turns/variant/resend/leave/kick/start/cancel] [...]",
    examples: ["setup Tic-tac-toe", "setup invite @User#1234 @User2#5678", "setup turns 1 @User#1234"]
};
