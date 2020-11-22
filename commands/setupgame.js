const GameSetup = require('../classes/GameSetup.js');
const Game = require('../classes/Game.js');

exports.run = async (bot, message, args) => { // eslint-disable-line no-unused-vars
    if (bot.activeGames[message.guild.id] && bot.activeGames[message.guild.id][message.channel.id]) {
        bot.activeGames[message.guild.id][message.channel.id].interpretCommand(message, args);
    } else {
        if (!bot.activeGames[message.guild.id]) bot.activeGames[message.guild.id] = {};
        if (!bot.activeGames[message.guild.id][message.channel.id]) bot.activeGames[message.guild.id][message.channel.id] = new GameSetup(bot, message, Game);
    }
};

exports.conf = {
    enabled: true,
    aliases: ["newgame", "game", "setup"],
    requireManageServer: false,
    botOwnerOnly: false,
    hidden: false
};

exports.help = {
    name: "setupgame",
    description: "Starts a game setup menu, allowing you to invite other players or set game options. Once setup has started, you can also use this command to invite players and set up game options.",
    usage: "setupgame [game] OR setupgame [invite/option/cancel/start] [...]"
};
