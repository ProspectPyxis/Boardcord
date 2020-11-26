const TicTacToe = require('../../TicTacToe.js');
const Chance = require('chance');
const chance = new Chance();

class DansVariation extends TicTacToe {

    /**
     * @override
     */
    static get gameData() {
        let dat = super.gameData;
        dat.isVariant = true;
        dat.variantName = "Dan's Variation";
        dat.variantAliases = ["Dan's Variant", "Dan's"];

        return dat;
    }

    /** @inheritdoc */
    constructor(id, bot, channel, players, options, other) {
        super(id, bot, channel, players, options, other);

        this.currentPlayer = 0;

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
            [":eight_spoked_asterisk:", "BLOCKER"]
        ];
    }

    /**
     * @override
     */
    async startGame() {
        super.startGame();

        const blocked = chance.unique(chance.natural, 3, { min: 0, max: 24 }).sort((a, b) => a - b);
        let blockedL = [];

        for (let i of blocked) {
            let ypos = Math.floor(i / this.board.length);
            let xpos = i - (ypos * this.board.length);
            this.board[ypos][xpos] = 3;
            blockedL.push(String.fromCharCode(i + 65));
        }

        await Promise.allSettled([
            this.addLog(`Tiles [${blockedL.slice(0, -1).join('], [') + '] and [' + blockedL.slice(-1)}] have been blocked!`),
            this.gamemsg.edit(this.getGameMessage())
        ]);
    }
}

module.exports = DansVariation;
