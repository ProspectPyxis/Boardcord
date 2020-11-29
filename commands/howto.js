exports.run = async (bot, message, args) => { // eslint-disable-line no-unused-vars
    message.channel.send("Here's a link to getting started with Boardcord: <https://prospectpyxis.github.io/Boardcord/pages/guide.html>");
};

exports.conf = {
    enabled: true,
    aliases: ["guide"],
    requireManageServer: false,
    botOwnerOnly: false,
    hidden: false
};

exports.help = {
    name: "howto",
    description: "Links to the documentation's Getting Started page.",
    usage: "howto"
};
