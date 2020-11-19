exports.run = async (bot, message, args) => { // eslint-disable-line no-unused-vars
    message.channel.send("**Bot Credits:**\n\n**ProspectPyxis** - bot concept and coder\n**Jae** - bot icon (https://instagram.com/generaljae_)\n\nAll games belong to their respective owners (or lack thereof) - I just created the Discord implementation.");
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
