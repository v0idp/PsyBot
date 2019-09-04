exports.run = (client, guild) => {
  client.user.setAFK(true);
  client.user.setActivity(`Running on ${client.guilds.size} servers.`, {type: 'PLAYING'});
}