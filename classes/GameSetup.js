/* eslint-disable no-unused-vars */
const { nanoid } = require('nanoid');

class GameSetup {

    /**
     * @class
     * @param {Discord.Client} bot - The bot instance.
     * @param {Discord.Message} triggermsg - The message that created this GameSetup instance.
     * @param {Game} game - The game to setup.
     */
    constructor(bot, triggermsg, game) {

        this.bot = bot;
        this.msg = triggermsg;
        this.game = game;

        // Shorthands
        this.channel = triggermsg.channel;
        this.guild = triggermsg.guild;
        this.name = game.gameData.name;

        this.players = [triggermsg.author];
        this.gm = triggermsg.author;

        this.id = nanoid();
        this.options = game.gameData.defaultOptions;

        this.setupmsg = this.channel.send(this.getSetupMessage());
        this.timer = setTimeout(() => {
            this.channel.send(`Setup for game "${this.game.gameData.name}" has timed out.`);
            this.abort();
        }, 120000);

    }

    /**
     * @returns {string} - The setup message string.
     */
    getSetupMessage() {
        let str = "";

        str += "**Setting up game:** " + this.name + "\n" + "**Host:** " + this.gm.username + "\n--------------------\n";
        str += "**Players:**\n";
        for (const i of this.players) {
            str += i.toString() + " ";
        }
        if (this.game.gameData.customRules) {
            // TODO: Refactor this for later games with custom rulesets
        }

        str += `\n\nOnce you are ready, run the command \`${this.bot.getPrefix(this.guild)}setupgame start\` to start the game.\nTo cancel this setup, run the command \`${this.bot.getPrefix(this.guild)}setupgame cancel\`.\nSetup times out automatically 120 seconds after the last command.`

        return str;
    }

    interpretCommand(msg, args) {
        let cmd = args.shift();

        switch (cmd) {
            case 'invite':
                if (this.players.length === this.game.gameData.maxPlayers) {
                    this.msg.channel.send(`You've already hit the player limit for this game! (Player limit: ${this.game.gameData.maxPlayers})`);
                    break;
                }
                if (this.players.length + msg.mentions.members.size > this.constructor.gameData.maxPlayers) {
                    this.msg.channel.send(`You've invited too many players! (Player limit: ${this.constructor.gameData.maxPlayers})\nPlease invite less players.`);
                    break;
                }

                for (const i of msg.mentions.members.entries()) {
                    this.inviteUser(i[1].user);
                }
                this.msg.channel.send('Users have been invited! The relevant user(s) must type "accept" to join the game within 30 seconds.');
                break;
            case 'option':
            case 'set':
                if (!this.game.gameData.customRules) {
                    this.msg.channel.send("No custom options are available for this game!");
                    break;
                }
                if (!(args[0] in this.options)) {
                    this.msg.channel.send(`The game option \`${args[0]} was not found for this game!`);
                    break;
                }

                switch (typeof this.options[args[0]]) {
                    case 'boolean':
                        this.options[args[0]] = args[1] === 'true' || args[1] == 1;
                        break;
                    case 'number':
                        this.options[args[0]] = Number(args[1]);
                        break;
                    case 'string':
                        args.shift();
                        this.options[args[0]] = args.join(' ');
                        break;
                    case 'object':
                        // TODO: Make this handle enum cases, since if it's none of the above three it's likely an enum
                        break;
                    default:
                        throw new Error('Error setting game option: unidentified variable');
                }
                this.setupmsg.edit(this.getSetupMessage());
                break;
            case 'start':
                clearTimeout(this.timer);
                this.channel.send("If this works right the game should start now!")
                this.abort();
                // this.bot.activeGames[this.guild.id][this.channel.id] = new this.game();
                break;
            case 'cancel':
                clearTimeout(this.timer);
                this.channel.send(`Setup for game "${this.game.gameData.name}" has been aborted.`);
                this.abort();
                break;
        }

        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.channel.send(`Setup for game "${this.game.gameData.name}" has timed out.`);
            this.abort();
        }, 120000);
    }

    /**
     * @param {Discord.User} user - The user to invite to the game.
     */
    inviteUser(user) {
        this.msg.channel.awaitMessages(response => response.author.id === user.id && response.content.toLowerCase() === "accept", {
                max: 1,
                time: 30000,
                errors: ['time'],
            })
            .then((collected) => {
                this.msg.channel.send(`${user} Invite accepted!`);
                this.players.push(user);
                this.setupmsg.edit(this.getSetupMessage());
            })
            .catch(() => {
                this.msg.channel.send(`Invite for user **${user.tag}** has timed out.`);
            });
    }

    abort() {
        delete this.bot.activeGames[this.guild.id][this.channel.id];
        if (Object.keys(this.bot.activeGames[this.guild.id]).length === 0 && this.bot.activeGames.constructor === Object)
            delete this.bot.activeGames[this.guild.id];
    }

}

module.exports = GameSetup;
