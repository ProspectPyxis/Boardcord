exports.run = async (bot, message, args) => { // eslint-disable-line no-unused-vars
    let newarg = args[0] ? args.join(' ') : 'bc!';

    let str = `The bot prefix for this server has been set to \`${newarg}\`.`;
    str += `\nExample command: \`${newarg}ping\`\n`

    if (!args[0])
        str += "You may use this command with no arguments to reset the prefix to `bc!`, or mention the bot to get the current prefix.";
    else
        str += "You may mention the bot to get the current prefix.";

    try {
        bot.guildsettings.set(message.guild.id, newarg, "prefix");
    } catch (e) {
        message.channel.send(":no_entry_sign: An unexpected error occured while performing this command.");
        bot.logger.log('error', `Error setting prefix: ${e}`);
        return;
    }
    message.channel.send(str);
};

exports.conf = {
    enabled: true,
    aliases: [],
    requireManageServer: true,
    botOwnerOnly: false,
    hidden: false
};

exports.help = {
    name: "prefix",
    description: "Sets the bot prefix for this server. Run this command with no arguments to reset the prefix.",
    usage: "prefix <new prefix>"
};
