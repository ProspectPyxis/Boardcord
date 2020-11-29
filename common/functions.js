const numberWords = require('number-words');

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

    // Util functions

    bot.utils = {};

    bot.utils.sanitizeString = (str) => {
        str = str.replace(/[/\-,.'""()[\]\\ ]+/g, '');
        str = str.replace(/[0-9]+/g, (match, offset, string) => { // eslint-disable-line no-unused-vars
            return numberWords.convert(parseInt(match)).replace(/ +/g, '');
        });
        str = str.toLowerCase();

        return str;
    }

    bot.utils.wait = async (ms) => {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    bot.utils.objectsHaveSameKeys = (...objects) => {
        const allKeys = objects.reduce((keys, object) => keys.concat(Object.keys(object)), []);
        const union = new Set(allKeys);
        return objects.every(object => union.size === Object.keys(object).length);
    }

    // Code copied from stackexchange
    // TODO: Refactor this to be able to handle unlimited arrays at once
    bot.utils.compareArrays = (a1, a2) => {
        // if the other array is a falsy value, return
        if (!a1 || !a2)
            return false;

        // compare lengths - can save a lot of time
        if (a1.length != a2.length)
            return false;

        for (var i = 0, l = a1.length; i < l; i++) {
            // Check if we have nested arrays
            if (a1[i] instanceof Array && a2[i] instanceof Array) {
                // recurse into the nested arrays
                if (!bot.utils.compareArrays(a1, a2))
                    return false;
            } else if (a1[i] != a2[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    }

    bot.utils.union2DArrays = (...a) => {
        let arr = [];

        for (const i of a) {
            for (const j of i) {
                if (j.constructor !== Array) continue;
                if (!arr.some(e => bot.utils.compareArrays(e, j))) arr.push(j);
            }
        }

        return arr;
    }

}
