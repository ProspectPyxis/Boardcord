const GameSetup = require('../classes/GameSetup.js');

exports.run = async (bot, message, args) => { // eslint-disable-line no-unused-vars
    if (bot.activeGames[message.guild.id] && bot.activeGames[message.guild.id][message.channel.id]) {
        if (bot.activeGames[message.guild.id][message.channel.id].gm.id !== message.author.id) {
            return message.channel.send(`${message.author} Only the host of the game may set it up!`);
        } else {
            bot.activeGames[message.guild.id][message.channel.id].interpretCommand(message, args);
        }
    } else {
        // Check if game exists
        let gameIndex = bot.games.findIndex(element => {
            let g = args.join(' ').toLowerCase();
            return (
                element.gameData.name.toLowerCase() === g ||
                element.gameData.aliases.some(e => e.toLowerCase() === g)
            );
        })
        if (gameIndex === -1)
            return message.channel.send("The game you input could not be found!");

        if (!bot.activeGames[message.guild.id]) bot.activeGames[message.guild.id] = {};
        if (!bot.activeGames[message.guild.id][message.channel.id]) bot.activeGames[message.guild.id][message.channel.id] = new GameSetup(bot, message, bot.games[gameIndex]);
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
    usage: "setup [game] OR setupgame [invite/option/turnorder/resend/start/cancel] [...]",
    examples: ["setup Tic-tac-toe", "setup invite @User#1234 @User2#5678", "setup turnorder 1 @User#1234"]
};
