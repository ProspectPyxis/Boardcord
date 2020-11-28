const GameSetup = require('../classes/GameSetup.js');

exports.run = async (bot, message, args) => { // eslint-disable-line no-unused-vars

    if (!bot.activeGames[message.guild.id] || !bot.activeGames[message.guild.id][message.channel.id])
        return message.channel.send("No setup is running at this moment!");

    if (!(bot.activeGames[message.guild.id][message.channel.id] instanceof GameSetup))
        return message.channel.send("You cannot join in the middle of an active game!");

    if (/^(join)$/i.test(args[0]) && bot.activeGames[message.guild.id][message.channel.id].players.some(e => e.id == message.author.id))
        return message.channel.send(`${message.author} You are already in the game!`);

    bot.activeGames[message.guild.id][message.channel.id].interpretCommand(message, ["join"]);

};

exports.conf = {
    enabled: true,
    aliases: [],
    requireManageServer: false,
    botOwnerOnly: false,
    hidden: false
};

exports.help = {
    name: "join",
    description: "Joins the active game if the setup is public.",
    usage: "join"
};
