exports.run = async (bot, message, args) => { // eslint-disable-line no-unused-vars
    if (!args[0]) {
        // Get every non-hidden command
        const myCommands = bot.commands.filter(cmd => !cmd.conf.hidden);

        const commandNames = myCommands.keyArray();
        const sorted = commandNames.sort();

        message.channel.send(`**List of Commands** (use \`help [command]\` for more details on a command):\n\`\`\`${sorted.join(" ")}\`\`\``);
    } else {
        let command = args[0];
        if (bot.commands.has(command)) {
            command = bot.commands.get(command);
            let str = "";

            str += "# " + command.help.name + " # \n";
            str += command.help.description + "\n";
            str += "- Usage: " + command.help.usage + "\n";
            str += "- Aliases: " + command.conf.aliases.length === 0 ? "[None]" : command.conf.aliases.join(", ") + "\n";
            if (command.help.examples && command.help.examples.length > 0)
                str += "- Examples: \n-- " + command.help.examples.join("\n-- ");
            message.channel.send(str, { code: "markdown" });
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
