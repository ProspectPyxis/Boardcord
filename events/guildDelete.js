module.exports = async (bot, guild) => {
    bot.guildsettings.delete(guild.id);
}
