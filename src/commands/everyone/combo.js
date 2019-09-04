const Discord = require('discord.js');
const commando = require('discord.js-commando');
const request = require('request');
const {deleteCommandMessages} = require('../../util.js');

module.exports = class comboCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'combo',
      'memberName': 'combo',
      'aliases': ['synergy'],
      'group': 'everyone',
      'description': 'check the synergy between two drugs',
      'examples': ['combo lsd weed'],
      'guildOnly': false,
      'argsPromptLimit': 0,

      'args': [
        {
          'key': 'drugA',
          'prompt': 'What is the first drug ?',
          'type': 'string'
        },
        {
          'key': 'drugB',
          'prompt': 'what is the second drug ?',
          'type': 'string'
        }
      ]
    });
  }

  run (msg, args) {
    request({
      url: `http://tripbot.tripsit.me/api/tripsit/getInteraction?drugA=${args.drugA}&drugB=${args.drugB}`,
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        if (body.err === true) {
          let embed = new Discord.MessageEmbed()
            .setAuthor(args.drugA + ' & ' + args.drugB, 'https://i.imgur.com/fD0cG2j.png')
            .setColor(3447003)
            .setFooter('For further information click on the name of the drugs.')
            .setTimestamp()
            .setURL('http://wiki.tripsit.me/wiki/Drug_combinations')
            .addField('Error', body.data[0].msg);

          return msg.embed(embed);
        }
        else {
          let status = 'unknown';
          let description = 'something went wrong.';

          let embed = new Discord.MessageEmbed()
            .setAuthor(`Drug Combinations (${body.data[0].interactionCategoryA} & ${body.data[0].interactionCategoryB})`, 'https://i.imgur.com/fD0cG2j.png')
            .setColor(3447003)
            .setFooter('For further information click on the title.')
            .setTimestamp()
            .setURL('http://wiki.tripsit.me/wiki/Drug_combinations');
          if (body.data[0].status === 'Low Risk & Synergy') {
            status = 'Low Risk & Synergy';
            description = "This combination of drugs works together to cause an effect greater than the sum of its parts and they aren\'t likely to cause an adverse or undesirable reaction when used carefully. Additional research should always be done before combining drugs.";
          }
          else if (body.data[0].status === 'Low Risk & No Synergy') {
            status = 'Low Risk & No Synergy';
            description = 'Effects are just additive. This combination is unlikely to cause any adverse or undesirable reaction beyond those that might ordinarily be expected from these drugs.';
          }
          else if (body.data[0].status === 'Low Risk & Decrease') {
            status = 'Low Risk & Decrease';
            description = "This combination of drugs **don’t** work together. Combining these drugs will decrease the effects from one of them or even both. They aren\'t likely to cause an adverse or undesirable reaction when used carefully. Additional research should always be done before combining drugs.";
          }
          else if (body.data[0].status === 'Caution') {
            status = 'Caution';
            description = 'This combination is usually not physically harmful, but may produce undesirable effects, such as physical discomfort or overstimulation. Extreme use may cause physical health issues. Synergistic effects may be unpredictable. Care should be taken when choosing to use this combination.';
          }
          else if (body.data[0].status === 'Unsafe') {
            status = 'Unsafe';
            description = 'There is considerable risk of physical harm when taking this combination, it should be avoided where possible.';
          }
          else if (body.data[0].status === 'Dangerous') {
            status = 'Dangerous';
            description = 'This combination is considered extremely harmful and should always be avoided. Reactions to these drugs taken in combination are highly unpredictable and have a potential to cause death.';
          }
          embed.addField('Status', status);
          embed.addField('Description', description);

          deleteCommandMessages(msg);
          return msg.embed(embed);
        }
      }
      else {
        return msg.reply("Couldn't find any results. Are the drug names correct ?");
      }
    });
  }
};
