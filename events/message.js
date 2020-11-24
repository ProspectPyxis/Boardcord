module.exports = async (bot, message) => {
    if (message.author.bot) return;

    const config = bot.getConfig();

    // Checks if the bot was mentioned, with no message after it, returns the prefix.
    const prefixMention = new RegExp(`^<@!?${bot.user.id}>( |)$`);
    if (message.content.match(prefixMention)) {
        return message.reply(`This server is currently using the prefix \`${config.prefix}\``);
    }

    if (message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const cmd = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
    if (!cmd) return;

    // Disallow using commands in DMs
    if (cmd && !message.guild)
        return message.channel.send("Commands are unavailable via private message. Please run this command in a server.");

    // Permission locks for commands
    if (cmd && !message.member.hasPermission("MANAGE_GUILD") && cmd.conf.requireManageServer)
        return message.channel.send('The permission "Manage Server" is required to perform this command.');

    if (cmd && !message.author.id == bot.config.ownerID && cmd.conf.botOwnerOnly) {
        if (cmd.conf.hidden) return;
        else return message.channel.send('You must be the bot owner to execute this command.');
    }

    try {
        cmd.run(bot, message, args);
    } catch (e) {
        bot.logger.log('error', `Error executing command ${command}: ${e}`);
    }
}
