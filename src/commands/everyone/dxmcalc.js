const commando = require('discord.js-commando');

// Calculate weight in pounds
function calculateWeight(weight, isKilos) {
  if (isKilos) {
    return Math.floor(weight * 2.2);
  }
  else {
    return weight;
  }
}

// Calculate dxm dosages
function generateDxmDosages(weight, isKilos) {
  const weightInLbs = calculateWeight(weight, isKilos);
  const dosageArray = [];

  plat1min = Math.floor(.68 * weightInLbs);
  plat2min = Math.floor(1.13 * weightInLbs);
  plat3min = Math.floor(3.4 * weightInLbs);
  plat4min = Math.floor(6.8 * weightInLbs);

  plat1max = Math.floor(1.25 * weightInLbs);
  plat2max = Math.floor(3.4 * weightInLbs);
  plat3max = Math.floor(4.26 * weightInLbs);
  plat4max = Math.floor(8.16 * weightInLbs);

  dosageArray.push(`**First Plateau**: ${plat1min}-${plat1max}mg`);
  dosageArray.push(`**Second Plateau**: ${plat2min}-${plat2max}mg`);
  dosageArray.push(`**Third Plateau**: ${plat3min}-${plat3max}mg`);
  dosageArray.push(`**Fourth Plateau**: ${plat4min}-${plat4max}mg`);

  return dosageArray.join('\n');
}

// Calculate dxm dosages
function generateRecommendations(weight, isKilos) {
  const weightInLbs = calculateWeight(weight, isKilos);
  const dosageArray = [];

  plat1 = Math.floor(1.22 * weightInLbs);
  plat2 = Math.floor(2.9 * weightInLbs);
  plat3 = Math.floor(4.26 * weightInLbs);
  plat4 = Math.floor(8.16 * weightInLbs);

  dosageArray.push(`**First Plateau**: ${plat1}mg`);
  dosageArray.push(`**Second Plateau**: ${plat2}mg`);
  dosageArray.push(`**Third Plateau**: ${plat3}mg`);
  dosageArray.push(`**Fourth Plateau**: ${plat4}mg`);

  return dosageArray.join('\n');
}

module.exports = class dxmcalcCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'dxmcalc',
      'memberName': 'dxmcalc',
      'aliases': ['dexcalc'],
      'group': 'everyone',
      'description': 'calculate the various dxm doses by your weight',
      'examples': ['dxmcalc 200'],
      'guildOnly': false,
      'argsPromptLimit': 0,

      'args': [
        {
          'key': 'weight',
          'prompt': 'what was your previous dosage ?',
          'type': 'string'
        },
        {
          'key': 'units',
          'prompt': 'is the weight you entered in kg?',
          'type': 'string',
          'default': 'null'
        }
      ]
    });
  }

  run (msg, args) {

    // parse weight from result
    let weight = parseInt(args.weight);
    let weightIsKilos = false;
    let unit = args.units;
    if (args.units === 'null') {
      const unitregex = /\d+(\D+)/;
      let unitmatched = args.weight.toString().match(unitregex);
      if (unitmatched) {
        unit = unitmatched[1];
      }
    }
    if (unit.includes('kg')) {
      weightIsKilos = true;
      unit = 'kg';
    }
    else {
      unit = 'lbs';
    }

    if (!unit.includes('kg') && !unit.includes('lbs')) {
      return msg.say('Please enter a valid weight.');
    }
    if (unit === 'kg' && weight > 179) {
      return msg.say('Please enter a valid weight.');
    }
    if (unit === 'lbs' && weight > 398) {
      return msg.say('Please enter a valid weight.');
    }

    var dxmdosearray = generateDxmDosages(weight,weightIsKilos);
    var recommendarray = generateRecommendations(weight,weightIsKilos);

    return msg.say({embed: {
      color: 3447003,
      author: {
        name: this.client.user.username,
        icon_url: this.client.user.avatarURL
      },
      description: `Dosages for your entered weight of: **${weight}${unit}**\n\n**Note:** Enzyme deficiency can result in even low doses being drastically more intense, first time users should approach this substance with caution.\n\nAny doses exceeding 500-600 mg are typically uncomfortable and very intense for beginners. Doses exceeding 1500 mg are always considered dangerous, even experienced users should not consider values higher than this as safe.`,
      title: 'Personalized DXM Dosage Calculator',
      url: 'http://dexcalc.com/',
      fields: [
        {
          name: 'Dosages',
          value: `${dxmdosearray}`,
          inline: true
        },
        {
          name: 'Recommended',
          value: `${recommendarray}`,
          inline: false
        }
      ],
      timestamp: new Date(),
      footer: {
        text: 'This is just a guideline based on calculations from DexCalc.com',
        icon_url: this.client.user.avatarURL
      }
    }
    });
  }
};
