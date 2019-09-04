const commando = require('discord.js-commando');
const {deleteCommandMessages} = require('../../util.js');

module.exports = class aboutCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'about',
      'memberName': 'about',
      'group': 'everyone',
      'description': 'get information about the bot',
      'guildOnly': false
    });
  }

  run (msg, args) {
    
    deleteCommandMessages(msg);
    return msg.say({embed: {
      color: 3447003,
      author: {
        name: this.client.user.username,
        icon_url: this.client.user.avatarURL
      },
      fields: [
        {
          name: 'About Me',
          value: 'This bot was created by void*#2244 for harm reduction and drug education uses. ' +
            'If you have any suggestions or just want to message me, feel free to do so.'
        }
      ],
      timestamp: new Date(),
      footer: {
        icon_url: this.client.user.avatarURL
      }
    }
    });
  }
};
