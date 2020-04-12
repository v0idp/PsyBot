exports.run = (client) => {
    console.log(`Bot ready and logged in as ${client.user.tag} (${client.user.id}). Prefix set to ${client.commandPrefix}`);
    client.user.setAFK(true);
    client.user.setActivity(`Running on ${client.guilds.cache.size} servers.`, {type: 'PLAYING'});
    client.isReady = true;
}