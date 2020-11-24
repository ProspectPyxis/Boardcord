exports.run = async (bot, message, args) => { // eslint-disable-line no-unused-vars
    message.channel.send("The bot will now shut down in 5 seconds.");
    setTimeout(() => {
        bot.logger.log('info', "Terminating Boardcord with exit code 0.");
        process.exit();
    }, 5000);
};

exports.conf = {
    enabled: true,
    aliases: ["exit"],
    requireManageServer: false,
    botOwnerOnly: true,
    hidden: true
};

exports.help = {
    name: "shutdown",
    description: "Stops the bot process without having to cancel the process in-terminal.",
    usage: "shutdown"
};
