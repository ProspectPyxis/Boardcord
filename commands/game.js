const Game = require('../classes/Game');

exports.run = async (bot, message, args) => { // eslint-disable-line no-unused-vars
    if (bot.activeGames[message.guild.id] && bot.activeGames[message.guild.id][message.channel.id]) {
        if (!(bot.activeGames[message.guild.id][message.channel.id] instanceof Game))
            return message.channel.send("No active game detected in this channel!");
        if (!(bot.activeGames[message.guild.id][message.channel.id].players.some(element => element.id === message.author.id)))
            return message.channel.send("Only active members of the active game may use this command.");

        if (args[0] === "resend") {
            bot.activeGames[message.guild.id][message.channel.id].resend();
            return;
        }
        if (args[0] === "abort") {
            bot.activeGames[message.guild.id][message.channel.id].abortGame(message.author);
            return;
        }
    }
    else return message.channel.send("No active game detected in this channel!");
};

exports.conf = {
    enabled: true,
    aliases: [],
    requireManageServer: false,
    botOwnerOnly: false,
    hidden: false
};

exports.help = {
    name: "game",
    description: "Manage the game instance running in the server, such as resending game messages and canceling.",
    usage: "game [resend/abort]"
};
