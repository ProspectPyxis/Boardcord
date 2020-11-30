const Dice = require('./Dice.js');
const utils = require('../common/utils.js');

class NumericalDice extends Dice {

    /**
     @param {number} sides - The amount of sides on the dice.
     */
    constructor(sides) {
        super(Array.from(Array(sides), (e,i) => i + 1));
    }

    /** @override */
    getRepresentation(emoji) {
        if (!emoji) return this.value.toString();
        return utils.numberToEmoji(this.value, utils.getDigitCount(this.sides.reduce((a, b) => Math.max(a, b))));
    }

}

module.exports = NumericalDice;
