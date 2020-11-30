/* eslint-disable no-unused-vars */
const { nanoid } = require('nanoid');
const GameSetup = require('./GameSetup.js');
const numberWords = require('number-words');
const utils = require('../common/utils.js');

class Game {

    /**
     * This should be overridden in proper games by calling super.gameData and editing it,
     * rather than rewriting gameData entirely for every game.
     *
     * @static
     * @returns {object} - The data for this game.
     */
    static get gameData() {
        return {
            name: "Game",
            aliases: [],
            minPlayers: 1,
            maxPlayers: 1,
            turnOrder: false,
            // Each option should always be all lowercase
            defaultOptions: {},
            variants: [],
            isVariant: false,
            variantName: "Normal",
            variantAliases: ["none", "null"],
            canSelect: true // Set to false for template games, games in beta, etc.
        };
    }

    /**
     * Returns whether a string matches this game's name or its variant name, or any aliases.
     *
     * @static
     * @param {string} n - The string to compare.
     * @param {boolean} byVariant - Whether to compare the string to the normal name/aliases or its variant name/aliases.
     * @returns {boolean} - Whether the string matches.
     */
    static matchName(n, byVariant) {

        n = utils.sanitizeString(n);

        if (!byVariant)
            return utils.sanitizeString(this.gameData.name) == n ||
                this.gameData.aliases.some(e => utils.sanitizeString(e) == n);
        else
            return utils.sanitizeString(this.gameData.variantName) == n ||
                this.gameData.variantAliases.some(e => utils.sanitizeString(e) == n);
    }

    /**
     * This handles limits for various options, such as clamping numbers, limiting possible strings, etc.
     * Should throw an error if any occurs.
     * This should be overridden, calling super at the end to handle any non-special cases.
     *
     * @static
     * @param {string} option - The name of the option to set.
     * @param {string} value - The value to convert.
     * @param {object} options - The options already set, if any.
     * @returns {*} - The converted value. Return null if any non-fatal error occurs.
     */
    static setOption(option, value, options) {
        if (!this.gameData.defaultOptions[option]) return null;

        console.log(`Debug: ${typeof this.gameData.defaultOptions[option]}`);
        switch (typeof this.gameData.defaultOptions[option]) {
            case "boolean":
                if (value == "true" || value == "on") return true;
                else if (value == "false" || value == "off") return false;
                else throw new Error("Boolean value must be `true` or `false`!");

            case "number":
                return Number(value);

            case "string":
                return value;

            default:
                return null;
        }
    }

    /**
     * This should return a 2D array, with each sub-array with two elements.
     * Element 0 is a human-readable option name, element 1 should be the formatted value.
     *
     * @static
     * @abstract
     * @param {object} options - The options list.
     * @returns {string[][]} - The formatted string.
     */
    static getReadableOptions(options) {}

    /**
     * @class
     * @param {string} id - The UUID of this game.
     * @param {Discord.Client} bot - The bot instance.
     * @param {Discord.Channel} channel - The channel the game is running in.
     * @param {Discord.User[]} players - The players involved in the game, sorted by turn order (if applicable).
     * @param {object} options - The options to be used by this game.
     * @param {object} [other] - Other properties for the game excluded from options.
     */
    constructor(id, bot, channel, players, options, other) {

        this.id = id;
        this.bot = bot;
        this.channel = channel;
        // If the game has turn orders, then GameSetup should pass this.turnOrder to players, NOT this.players
        this.players = players;
        this.options = options;

        // other is unused for now, leaving that for future expansion purposes

        this.guild = channel.guild;

        this.abort = [];
        this.aborted = false;

        this.gamemsg;
        this.log = [];
        this.logmsg;

        this.timeout;
    }

    getGame() {
        return this;
    }

    /**
     * This should be called by GameSetup after constructing the game object proper
     */
    async init() {
        var countdown = await this.channel.send(":warning: The game begins in **3**...");
        await utils.wait(1000);
        countdown.edit(":warning: The game begins in **2**...");
        await utils.wait(1000);
        countdown.edit(":warning: The game begins in **1**...");
        await utils.wait(1000);
        countdown.delete();
        this.gamemsg = await this.channel.send(this.getGameMessage());
        this.logmsg = await this.channel.send(this.getLog());
        this.startGame();
        this.bot.logger.log('info', `A new game has started! (game ID [${this.id}] in channel ID [${this.channel.id}] in guild ID [${this.guild.id})]`);
        this.gameLoop();
    }

    /**
     * This should be different for every game, but at the minimum this function should likely call this.getBoard()
     *
     * @returns {string} - The full game message string.
     * @abstract
     */
    getGameMessage() {
        return '';
    }

    /**
     * @returns {string} - The representation of the game board.
     * @abstract
     */
    getBoard() {
        return '';
    }

    /**
     * @returns {string} - the game log, compiled into a human-readable format.
     */
    getLog() {
        let str = "*Game log:*\n```diff\n"
        if (this.log.length === 0) str += "Currently empty.";
        else {
            const latestLog = this.log.slice(Math.max(this.log.length - 5, 0));
            for (const i of latestLog) {
                if (i.indexOf("+ ") !== 0 && i.indexOf("- ") !== 0) str += "* "
                str += i + "\n";
            }
        }
        str += "```"

        return str;
    }

    /**
     * @param {string} msg - The message to add to the game log.
     */
    async addLog(msg) {
        this.log.push(msg);
        await this.logmsg.edit(this.getLog());
    }

    /**
     * This method should contain initial variable setups and anything to add to the game log at the start, if needed
     *
     * @async
     * @abstract
     */
    async startGame() {}

    /**
     * This function should contain the core game loop.
     * In most cases, this would contain an awaitMessages loop constantly listening for the current player.
     *
     * @async
     * @abstract
     */
    async gameLoop() {}

    /**
     * Utility function for catching messages in gameLoop
     * At the minimum this should check for the game abort command to properly exit the loop
     *
     * @param {Discord.Message} response - the message to query.
     * @returns {boolean} - whether the message matches the required conditions.
     * @abstract
     */
    checkMsgMatch(response) {
        return true;
    }

    /**
     * Once gameLoop has collected the messages, it should pass the collection into this command to process
     *
     * @param {Discord.Collection<Discord.Snowflake,Discord.Message>} collected - The collection of messages to process.
     * @abstract
     */
    async onMessage(collected) {}

    async resend() {
        await this.gamemsg.delete();
        await this.logmsg.delete();
        this.gamemsg = await this.channel.send(this.getGameMessage());
        this.logmsg = await this.channel.send(this.getLog());
    }

    /**
     * At the minimum this function should run gameEnd() at the end
     *
     * @abstract
     */
    finishGame() {}

    // OPTIMIZE: There HAS to be a more elegant way to do this that also kills gameLoop in the same method
    async abortGame(sender) {
        const limit = this.players.length === 2 ? 2 : Math.ceil(this.players.length / 2);

        if (this.abort.includes(sender.id)) {
            this.abort = this.abort.filter(e => e.id != sender.id);
            this.channel.send(`**${sender} has retracted their abort vote.**\nThere is now ${this.abort.length}/${Math.ceil(this.players.length / 2)} vote(s) to abort the game.`);
            return;
        }

        this.abort.push(sender.id);

        let str = `**${sender} has voted to abort the game.**\nThere is now ${this.abort.length}/${limit} vote(s) to abort the game.`
        if (this.abort.length >= limit) {
            str += "\n**Amount of required votes reached! The game has been aborted.**";
            this.aborted = true;
            await Promise.allSettled([
                this.addLog("- The game has been aborted. <No contest>."),
                this.gamemsg.edit(this.getGameMessage())
            ]);
            this.gameEnd();
            return "abort";
        }
        this.channel.send(str);
    }

    /**
     * This function should cleanly end the game.
     * This should NOT be overridden - any code to run after a game finishes should be in finishGame(), and make sure to run gameEnd() at the end of that function.
     */
    async gameEnd() {
        this.bot.logger.log('info', `Game ID ${this.id} has ended!`);
        if (this.bot.getConfig(this.guild).allowRedo) {
            let timeoutmsg = await this.channel.send(`You may use the command \`${this.bot.getPrefix(this.guild)}setup redo\` to start another setup of this game with the same options and players.\nThis must be done within 20 seconds.`)
            this.timeout = setTimeout(() => {
                timeoutmsg.edit("This game has timed out - please start a new setup if you wish to play another game.");
                delete this.bot.activeGames[this.guild.id][this.channel.id];
                if (Object.keys(this.bot.activeGames[this.guild.id]).length === 0 && this.bot.activeGames.constructor === Object)
                    delete this.bot.activeGames[this.guild.id];
            }, 20000);
        } else {
            delete this.bot.activeGames[this.guild.id][this.channel.id];
            if (Object.keys(this.bot.activeGames[this.guild.id]).length === 0 && this.bot.activeGames.constructor === Object)
                delete this.bot.activeGames[this.guild.id];
        }
    }

    renewGame(message) {
        if (!this.timeout) return;
        clearTimeout(this.timeout);
        if (!this.bot[this.guild.id]) this.bot[this.guild.id] = {};
        this.bot.activeGames[this.guild.id][this.channel.id] = new GameSetup(this.bot, message, Game);
        this.bot.activeGames[this.guild.id][this.channel.id].setFromGame(this);
        this.bot.activeGames[this.guild.id][this.channel.id].init();
    }

}

module.exports = Game;
