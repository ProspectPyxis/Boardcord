const TicTacToe = require('../../TicTacToe.js');
const chance = require('chance');

class DansVariation extends TicTacToe {

    /**
     * @override
     */
    static get gameData() {
        let dat = super.gameData;
        dat.aliases = ["dansvariation", "Dans variation"];
        dat.variantName = "Dan's Variation";

        return dat;
    }

    /** @inheritdoc */
    constructor(id, bot, channel, players, options, other) {
        super(id, bot, channel, players, options, other);

        this.currentPlayer = 0;
        // Board must have consistent amounts of rows and columns
        this.board = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];

        this.markersPerTurn = 2;
        this.markers = [
            [":x:", "X"],
            [":o:", "O"],
            [":asterisk:", "BLOCKER"]
        ];
    }

    /**
     * @override
     */
    startGame() {
        super.startGame();

        const blocked = chance.unique(chance.natural, 3, { min: 0, max: 24 });
        let blockedL = [];

        for (let i of blocked) {
            let ypos = Math.floor(i / this.board.length);
            let xpos = i - (ypos * this.board.length);
            this.board[ypos][xpos] = 3;
            blockedL.push(String.fromCharCode(i + 65));
        }

        this.addLog(`Tiles [${blockedL.slice(0, -1).join('], [') + '] and [' + blockedL.slice(-1)}] have been blocked!`);
    }
}

module.exports = DansVariation;
