/* eslint-disable no-unused-vars */

/** @abstract */
class GameObject {

    constructor() {
        if (new.target === GameObject) {
            throw new TypeError("Cannot construct " + new.target.name + " instances directly");
        }
    }
    /**
     * @abstract
     * @param {boolean} emoji - Whether to get the emoji representation or just the normal text-based representation.
     * @returns {string} - The emoji representation of this game object.
     */
    getRepresentation(emoji) {}

}

module.exports = GameObject;
