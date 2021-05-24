const configName = process.env.CONFIG_NAME || 'config.json';
const config = require('./' + configName);

const {ShardingManager} = require('discord.js');

const manager = new ShardingManager('./src/index.js', {
  totalShards: 'auto',
  token: config.general.token
});

manager.on('shardCreate', (shard) => console.log(`Shard ${shard.id} launched`));

manager.spawn();
