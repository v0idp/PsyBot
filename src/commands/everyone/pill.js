const Discord = require('discord.js');
const commando = require('discord.js-commando');
const {deleteCommandMessages, getDrugsPill, capitalizeFirstLetter} = require('../../util.js');

const colors = {
  'white': 12,
  'beige': 14,
  'black': 73,
  'blue': 1,
  'brown': 2,
  'clear': 3,
  'gold': 4,
  'gray': 5,
  'green': 6,
  'maroon': 44,
  'orange': 7,
  'peach': 74,
  'pink': 8,
  'purple': 9,
  'red': 10,
  'tan': 11,
  'white': 12,
  'yellow': 13,
  'beige & red': 69,
  'black & green': 55,
  'black & teal': 70,
  'black & yellow': 48,
  'blue & brown': 52,
  'blue & gray': 45,
  'blue & green': 75,
  'blue & orange': 71,
  'blue & peach': 53,
  'blue & pink': 34,
  'blue & white': 19,
  'blue & white specks': 26,
  'blue & yellow': 21,
  'brown & clear': 47,
  'brown & orange': 54,
  'brown & peach': 28,
  'brown & red': 16,
  'brown & white': 57,
  'brown & yellow': 27,
  'clear & green': 49,
  'dark & light green': 46,
  'gold & white': 51,
  'gray & peach': 61,
  'gray & pink': 39,
  'gray & red': 58,
  'gray & white': 67,
  'gray & yellow': 68,
  'green & orange': 65,
  'green & peach': 63,
  'green & pink': 56,
  'green & purple': 43,
  'green & turquoise': 62,
  'green & white': 30,
  'green & yellow': 22,
  'lavender & white': 42,
  'maroon & pink': 40,
  'orange & turquoise': 50,
  'orange & white': 64,
  'orange & yellow': 23,
  'peach & purple': 60,
  'peach & red': 66,
  'peach & white': 18,
  'pink & purple': 15,
  'pink & red specks': 37,
  'pink & turquoise': 29,
  'pink & white': 25,
  'pink & yellow': 72,
  'red & turquoise': 17,
  'red & white': 35,
  'red & yellow': 20,
  'tan & white': 33,
  'turquoise & white': 59,
  'turquoise & yellow': 24,
  'white & blue specks': 32,
  'white & red specks': 41,
  'white & yellow': 38,
  'yellow & gray': 31,
  'yellow & white': 36
};

const shapes = {
  'barrel': 1,
  'capsule': 5,
  'character': 6,
  'egg': 9,
  'eight-sided': 10,
  'elliptical': 11,
  'oval': 11,
  'eighte': 12,
  'five-sided': 13,
  'four-sided': 14,
  'gear': 15,
  'heart': 16,
  'kidney': 18,
  'rectangle': 23,
  'round': 24,
  'seven-sided': 25,
  'six-sided': 27,
  'three-sided': 32,
  'u': 33
};

let createPillEmbed = function(pill) {
  let embed = new Discord.MessageEmbed()
    .setAuthor(capitalizeFirstLetter(pill.imprint), 'https://i.imgur.com/fD0cG2j.png', pill.detailsURL)
    .setTitle('Not what you\'re looking for ? Click here')
    .setURL(pill.queryURL)
    .setColor(3447003)
    .setFooter('For further information click on the name of the pill.')
    .setTimestamp()
    .setThumbnail(pill.imageURL);

  embed.addField('__Name__', capitalizeFirstLetter(pill.drugName));
  embed.addField('__Strength__', pill.strength);
  embed.addField('__Color__', capitalizeFirstLetter(pill.color));
  embed.addField('__Shape__', capitalizeFirstLetter(pill.shape));

  return embed;
};

module.exports = class pillCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'pill',
      'memberName': 'pill',
      'group': 'everyone',
      'description': 'get information about any pill',
      'examples': ['pill r3060'],
      'guildOnly': false,
      'argsPromptLimit': 0,

      'args': [
        {
          'key': 'imprint',
          'prompt': 'what\'s the imprint on the pill ?',
          'type': 'string'
        },
        {
          'key': 'color',
          'prompt': 'what\'s the color of the pill ?',
          'type': 'string',
          'default': 'none'
        },
        {
          'key': 'shape',
          'prompt': 'what\'s the shape of the pill ?',
          'type': 'string',
          'default': 'none'
        }
      ]
    });
  }

  run (msg, args) {
    args.color = args.color.toLowerCase();
    args.shape = args.shape.toLowerCase();

    getDrugsPill(args.imprint, (colors[args.color])?colors[args.color]:0, (shapes[args.shape])?shapes[args.shape]:0).then(pill => {
      deleteCommandMessages(msg);
      return msg.embed(createPillEmbed(pill));
    }).catch((err) => {
      return msg.reply(err);
    });
  }
};
