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
            // This actually doesn't do anything, the command should be detected and handled by the game's gameLoop method directly
            // bot.activeGames[message.guild.id][message.channel.id].abortGame(message.author);
            return;
        }
        if (args[0] === "docs") {
            let gName = bot.activeGames[message.guild.id][message.channel.id].constructor.gameData.isVariant
                ? bot.activeGames[message.guild.id][message.channel.id].constructor.name
                : Object.getPrototypeOf(Object.getPrototypeOf(bot.activeGames[message.guild.id][message.channel.id])).constructor.name;
            message.channel.send(`Here is this game's documentation: <prospectpyxis.github.io/GeMatrix/pages/games/${gName}.html>`);
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
