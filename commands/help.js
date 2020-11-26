exports.run = async (bot, message, args) => { // eslint-disable-line no-unused-vars
    if (!args[0]) {
        // Get every non-hidden command
        const myCommands = bot.commands.filter(cmd => !cmd.conf.hidden);

        const commandNames = myCommands.keyArray();
        const sorted = commandNames.sort();

        message.channel.send(`Here are the list of commands.\nYou may also view the list of commands on the official documentation site: <https://prospectpyxis.github.io/Boardcord/pages/commands.html>\n\`\`\`${sorted.join(" ")}\`\`\``);
    } else {
        let cmd = args[0];
        if (bot.commands.has(cmd)) {
            let command = bot.commands.get(cmd);
            let str = "You may view more details about this command at ";

            str += `<https://prospectpyxis.github.io/Boardcord/pages/commands/${cmd}.html>.\n\`\`\`markdown\n`

            str += "# " + command.help.name + " # \n";
            str += command.help.description + "\n";
            str += "- Usage: " + command.help.usage + "\n";
            str += "- Aliases: " + command.conf.aliases.length === 0 ? "[None]" : command.conf.aliases.join(", ") + "\n";
            if (command.help.examples && command.help.examples.length > 0)
                str += "- Examples: \n-- " + command.help.examples.join("\n-- ");

            str += "```";
            message.channel.send(str);
        }
    }
};

exports.conf = {
    enabled: true,
    aliases: [],
    requireManageServer: false,
    botOwnerOnly: false,
    hidden: false
};

exports.help = {
    name: "help",
    description: "Returns a list of every command, or information on a command if the parameter is passed.",
    usage: "help [command]"
};
