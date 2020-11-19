/* eslint-disable no-unused-vars */

class Game {

    /**
     * @class
     * @param {Discord.Message} message - The message used to create the game instance.
     * @param {object} options - The options for the game.
     */
    constructor(message, options) {

        this.options = options;

    }

    /**
     * This function should contain the core game loop.
     * In most cases, this would contain an awaitMessages loop constantly listening for the current player.
     *
     * @async
     * @abstract
     */
    async gameLoop() { }

    /**
     * This should be called upon receiving a message from a player.
     *
     * @param {Discord.Message} message - The message to be processed.
     * @abstract
     */
    onMessage(message) { }

    /**
     * @static
     * @returns {object} - The basic data for this game, such as the name.
     */
    static get gameData() {
        return {
            name: "Game",
            aliases: [],
            minPlayers: 1,
            maxPlayers: 1
        };
    }

}

module.exports = Game;
