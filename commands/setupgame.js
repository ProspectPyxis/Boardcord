exports.run = async (bot, message, args) => { // eslint-disable-line no-unused-vars
    // TODO: Implement this command properly
};

exports.conf = {
    enabled: true,
    aliases: ["newgame", "game", "setup"],
    requireManageServer: false,
    botOwnerOnly: false,
    hidden: false
};

exports.help = {
    name: "setupgame",
    description: "Starts a game setup menu, allowing you to invite other players or set game options. Once setup has started, you can also use this command to invite players and set up game options.",
    usage: "setupgame [game] OR setupgame [invite/option/cancel/start] [...]"
};
