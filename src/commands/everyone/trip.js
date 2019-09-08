const commando = require('discord.js-commando');
const {deleteCommandMessages, getPsychonautDrug, getTripSitDrug} = require('../../util.js');

function isInt(value) {
  var er = /^(?=.+)(?:[1-9]\d*|0)?(?:\.\d+)?$/;
  return er.test(value);
}

module.exports = class tripCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'trip',
      'memberName': 'trip',
      'aliases': ['tripping', 'dose', 'drop'],
      'group': 'everyone',
      'description': 'adds you to the currently tripping role',
      'examples': ['trip lsd 120'],
      'guildOnly': true,
      'argsPromptLimit': 0,
      'args': [
        {
          'key': 'drugName',
          'prompt': 'which drug did you take ?',
          'type': 'string',
          'default': 'LSD'
        },
        {
          'key': 'dosage',
          'prompt': 'how much did you take ?',
          'type': 'float',
          'min' : 0.01,
          'max': 2000,
          'default': 'null'
        }
      ]
    });
  }

  run (msg, args) {
    // Make sure we have the permissions to use this command
    if (!msg.guild.me.hasPermission(['MANAGE_NICKNAMES', 'MANAGE_ROLES'])) {
      deleteCommandMessages(msg);
      return msg.say(`I'm missing permissions to use this command. (manage nicknames, manage roles)`);
    }

    let tripRole = msg.guild.roles.find(role => role.name.toLowerCase() === 'tripping');
    if (!tripRole) {
      deleteCommandMessages(msg);
      return msg.say(`Couldn't find a role called "tripping"`);
    }

    let member = msg.member;

    if (member.id === msg.guild.ownerID) {
      deleteCommandMessages(msg);
      return msg.say(`I can't change the role of the owner.`);
    }

    // Assume the drugName could be the dosage
    if (isInt(args.drugName)) {
      args.dosage = parseFloat(args.drugName);
      args.drugName = 'LSD';
    }

    if (!member.roles.has(tripRole.id)) {
      let prettyName;
      getTripSitDrug(args.drugName).then(function(result){
        prettyName = result.pretty_name;
        if (prettyName === 'Cannabis') {
          msg.reply('Please use the baked command for Cannabis next time');
          return this.client.registry.commands.get('baked').run(msg, 'null');
        }
        else {
          return getPsychonautDrug(result.pretty_name);
        }
      }).then(function(result) {
        let unit = 'units';
        if (result.roas && result.roas.length > 0) {
          unit = result.roas[0].dose.units;
        }

        if (prettyName === 'Mushrooms') {
          unit = 'g';
        }

        if (args.dosage !== 'null') {
          member.setNickname(`${member.displayName} (${prettyName} ${args.dosage}${unit})`).then(m => m.roles.add(tripRole.id).catch((err) => {
            console.error(err);
            return msg.reply('I wasn\'t able to change your role. Your role might have higher permissions than me.');
          })).catch((err) => {
            console.error(err);
            return msg.reply('I wasn\'t able to modify your name. Please shorten your nickname.');
          });
        }
        else {
          member.setNickname(`${member.displayName} (${prettyName})`).then(m => m.roles.add(tripRole.id).catch((err) => {
            console.error(err);
            return msg.reply('I wasn\'t able to change your role. Your role might have higher permissions than me.');
          })).catch((err) => {
            console.error(err);
            return msg.reply('I wasn\'t able to modify your name. Please shorten your nickname.');
          });
        }

        deleteCommandMessages(msg);
        msg.say('Enjoy your trip!');
      }).catch((error) => {
        return msg.reply(error);
      });
    }
    else {
      member.setNickname(String(member.displayName + '').split(' (')[0]).then(m => {
        m.roles.remove(tripRole.id).catch(console.log);
        deleteCommandMessages(msg);
        return msg.say('I hope you had fun!');
      }).catch(console.error);
    }
  }
};
