exports.run = (client, guild) => {
  client.user.setAFK(true);
  client.user.setActivity(`Running on ${client.guilds.cache.size} servers.`, {type: 'PLAYING'});
}