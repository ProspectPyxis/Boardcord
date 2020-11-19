exports.run = async (bot, message, args) => { // eslint-disable-line no-unused-vars
    const msg = await message.channel.send("Loading...");
    msg.edit(`**Pong!** Latency is \`${msg.createdTimestamp - message.createdTimestamp}ms\`. API Latency is \`${Math.round(bot.ws.ping)}ms\`.`);
};

exports.conf = {
    enabled: true,
    aliases: [],
    requireManageServer: false,
    botOwnerOnly: false,
    hidden: false
};

exports.help = {
    name: "ping",
    description: "Returns the latency of the bot and its API.",
    usage: "ping"
};
