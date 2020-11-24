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

    bot.getConfig = (server) => {
        return bot.guildsettings.ensure(server.id, bot.defaultsettings);
    }

    /**
     * This is just a convenience function to shorten bot.getConfig(server).prefix
     *
     * @param {Discord.Guild} server - the guild to pull data from.
     * @returns {string} - The prefix for the server.
     */
    bot.getPrefix = (server) => {
        return bot.getConfig(server).prefix;
    }

    bot.wait = async (ms) => {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

}
