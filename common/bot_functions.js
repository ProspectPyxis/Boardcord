module.exports = (bot) => {

    bot.loadCommand = (commandName) => {
        try {
            client.logger.log(`Loading Command: ${commandName}`);
            const props = require(`../commands/${commandName}`);
            if (props.init) {
                props.init(client);
            }
            client.commands.set(props.help.name, props);
            props.conf.aliases.forEach(alias => {
                client.aliases.set(alias, props.help.name);
            });
            return false;
        } catch (e) {
            return `Unable to load command ${commandName}: ${e}`;
        }
    };

}
