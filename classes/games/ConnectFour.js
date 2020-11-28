const Game = require('../Game.js');

const { rotate270, rotate90 } = require('2d-array-rotation');
const numberWords = require('number-words');

class ConnectFour extends Game {

    /**
     * @override
     */
    static get gameData() {
        let dat = super.gameData;
        dat.name = "Connect Four";
        dat.aliases = ["4-in-a-row"];
        dat.minPlayers = 2;
        dat.maxPlayers = 2;
        dat.turnOrder = true;

        dat.defaultOptions.popout = false;

        return dat;
    }

    /**
     * @override
     */
    static setOption(option, value, options) {
        if (option == "popout") {
            if (value == "true" || value == "on") return true;
            else if (value == "false" || value == "off") return false;
            else throw new Error("Boolean value must be `true` or `false`!");
        }
        else return super.setOption(option, value, options);
    }

    /** @override */
    static getReadableOptions(options) {
        let arr = [];

        for (let option in options) {
            let value = options[option];
            switch (option) {
                case 'popout':
                    arr.push(["Popout Rule", value ? "On" : "Off"]);
                    break;

                default:
                    arr.push([option, value]);
            }
        }

        return arr;
    }

    /** @inheritdoc */
    constructor(id, bot, channel, players, options, other) {
        super(id, bot, channel, players, options, other);

        this.currentPlayer = 0;

        // This board is actually turned 90 degrees clockwise
        // This is simply for easier pushing to each column
        this.board = [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ];
        this.boardWidth = 7;
        this.boardHeight = 6;

        // This is named kVal based off of the m,n,k-game concept
        // Basically how many is needed in a row to win
        this.kVal = 4;

        // Each element in winPos is an array with three elements
        // Element 0 is the player being checked, element 1 is the column, element 2 is the row
        this.winPos = [];

        // Each marker is an array
        // Element 0 is the normal emoji representation, element 1 is the winning emoji
        this.markers = [
            [":red_circle:", ":white_flower:"],
            [":yellow_circle:", ":high_brightness:"]
        ];

        this.winner;
    }

    /** @override */
    getGameMessage() {
        let str = "";
        str += `**Now playing:** ${this.constructor.gameData.name}${this.constructor.gameData.isVariant ? ", " + this.constructor.gameData.variantName : ""}\n\n`;

        str += "**Board:**\n"
        str += this.getBoard();

        str += `\n\n**Players:**\n`;
        for (let i = 0; i < this.players.length; i++) {
            str += `${this.markers[i][0]} - ${this.players[i].username}\n`;
        }

        if (this.aborted) {
            str += "\n**The game has been aborted.**";
        } else if (!this.winner) {
            str += `\nIt is currently ${this.players[this.currentPlayer]}'s turn.`;
            if (!this.options.popout)
                str += "\nType the number of the column you wish to put your marker in!";
            else {
                str += "\nType the number of the column you wish to put your marker in,";
                str += " or prefix the number with \"pop\" to remove a piece from the bottom of the column!";
            }
        } else {
            str += "\n**The game is over!**"
            if (this.winner === "draw") str += "\nThe game ended in a **draw.**";
            else str += `\nThe winner is: **${this.winner}!**`
        }

        return str;
    }

    /** @override */
    getBoard() {
        let str = '';
        let b = rotate270(this.getFilledBoard());

        for (const i of b) {
            str += "> ";
            for (const j of i) {
                if (j === 0) {
                    str += ":white_square_button:";
                } else if (j < 0) {
                    str += this.markers[-j - 1][1];
                } else {
                    str += this.markers[j - 1][0];
                }
                str += ' ';
            }
            str += "\n";
        }
        str += "> :one: :two: :three: :four: :five: :six: :seven:";

        return str;
    }

    // A convenience function to fill the array to the top with 0s
    // This is for getBoard and win checks
    getFilledBoard() {
        let arr = [];

        for (const i of this.board) {
            arr.push(i.concat(Array(this.boardHeight).fill(0)).slice(0, this.boardHeight));
            // this.bot.logger.log('debug', JSON.stringify(i.concat(Array(this.boardHeight).fill(0)).slice(0, this.boardHeight)));
        }

        // this.bot.logger.log('debug', "---");

        return arr;
    }

    /** @override */
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
        let result = await this.onMessage(collected);

        if (this.winner) this.finishGame();
        else if (!this.aborted && result !== "abort") this.gameLoop();
    }

    /** @override */
    checkMsgMatch(response) {
        if (response.content == this.bot.getPrefix(this.guild) + "game abort") return true;
        if (response.author.id != this.players[this.currentPlayer].id) return false;

        let input = response.content.toLowerCase();

        if (this.options.popout && input.indexOf("pop ") === 0) {
            input = input.slice(4);
        }

        return /^[0-9]+$/.test(input) && 0 < parseInt(input) && parseInt(input) <= this.boardWidth;
    }

    /** @override */
    async onMessage(collected) {
        if (collected.first().content == this.bot.getPrefix(this.guild) + "game abort")
            return "abort";

        let isPop = this.options.popout && collected.first().content.toLowerCase().indexOf("pop ") === 0;

        let col = parseInt(isPop ? collected.first().content.slice(4) : collected.first().content) - 1;

        if (this.board[col].length >= this.boardHeight) {
            let err = await this.channel.send("That column is already full! Please try a different column.");
            err.delete({ timeout: 3000 });
            return;
        }
        if (isPop && this.board[col][0] !== this.currentPlayer) {
            let err = await this.channel.send("The piece at the bottom of that column is not yours!");
            err.delete({ timeout: 3000 });
            return;
        }

        collected.first().delete();
        if (!isPop) {
            this.board[col].push(this.currentPlayer + 1);
            await this.addLog(`[${this.players[this.currentPlayer].username}] has put their marker in column [${col + 1}].`);
        } else {
            this.board[col].shift();
            await this.addLog(`[${this.players[this.currentPlayer].username}] has popped a marker out of column [${col + 1}].`);
        }

        this.winner = this.checkWinner();
        if (this.winner) return;

        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
        await this.gamemsg.edit(this.getGameMessage());
    }

    /** @override */
    async finishGame() {
        let logToAdd = '';
        let gameOverMsg = '';
        if (this.winner === "draw") {
            logToAdd = "+ No more moves available! The game ended in a <draw>.";
            gameOverMsg = "**Game over!** This game ended in a **draw.**";
        } else if (this.winner === "bothwin") {
            logToAdd = `+ Both players have ${numberWords.convert(this.kVal)}-in-a-row! The game ended in a <draw>.`;
            gameOverMsg = `**Both players have ${numberWords.convert(this.kVal)}-in-a-row - game over!** The game ended in a <draw>.`;
        } else {
            logToAdd = `+ Game over! The winner is: <${this.winner.username}>!`;
            gameOverMsg = `**Game over!** The winner is: **${this.winner}!**`;
        }

        if (this.winPos.length >= this.kVal) {
            for (const i of this.winPos) {
                this.board[i[1]][i[2]] = -this.board[i[1]][i[2]];
            }
        }

        await Promise.allSettled([
            this.addLog(logToAdd),
            this.channel.send(gameOverMsg),
            this.gamemsg.edit(this.getGameMessage())
        ]);
        this.gameEnd();
    }

    checkWinner() {
        // OPTIMIZE: Make this check only the modified column if needed, skip the row/column/diagonal if it's clear a win can't happen here

        let b = this.getFilledBoard();

        let tempWinner = 0;
        let tempWinPos = [];

        if (!b.some(element => element.some(e => e === 0)) && !this.options.popout) return "draw";

        // Verticals
        for (let i = 0; i < b.length; i++) {
            tempWinPos = [];
            for (let j = 0; j < b[0].length; j++) {
                if (b[i][j] !== 0) {
                    if (tempWinPos.length !== 0 && tempWinPos[0][0] !== b[i][j]) tempWinPos = [];
                    tempWinPos.push([b[i][j], i, j]);
                } else if (tempWinPos.length !== 0) tempWinPos = [];

                if (tempWinPos.length >= this.kVal) {
                    if (tempWinner === 0) {
                        this.winPos = tempWinPos;
                        tempWinner = this.winPos[0][0];
                    }
                    else if (this.winPos[0][0] == tempWinner) {
                        this.winPos = this.bot.utils.union2DArrays(this.winPos, tempWinPos);
                    }
                    else {
                        this.winPos = [];
                        return "bothwin";
                    }
                }
            }
        }

        // Horizontals
        let br = rotate90(b);

        for (let i = 0; i < br.length; i++) {
            tempWinPos = [];
            for (let j = 0; j < br[0].length; j++) {
                if (br[i][j] !== 0) {
                    if (tempWinPos.length !== 0 && tempWinPos[0][0] !== br[i][j]) tempWinPos = [];
                    tempWinPos.push([br[i][j], this.boardWidth - j - 1, i]);
                } else if (tempWinPos.length !== 0) tempWinPos = [];

                if (tempWinPos.length >= this.kVal) {
                    if (!tempWinner) {
                        this.winPos = tempWinPos;
                        tempWinner = this.winPos[0][0];
                    }
                    else if (this.winPos[0][0] == tempWinner) {
                        this.winPos = this.bot.utils.union2DArrays(this.winPos, tempWinPos);
                    }
                    else {
                        this.winPos = [];
                        return "bothwin";
                    }
                }
            }
        }

        // I literally just ripped this code off of stackexchange with a few tweaks
        const checkDiagonals = (array, bottomToTop) => {
            var Ylength = array.length;
            var Xlength = array[0].length;
            var maxLength = Math.max(Xlength, Ylength);
            var temp;
            var returnArray = [];
            for (var k = 0; k <= 2 * (maxLength - 1); ++k) {
                temp = [];
                for (var y = Ylength - 1; y >= 0; --y) {
                    var x = k - (bottomToTop ? Ylength - y : y);
                    if (x >= 0 && x < Xlength) {
                        temp.push([array[y][x], y, x]);
                    }
                }
                if (temp.length > 0) {
                    returnArray.push(temp);
                }
            }
            return returnArray;
        }

        // UL to BR diagonals
        let bd = checkDiagonals(b);
        for (let i of bd) {
            if (i.length < this.kVal) continue;
            tempWinPos = [];

            for (let j of i) {
                if (j[0] !== 0) {
                    if (tempWinPos.length !== 0 && tempWinPos[0][0] !== j[0]) tempWinPos = [];
                    tempWinPos.push(j);
                } else if (tempWinPos.length !== 0) tempWinPos = [];

                if (tempWinPos.length >= this.kVal) {
                    if (!tempWinner) {
                        this.winPos = tempWinPos;
                        tempWinner = this.winPos[0][0];
                    }
                    else if (this.winPos[0][0] == tempWinner) {
                        this.winPos = this.bot.utils.union2DArrays(this.winPos, tempWinPos);
                    }
                    else {
                        this.winPos = [];
                        return "bothwin";
                    }
                }
            }
        }

        // BL to UR diagonals
        bd = checkDiagonals(b, true);
        for (let i of bd) {
            if (i.length < this.kVal) continue;
            tempWinPos = [];

            for (let j of i) {
                if (j[0] !== 0) {
                    if (tempWinPos.length !== 0 && tempWinPos[0][0] !== j[0]) tempWinPos = [];
                    tempWinPos.push(j);
                } else if (tempWinPos.length !== 0) tempWinPos = [];

                if (tempWinPos.length >= this.kVal) {
                    if (!tempWinner) {
                        this.winPos = tempWinPos;
                        tempWinner = tempWinPos[0][0];
                    }
                    else if (this.winPos[0][0] == tempWinner) {
                        this.winPos = this.bot.utils.union2DArrays(this.winPos, tempWinPos);
                    }
                    else {
                        this.winPos = [];
                        return "bothwin";
                    }
                }
            }
        }

        return tempWinner > 0 ? this.players[tempWinner - 1] : null;
    }

}

module.exports = ConnectFour;
