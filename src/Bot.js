const Commando = require('discord.js-commando');
const {Intents} = require('discord.js');
const path = require('path');
const sqlite = require('sqlite');
const fs = require('fs');

const myIntents = new Intents(Intents.NON_PRIVILEGED);
class Bot extends Commando.Client {
  constructor(token, ownerid, commandprefix) {
    super({
			"owner": (ownerid) ? ownerid : null,
			"commandPrefix": (commandprefix) ? commandprefix : '$',
      "intents": myIntents
		});
    this.token = token;
    this.isReady = false;
  }

  init() {
    // dynamically register our events based on the content of the events folder
		fs.readdir("./src/events/", (err, files) => {
			if (err) return console.error(err);
			files.forEach(file => {
				let eventFunction = require(`./events/${file}`);
				let eventName = file.split(".")[0];
				this.on(eventName, (...args) => eventFunction.run(this, ...args));
			});
		});

    this
     .on("debug", console.log)
     .on("warn", console.log)

    // register default groups and commands
    this.registry
      .registerGroups([
        ['everyone', 'Commands for Everyone']
      ])
      .registerDefaultGroups()
      .registerDefaultTypes()
      .registerDefaultCommands({
        'help': true,
        'prefix': true,
        'ping': true,
        'eval_': false,
        'commandState': true,
        'unknownCommand': false
      })
      .registerCommandsIn(path.join(__dirname, 'commands'));

    // Create cache directories and dictionary
    let cachePath = path.join(__dirname, 'cache');
    if (!fs.existsSync(cachePath)) {
      fs.mkdirSync(cachePath);
      fs.mkdirSync(path.join(cachePath, 'psychonaut'));
      fs.mkdirSync(path.join(cachePath, 'tripsit'));
      fs.mkdirSync(path.join(cachePath, 'pills'));
      fs.writeFileSync(path.join(cachePath, 'dictionary.json'), '{\n}');
    }

    // login with bot token
    return this.login(this.token);
  }

  deinit() {
    this.isReady = false;
    return this.destroy();
  }
}

module.exports = Bot;
