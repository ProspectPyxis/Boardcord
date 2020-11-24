exports.run = async (bot, message, args) => { // eslint-disable-line no-unused-vars
    const [prop, ...value] = args;

    if (!bot.guildsettings.has(message.guild.id, prop))
        return message.channel.send(`${message.author} The property \`prop\` could not be found.`);

    const vartype = typeof bot.guildsettings.get(message.guild.id, prop);

    if (vartype === 'boolean') {
        bot.guildsettings.set(message.guild.id, value.join(' ') == 'true', prop);
        message.channel.send(`Setting \`${prop}\` has been set to \`${value.join(' ') == 'true'}\` for this guild.`);
    }
    else if (vartype === 'number') {
        bot.guildsettings.set(message.guild.id, Number(value.join(' ')), prop);
        message.channel.send(`Setting \`${prop}\` has been set to \`${Number(value.join(' '))}\` for this guild.`);
    }
    else if (vartype === 'string') {
        bot.guildsettings.set(message.guild.id, value.join(' '), prop);
        message.channel.send(`Setting \`${prop}\` has been set to \`${value.join(' ')}\` for this guild.`);
    }
    else
        throw new Error("Type error"); // TODO: Handle arrays
};

exports.conf = {
    enabled: true,
    aliases: ["setconfig"],
    requireManageServer: true,
    botOwnerOnly: false,
    hidden: false
};

exports.help = {
    name: "set",
    description: "Sets a particular setting for the server.",
    usage: "set [option] [...]"
};
