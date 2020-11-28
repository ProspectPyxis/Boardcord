const ConnectFour = require('../../ConnectFour.js');
const { rotate270 } = require('2d-array-rotation');

class FiveInARow extends ConnectFour {

    /** @override */
    static get gameData() {
        let dat = super.gameData;
        dat.isVariant = true;
        dat.variantName = "5-in-a-row";

        return dat;
    }

    /** @inheritdoc */
    constructor(id, bot, channel, players, options, other) {
        super(id, bot, channel, players, options, other);

        this.kVal = 5;

        this.boardOffset = 0;

        this.board.unshift([2, 1, 2, 1, 2, 1]);
        this.board.push([1, 2, 1, 2, 1, 2]);

        // Markers have a third element
        // Element 2 is for when the piece is at the edges of the board
        this.markers = [
            [":red_circle:", ":white_flower:", ":red_square:"],
            [":yellow_circle:", ":high_brightness:", ":yellow_square:"]
        ];
    }

    /** @override */
    getBoard() {
        let str = '';
        let b = rotate270(this.getFilledBoard());

        for (const i of b) {
            str += "> ";
            for (let j = 0; j < i.length; j++) {

                if (i[j] === 0) {
                    str += ":white_square_button:";
                } else if (j < 0) {
                    str += this.markers[-j - 1][1];
                } else {
                    if (j === 0 || j === i.length - 1) {
                        str += this.markers[i[j] - 1][2];
                    } else {
                        str += this.markers[i[j] - 1][0];
                    }
                }
                str += ' ';
            }
            str += "\n";
        }
        str += "> :eight_spoked_asterisk: :one: :two: :three: :four: :five: :six: :seven: :eight_spoked_asterisk:";

        return str;
    }

    /** @override */
    getFilledBoard() {
        let arr = super.getFilledBoard();

        arr.unshift([2, 1, 2, 1, 2, 1]);
        arr.push([1, 2, 1, 2, 1, 2]);

        return arr;
    }
}

module.exports = FiveInARow;
