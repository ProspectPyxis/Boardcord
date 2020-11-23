/* eslint-disable no-unused-vars */
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
            defaultOptions: {}
        }
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

        this.gamemsg;
        this.log = [];
        this.logmsg;

        this.init();

    }

    async init() {
        let countdown = await this.channel.send("The game starts in **3**...");
        await setTimeout(() => countdown.edit("The game starts in **2**..."), 1000);
        await setTimeout(() => countdown.edit("The game starts in **1**..."), 1000);
        await countdown.delete();
        this.startGame();
        this.gamemsg = await this.channel.send(this.getGameMessage());
        this.logmsg = await this.channel.send (this.getLog());
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
        let str = "*Game log:*\n```markdown\n- "
        str += this.log.slice(Math.max(this.log.length - 5, 0)).join("\n- ");
        str += "```"

        return str;
    }

    /**
     * @abstract
     */
    startGame() { }

    /**
     * This function should contain the core game loop.
     * In most cases, this would contain an awaitMessages loop constantly listening for the current player.
     *
     * @async
     * @abstract
     */
    async gameLoop() {}

    /**
     * This should be called upon receiving a message from a player.
     *
     * @param {Discord.Message} message - The message to be processed.
     * @abstract
     */
    onMessage(message) { }

    /**
     * @abstract
     */
    finishGame() { }

    /**
     * This function should cleanly end the game.
     * This should NOT be overridden - any code to run after a game finishes should be in finishGame(), and make sure to run gameEnd() at the end of that function.
     */
    gameEnd() {
        delete this.bot.activeGames[this.guild.id][this.channel.id];
        if (Object.keys(this.bot.activeGames[this.guild.id]).length === 0 && this.bot.activeGames.constructor === Object)
            delete this.bot.activeGames[this.guild.id];
    }

}

module.exports = Game;
