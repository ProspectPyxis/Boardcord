const GameSetup = require('../classes/GameSetup.js');
const Game = require('../classes/Game.js');

exports.run = async (bot, message, args) => { // eslint-disable-line no-unused-vars
    if (bot.activeGames[message.guild.id] && bot.activeGames[message.guild.id][message.channel.id]) {
        if (bot.activeGames[message.guild.id][message.channel.id].gm.id !== message.author.id) {
            return message.channel.send(`${message.author} Only the host of the game may set it up!`);
        } else {
            bot.activeGames[message.guild.id][message.channel.id].interpretCommand(message, args);
        }
    } else {
        if (!bot.activeGames[message.guild.id]) bot.activeGames[message.guild.id] = {};
        if (!bot.activeGames[message.guild.id][message.channel.id]) bot.activeGames[message.guild.id][message.channel.id] = new GameSetup(bot, message, Game);
    }
};

exports.conf = {
    enabled: true,
    aliases: ["newgame", "setup"],
    requireManageServer: false,
    botOwnerOnly: false,
    hidden: false
};

exports.help = {
    name: "setupgame",
    description: "Starts a game setup menu, allowing you to invite other players or set game options. Once setup has started, you can also use this command to invite players and set up game options.",
    usage: "setupgame [game] OR setupgame [invite/option/turnorder/resend/start/cancel] [...]",
    examples: ["setupgame Tic Tac Toe", "setupgame invite @User#1234 @User2#5678", "setupgame turnorder 1 @User#1234"]
};
