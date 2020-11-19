module.exports = (bot) => {

    bot.loadCommand = (commandName) => {
        try {
            bot.logger.log('info', `Loading Command: ${commandName.slice(0, -3)}`);
            const props = require(`../commands/${commandName}`);
            if (props.init) {
                props.init(bot);
            }
            bot.commands.set(props.help.name, props);
            props.conf.aliases.forEach(alias => {
                bot.aliases.set(alias, props.help.name);
            });
            return false;
        } catch (e) {
            return `Unable to load command ${commandName}: ${e}`;
        }
    };

}
