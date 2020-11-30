const GameObject = require("../GameObject.js");

const Chance = require('chance');
const chance = new Chance();

class Dice extends GameObject {

    value;

    /**
     * @param {(number[]|string[])} sides - The sides of the dice.
     */
    constructor(sides) {
        super();

        this.sides = sides;
        this.value = sides[0];
    }

    roll() {
        this.value = this.sides[chance.natural({ min: 0, max: this.sides.length - 1})];
        return this.value;
    }

    /** @override */
    getRepresentation(emoji) { // eslint-disable-line no-unused-vars
        return this.value;
    }
}

module.exports = Dice;
