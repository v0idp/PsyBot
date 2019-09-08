const commando = require('discord.js-commando');
const {deleteCommandMessages} = require('../../util.js');

module.exports = class bakedCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'baked',
      'memberName': 'baked',
      'group': 'everyone',
      'description': 'adds you to the baked role',
      'examples': ['baked <@member>'],
      'guildOnly': true,
      'argsPromptLimit': 0
    });
  }

  run (msg, args) {
    // Make sure we have the permissions to use this command
    if (!msg.guild.me.hasPermission('MANAGE_ROLES')) {
      deleteCommandMessages(msg);
      return msg.say(`I'm missing permissions to use this command. (manage roles)`);
    }

    let bakedRole = msg.guild.roles.find(role => role.name.toLowerCase() === 'baked');
    if (!bakedRole) {
      deleteCommandMessages(msg);
      return msg.say(`Couldn't find a role called "baked"`);
    }

    let member = msg.member;

    if (member.id === msg.guild.ownerID) {
      deleteCommandMessages(msg);
      return msg.say(`I can't change the role of the owner.`);
    }

    if (!member.roles.has(bakedRole.id)) {
      member.roles.add(bakedRole.id).catch(console.log);
      deleteCommandMessages(msg);
      return msg.say('sangreen');
    }
    else {
      member.roles.remove(bakedRole.id).catch(console.log);
      deleteCommandMessages(msg);
      return msg.say('I hope you had fun!');
    }
  }
};
