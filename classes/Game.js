/* eslint-disable no-unused-vars */
const { nanoid } = require('nanoid');
const GameSetup = require('./GameSetup.js');

class Game {

    /**
     * This should be overridden in proper games by calling super.gameData and editing it,
     * rather than rewriting gameData entirely for every game.
     *
     * @returns {object} - The data for this game.
     */
    static get gameData() {
        return {
            name: "Game",
            aliases: [],
            minPlayers: 1,
            maxPlayers: 1,
            turnOrder: false,
            defaultOptions: {},
            variants: [],
            isVariant: false,
            variantName: "Normal",
            variantAliases: ["none", "null"]
        };
    }

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
        await this.bot.utils.wait(1000);
        countdown.edit(":warning: The game begins in **2**...");
        await this.bot.utils.wait(1000);
        countdown.edit(":warning: The game begins in **1**...");
        await this.bot.utils.wait(1000);
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
        else str += "+ ";
        str += this.log.slice(Math.max(this.log.length - 5, 0)).join("\n+ ");
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
    async onMessage(collected) { }

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

    async abortGame(sender) {
        if (this.abort.includes(sender.id)) {
            let temp = await this.channel.send("You've already submitted an abort request to the game!");
            temp.delete({ timeout: 3000 });
            return;
        }

        if (this.players.length === 2) {
            this.channel.send(`**${sender} has aborted the game.**`);
            this.aborted = true;
            await Promise.allSettled([
                this.addLog("The game has been aborted. <No contest>."),
                this.gamemsg.edit(this.getGameMessage())
            ]);
            this.gameEnd();
            return;
        }

        this.abort.push(sender.id);

        let str = `**${sender} has voted to abort the game.**\nThere is now ${this.abort.length}/${Math.ceil(this.players.length / 2)} vote(s) to abort the game.`
        if (this.abort.length >= this.players.length / 2) {
            str += "\n**Amount of required votes reached! The game has been aborted.**";
            this.aborted = true;
            await Promise.allSettled([
                this.addLog("The game has been aborted. <No contest>."),
                this.gamemsg.edit(this.getGameMessage())
            ]);
            this.gameEnd();
        } else {
            this.gameLoop();
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
        let game = this.constructor.gameData.variantName ? Object.getPrototypeOf(Object.getPrototypeOf(this)).constructor : this.constructor;
        this.bot.activeGames[this.guild.id][this.channel.id] = new GameSetup(this.bot, message, game);
        this.bot.activeGames[this.guild.id][this.channel.id].setFromGame(this);
        this.bot.activeGames[this.guild.id][this.channel.id].init();
    }

}

module.exports = Game;
