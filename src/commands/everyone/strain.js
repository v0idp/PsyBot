const Discord = require('discord.js');
const commando = require('discord.js-commando');
const {deleteCommandMessages, searchStrains, getStrainFlavors, getStrainEffects, capitalizeFirstLetter} = require('../../util.js');

let createStrainEmbed = function(msg, strain, effects, flavors) {
  let strainEmbed = new Discord.MessageEmbed()
    .setAuthor(capitalizeFirstLetter(strain.name) + ((strain.race) ? ` (${capitalizeFirstLetter(strain.race)})` : ''))
    .setColor(3442236)
    .setTimestamp();

  if (!strain.desc
        && effects.positive.length === 0
        && effects.negative.length === 0
        && effects.medical.length === 0
        && flavors.length === 0) {
    return msg.member.toString() + ', Couldn\'t find any information about **' + strain.name + '**.';
  }

  if (strain.desc) {
    strainEmbed.addField('__Description__', strain.desc.substring(0,1024));
  }
  if (flavors.length > 0) {
    strainEmbed.addField('__Flavors__', flavors.join(', '));
  }
  if (effects.positive.length > 0) {
    strainEmbed.addField('__Positive Effects__', effects.positive, true);
  }
  if (effects.negative.length > 0) {
    strainEmbed.addField('__Negative Effects__', effects.negative, true);
  }
  if (effects.medical.length > 0) {
    strainEmbed.addField('__Medical Effects__', effects.medical, true);
  }

  return strainEmbed;
};

module.exports = class strainCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'strain',
      'memberName': 'strain',
      'group': 'everyone',
      'description': 'get information about weed strains',
      'examples': ['strain Alien Kush'],
      'guildOnly': false,
      'argsPromptLimit': 0,

      'args': [
        {
          'key': 'strainName',
          'prompt': 'which weed strain do you want information about ?',
          'type': 'string'
        }
      ]
    });
  }

  run (msg, args) {
    searchStrains(args.strainName).then(searchResult => {
      let selection = 0;
      let fieldContent = '';
      let length = (searchResult.length > 10) ? 10 : searchResult.length;

      if (length === 1) {
        let strain = searchResult[0];
        getStrainEffects(strain.id).then(effects => {
          getStrainFlavors(strain.id).then(flavors => {
            deleteCommandMessages(msg);
            return msg.say(createStrainEmbed(msg, strain, effects, flavors));
          }).catch((error) => {
            console.log(error);
            return msg.reply(error);
          });
        }).catch((error) => {
          return msg.reply(error);
        });
      }
      else {
        for (let i = 0; i < length; i++) {
          fieldContent += (i+1) + ') ' + searchResult[i].name + '\n';
        }

        let embed = new Discord.MessageEmbed()
          .setDescription('Please select one of the search results.')
          .addField('__Strains found for ' + capitalizeFirstLetter(args.strainName) + '__', fieldContent)
          .setColor(3442236)
          .setTimestamp();
        if (searchResult.length > 10) {
          embed.setFooter('Showing 10 of ' + searchResult.length + ' results.');
        }

        let selectionMessage;
        msg.embed(embed).then(m => {
          selectionMessage = m;
        }).catch(console.log);

        msg.channel.awaitMessages(m => !isNaN(parseInt(m.content))
                && m.author.id === msg.author.id
                && (parseInt(m.content) >= 1 && parseInt(m.content) <= length), {max: 1, time: 30000, errors: ['time']}).then(collected => {
          selection = parseInt(collected.first().content)-1;

          let strain = searchResult[selection];
          getStrainEffects(strain.id).then(effects => {
            getStrainFlavors(strain.id).then(flavors => {
              selectionMessage.delete();
              collected.first().delete();

              deleteCommandMessages(msg);
              return msg.say(createStrainEmbed(msg, strain, effects, flavors));
            }).catch((error) => {
              console.log(error);
              return msg.reply(error);
            });
          }).catch((error) => {
            console.log(error);
            return msg.reply(error);
          });
        }).catch(() => {
          return msg.reply('Cancelled command.');
        });
      }
    }).catch((error) => {
      console.log(error);
      return msg.reply(error);
    });
  }
};
