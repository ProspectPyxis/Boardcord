const Game = require('../Game.js');
const rotate90 = require('2d-array-rotation').rotate90;

class TicTacToe extends Game {

    /**
     * @override
     */
    static get gameData() {
        let dat = super.gameData;
        dat.name = "Tic-tac-toe";
        dat.aliases = ["Xs and Os", "Noughts and Crosses"];
        dat.minPlayers = 2;
        dat.maxPlayers = 2;
        dat.turnOrder = true;

        return dat;
    }

    /** @inheritdoc */
    constructor(id, bot, channel, players, options, other) {
        super(id, bot, channel, players, options, other);

        this.currentPlayer = 0;
        // Board must have consistent amounts of rows and columns
        this.board = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        this.boardSize = 0;

        this.markersPerTurn = 1;

        // Each marker is an array with element 0 being the emoji representation and element 1 being the text representation
        this.markers = [
            [":x:", "X"],
            [":o:", "O"]
        ];

        this.winner;
    }

    /**
     * @override
     */
    getGameMessage() {
        let str = "";
        str += `**Now playing:** ${this.constructor.gameData.name}${this.constructor.gameData.variantName ? ", " + this.constructor.gameData.variantName : ""}\n\n`;
        str += "**Board:**"
        str += this.getBoard();

        str += `\n\n**Players:**\n`;
        for (let i = 0; i < this.players.length; i++) {
            str += `${this.markers[i][0]} - ${this.players[i].username}\n`;
        }

        if (this.aborted) {
            str += "\n**The game has been aborted.**";
        } else if (!this.winner) {
            str += `\nIt is currently ${this.players[this.currentPlayer]}'s turn.`;
            if (this.markersPerTurn == 1)
                str += "\nType the letter you wish to put your marker in!";
            else
                str += `\nType the ${this.markersPerTurn} letters you wish to put your marker in!`;
        } else {
            str += "\n**The game is over!**"
            if (this.winner === "draw") str += "\nThe game ended in a **draw.**";
            else str += `\nThe winner is: **${this.winner}!**`
        }

        return str;
    }

    /**
     * @override
     */
    getBoard() {
        let str = "";
        let pos = 0;
        for (let i = 0; i < this.board.length; i++) {
            str += "\n> ";
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j] - 1 >= 0 && this.board[i][j] - 1 < this.markers.length) {
                    str += this.markers[this.board[i][j] - 1][0];
                } else {
                    str += `:regional_indicator_${String.fromCharCode(97 + pos)}:`;
                }
                str += " ";
                pos++;
            }
        }

        return str;
    }

    /**
     * @override
     */
    async startGame() {
        // Board size is bound to 26 for now because weird stuff happens with input otherwise
        // TODO: Add handler for board sizes bigger than 26
        this.boardSize = Math.min(this.board.length * this.board[0].length, 26)
    }

    /**
     * @override
     */
    async gameLoop() {
        // await this.addLog(`It is now [${this.players[this.currentPlayer].username}]'s turn.`);
        var timer = setTimeout(
            () => this.channel.send(`${this.players[this.currentPlayer]} Please make your move within 15 seconds or your turn will be skipped!`),
            45000
        )

        try {
            var collected = await this.channel.awaitMessages(response => this.checkMsgMatch(response), {
                max: 1,
                time: 60000,
                errors: ['time']
            })
        } catch (e) {
            await Promise.allSettled([
                this.channel.send(`Player **${this.players[this.currentPlayer].username}** has timed out - skipping to next player.`),
                this.addLog(`[${this.players[this.currentPlayer].username}] timed out - skipping turn.`)
            ]);
            this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
            await this.gamemsg.edit(this.getGameMessage());
            this.gameLoop();
            return;
        }
        clearTimeout(timer);
        await this.onMessage(collected);

        if (this.winner) this.finishGame();
        else if (!this.aborted) this.gameLoop();
    }

    /**
     * @override
     */
    checkMsgMatch(response) {
        if (response.content == this.bot.getPrefix(this.guild) + "game cancel") return true;
        if (response.author.id != this.players[this.currentPlayer].id) return false;

        const inputs = response.content.length === this.markersPerTurn ? [...response.content] : response.content.split(/ +/g);
        if (inputs.length !== this.markersPerTurn) return false;

        for (let i of inputs) {
            if (i.length !== 1) return false;
            if (i.toLowerCase().charCodeAt() < 97 || i.toLowerCase().charCodeAt() >= this.boardSize + 97)
                return false;
        }
        return true;
    }

    /**
     * @override
     */
    async onMessage(collected) {
        if (collected.first().content == this.bot.getPrefix(this.guild) + "game abort")
            return;

        const inputs = collected.first().content.toLowerCase().split(/ +/g);
        var positions = [];

        for (let i of inputs) {
            let pos = i.charCodeAt() - 97;
            let ypos = Math.floor(pos / this.board.length);
            let xpos = pos - (ypos * this.board.length);

            if (this.board[ypos][xpos] === 0) {
                this.board[ypos][xpos] = this.currentPlayer + 1;
                positions.push(i.toUpperCase());
            } else {
                let err = await this.channel.send(this.markersPerTurn > 1 ? "That position is already taken - please try again." : "At least one position you input is already taken - please try again.");
                err.delete({ timeout: 3000 });
                return;
            }
        }

        collected.first().delete();
        let str = `position${this.markersPerTurn > 1 ? "s" : ""} [`;
        if (this.markersPerTurn > 1)
            str += positions.slice(0, -1).join('], [') + '] and [' + positions.slice(-1) + ']';
        else
            str += positions[0] + ']';

        await this.addLog(`[${this.players[this.currentPlayer].username}] placed marker [${this.markers[this.currentPlayer][1]}] at ${str}.`);
        this.winner = this.checkWinner();
        if (this.winner) return;
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
        await this.gamemsg.edit(this.getGameMessage());
    }

    /**
     * @override
     */
    async finishGame() {
        let logToAdd = '';
        let gameOverMsg = '';
        if (this.winner === "draw") {
            logToAdd = "+ No more moves available! The game ended in a <draw>.";
            gameOverMsg = "**Game over!** This game ended in a **draw.**";
        } else {
            logToAdd = `+ Game over! The winner is: <${this.winner.username}>!`;
            gameOverMsg = `**Game over!** The winner is: **${this.winner}!**`;
        }
        await Promise.allSettled([
            this.addLog(logToAdd),
            this.channel.send(gameOverMsg),
            this.gamemsg.edit(this.getGameMessage())
        ]);
        this.gameEnd();
    }

    checkWinner() {
        if (!(this.board.some(element => element.some(e => e === 0)))) {
            return "draw";
        }

        for (let i of this.board) {
            if (i.every(v => v !== 0 && v === i[0])) {
                return this.players[i[0] - 1];
            }
        }
        for (let i of rotate90(this.board)) {
            if (i.every(v => v !== 0 && v === i[0])) {
                return this.players[i[0] - 1];
            }
        }
        // Diagonals checking only works for symmetrical boards
        if (this.board.length === this.board[0].length) {
            diagonals1: {
                for (let i = 0; i < this.board.length; i++) {
                    if (this.board[i][i] === 0 || this.board[i][i] !== this.board[0][0]) break diagonals1;
                }
                return this.players[this.board[0][0] - 1];
            }
            diagonals2: {
                for (let i = 0; i < this.board.length; i++) {
                    if (this.board[i][this.board.length - (1 + i)] === 0 || this.board[i][this.board.length - (1 + i)] !== this.board[0][this.board.length - 1]) break diagonals2;
                }
                return this.players[this.board[0][this.board.length - 1] - 1];
            }
        }

        return null;
    }
}

module.exports = TicTacToe;
