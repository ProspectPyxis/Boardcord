// A majority of this code was taken from An Idiot's Guide's guidebot. Thank you!

const Discord = require("discord.js");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const Enmap = require("enmap");
const winston = require("winston");
const { format } = require("logform");

const config = require("./global_config.js");

const Game = require("./classes/Game.js");

const bot = new Discord.Client();

bot.config = config;

require("./common/bot_functions.js")(bot);

bot.commands = new Enmap();
bot.aliases = new Enmap();

bot.games = [];
bot.gameVariants = {};

/*
There's probably a better way to do this, but enmaps can't store classes
so I'm just using an object to store active games with some additional GC code
I'm not sure if the GC code is necessary but better safe than memory leak down the line
*/
bot.activeGames = {};

bot.guildsettings = new Enmap({
  name: "guildsettings",
  fetchAll: false,
  autoFetch: true,
  cloneLevel: 'deep'
});

bot.defaultsettings = {
    prefix: bot.config.prefix,
    allowRedo: true
};

// Setup logger
bot.logger = winston.createLogger({
    level: "debug",
    format: format.combine(
        format(info => {
            info.level = info.level.toUpperCase()
            return info;
        })(),
        format.cli(),
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console()
    ]
});

const init = async () => {

    const cmdFiles = await readdir("./commands/");
    bot.logger.log('info', `Loading a total of ${cmdFiles.length} commands.`);
    cmdFiles.forEach(f => {
        if (!f.endsWith(".js")) return;
        const response = bot.loadCommand(f);
        if (response) bot.logger.log('error', response);
    });

    const evtFiles = await readdir("./events/");
    bot.logger.log('info', `Loading a total of ${evtFiles.length} events.`);
    evtFiles.forEach(file => {
        const eventName = file.split(".")[0];
        bot.logger.log('info', `Loading Event: ${eventName}`);
        const event = require(`./events/${file}`);
        bot.on(eventName, event.bind(null, bot));
    });

    const gameFilesUnmapped = await readdir("./classes/games/", { withFileTypes: true });
    const gameFiles = gameFilesUnmapped.filter(dirent => dirent.isFile()).map(dirent => dirent.name);
    bot.logger.log('info', `Loading a total of ${gameFiles.length} games.`);
    gameFiles.forEach(file => {
        const gameName = file.split(".")[0];
        bot.logger.log('info', `Loading Game: ${gameName}`);
        const g = require(`./classes/games/${file}`);
        if (!(g.prototype instanceof Game)) return bot.logger.log('error', `Unable to load game ${gameName}: Not an instance of Game`)
        // TODO: Check for repeat games
        bot.games.push(g);
    });

    for (let g of bot.games) {
        const gameVariantFiles = await readdir(`./classes/games/variants/${g.name}/`);
        if (gameVariantFiles.length === 0) continue;
        bot.logger.log('info', `Loading a total of ${gameVariantFiles.length} variants for game ${g.name}.`);
        bot.gameVariants[g.name] = [];
        gameVariantFiles.forEach(file => {
            const variantName = file.split(".")[0];
            bot.logger.log('info', `Loading Variant: ${variantName}`);
            const v = require(`./classes/games/variants/${g.name}/${file}`);
            if (!(v.prototype instanceof g)) return bot.logger.log('error', `Unable to load variant ${variantName}: Not an instance of ${g.name}`);
            bot.gameVariants[g.name].push(v);
        });
    }

    bot.logger.log('info', "Logging in...");
    bot.login(bot.config.token);
};

init();
