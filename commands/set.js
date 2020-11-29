exports.run = async (bot, message, args) => { // eslint-disable-line no-unused-vars
    const [prop, ...value] = args;

    if (!bot.guildsettings.has(message.guild.id, prop))
        return message.channel.send(`${message.author} The property \`prop\` could not be found.`);

    // Special handling for certain values go here
    if (prop === 'channelWhitelist') {
        const cmd = value.shift();

        if (message.mentions.channels.size() === 0) {
            return message.channel.send("You must mention at least one channel!");
        }

        let str = '';

        if (cmd === "add") {
            for (const channel of message.mentions.channels.values()) {
                bot.guildsettings.push(message.guild.id, channel.id, prop);
            }
            str += "The mentioned channels have been added to the whitelist.";
        }
        else if (cmd === "remove") {
            for (const channel of message.mentions.channels.values()) {
                bot.guildsettings.remove(message.guild.id, channel.id, prop);
            }
            str += "The mentioned channels have been removed from the whitelist.";
        }
        else return message.channel.send("You must either `add` or `remove` from this setting!");

        if (bot.guildsettings.get(message.guild.id, prop).length === 0) {
            str += "\nThe whitelist is now empty - any channel may be used to play games.";
        } else {
            str += `\nThe whitelist now has the following channels: <#${bot.guildsettings.get(message.guild.id, prop).join('>, <#')}>`
        }
        return message.channel.send(str);
    }

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
