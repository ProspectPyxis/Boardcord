module.exports = async (bot, guild) => {
    let str = "**Thanks for adding Boardcord!** :wave:\n\n";
    str += "This bot allows you to play quick games with your friends right in Discord itself - no other software needed!\n";
    str += "To get started, please see the \"Getting Started\" page of the documentation here: <https://prospectpyxis.github.io/GeMatrix/pages/guide.html>\n\n";
    str += "I hope you enjoy the games we have!";

    try {
        guild.systemChannel.send(str);
    } catch (e) {
        bot.logger.log('warn', `Error trying to send server join message: ${e}`);
    }
}
