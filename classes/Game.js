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

        this.guild = channel.guild;

        this.gamemsg;
        this.log = [];

    }

    /**
     * This function should contain the core game loop.
     * In most cases, this would contain an awaitMessages loop constantly listening for the current player.
     *
     * @async
     * @abstract
     */
    async gameLoop() {}

    /**
     * @returns {string} - The representation of the game board.
     */
    getBoard() {
        return '';
    }

    /**
     * This should be called upon receiving a message from a player.
     *
     * @param {Discord.Message} message - The message to be processed.
     * @abstract
     */
    onMessage(message) {}

    /**
     * This function should cleanly end the game.
     * This should NOT be overridden - any code to run after a game finishes should be in finishGame(), and make sure to run gameEnd() at the end of that function.
     */
    gameEnd() {}

}

module.exports = Game;
