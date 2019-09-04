const commando = require('discord.js-commando');
const {deleteCommandMessages} = require('../../util.js');

module.exports = class calcCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'calc',
      'memberName': 'calc',
      'aliases': ['tolerance'],
      'group': 'everyone',
      'description': 'calculate the tolerance for lsd',
      'examples': ['calc 220 7 220'],
      'guildOnly': false,
      'argsPromptLimit': 0,

      'args': [
        {
          'key': 'previousDosage',
          'prompt': 'what was your previous dosage ?',
          'type': 'integer'
        },
        {
          'key': 'days',
          'prompt': 'how many days since your previous dosage ?',
          'type': 'integer'
        },
        {
          'key': 'desiredDosage',
          'prompt': 'what is your desired dosage ?',
          'type': 'integer'
        }
      ]
    });
  }

  run (msg, args) {
    if (args.days > 12) {
      return msg.reply('There is no noticeable body tolerance above 12 days.');
    }

    let newDosage = args.desiredDosage + ((args.previousDosage / 100) * (280.059565 * Math.pow(args.days, -0.412565956)) - args.previousDosage);
    let tolerance = newDosage / args.desiredDosage * 100;

    if (tolerance <= 0) {
      tolerance = 0;
      newDosage = args.desiredDosage;
    }

    deleteCommandMessages(msg);
    return msg.say({embed: {
      color: 3447003,
      author: {
        name: this.client.user.username,
        icon_url: this.client.user.avatarURL
      },
      title: 'LSD Tolerance Calculator',
      fields: [
        {
          name: 'Result',
          value: `Your current tolerance is at **${tolerance.toFixed(2)}%**. ` +
                    `You need to take a **${newDosage.toFixed(2)}ug** ` +
                    `dose to feel the effects of a **${parseFloat(args.desiredDosage).toFixed(2)}ug** dose.`
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
