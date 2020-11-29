exports.run = async (bot, message, args) => { // eslint-disable-line no-unused-vars
    message.channel.send("Bot credits are now hosted here: https://prospectpyxis.github.io/GeMatrix/pages/misc/credits.html");
};

exports.conf = {
    enabled: true,
    aliases: [],
    requireManageServer: false,
    botOwnerOnly: false,
    hidden: false
};

exports.help = {
    name: "credits",
    description: "Sends the name of those who has majorly contributed to the bot.",
    usage: "credits"
};
