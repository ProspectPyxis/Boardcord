/* eslint-disable no-unused-vars */
class Game {

    static gameData = {
        name: "Game",
        aliases: [],
        minPlayers: 1,
        maxPlayers: 1,
        customRules: false,
        defaultOptions: {}
    }

    /**
     * @class
     * @param {Discord.Client} bot - The bot instance.
     * @param {Discord.Message} triggermsg - The message used to create the game instance.
     */
    constructor(bot, triggermsg) {

        this.bot = bot;
        this.msg = triggermsg;

        this.players = [triggermsg.author];
        this.gm = triggermsg.author;

        // this.id = UUID.v4();
        this.setup = true;
        this.options = this.constructor.gameData.defaultOptions;

        this.setupmsg;
        this.gamestring;
        this.gamemsg;
        this.log;
        this.logmsg;

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
     * This should be called upon receiving a message from a player.
     *
     * @param {Discord.Message} message - The message to be processed.
     * @abstract
     */
    onMessage(message) {}

    /**
     * This function should cleanly end the game.
     * If this class is overridden then super should be called at the end as this contains some minor garbage collection code.
     */
    gameEnd() {
    }

}

module.exports = Game;
