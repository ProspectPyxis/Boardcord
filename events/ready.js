module.exports = async bot => {
    bot.logger.log('info', `${bot.user.tag} is ready! Now serving in ${bot.guilds.cache.size} servers.`);

    bot.user.setActivity(`gm!help`, { type: "PLAYING" });
};
