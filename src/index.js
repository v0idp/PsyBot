const Bot = require('./Bot.js');
const configName = process.env.CONFIG_NAME || 'config.json';
const config = require('./' + configName);

let start = function () {
  new Bot(config.general.token, config.general.ownerID, config.general.globalCommandPrefix).init();
};

start();
