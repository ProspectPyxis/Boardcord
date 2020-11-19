module.exports = async bot => {
    bot.logger.log('info', `${bot.user.tag} is ready! Serving ${bot.users.cache.size} users in ${bot.guilds.cache.size} servers.`);

    bot.user.setActivity(`bc!help`, { type: "PLAYING" });
};
