const Discord = require('discord.js');
const commando = require('discord.js-commando');
const {deleteCommandMessages, getPsychonautDrug, getTripSitDrug, capitalizeFirstLetter} = require('../../util.js');

let formatTolerance = function(tolerance, crossTolerances) {
  let toleranceString = '';
  if (tolerance.full) {
    toleranceString += '**Full** ' + tolerance.full + '\n';
  }
  if (tolerance.half) {
    toleranceString += '**Half** ' + tolerance.half + '\n';
  }
  if (tolerance.zero) {
    toleranceString += '**Baseline** ' + tolerance.zero + '\n';
  }
  if (crossTolerances) {
    toleranceString += '***Shares cross tolerance with: ' + capitalizeFirstLetter(crossTolerances.join(', ')) + '***';
  }
  return toleranceString;
};

let createDrugEmbed = function(tripSit, psychonaut) {
  let tripSitInd = true;
  let psychonautInd = true;
  if (tripSit === 'Couldn\'t find any results. Is the drug name correct?') {
    tripSitInd = false;
  }
  if (psychonaut === 'No hit on Psychonaut Wiki API') {
    psychonautInd = false;
  }
  if (tripSitInd === false && psychonautInd === false) {
    return new Discord.MessageEmbed()
      .setColor(13632027)
      .setAuthor(tripSit)
      .setTimestamp();
  }
  let embedHeader = tripSit.pretty_name;
  let aliases = tripSit.properties.aliases;
  if (aliases && aliases.length > 0) {
    if (aliases.length > 1) {
      embedHeader = embedHeader + ' (also known as ' + aliases.slice(0,aliases.length-1).join(', ') +
            ' and ' + aliases[aliases.length-1] + ')';
    }
    else {
      embedHeader = embedHeader + ' (also known as ' + aliases[0] + ')';
    }
  }

  let embed = new Discord.RichEmbed()
    .setColor(3447003)
    .setFooter('For further information click on the name of the drug.')
    .setTimestamp();

  if (psychonautInd === true) {
    embed.setAuthor(embedHeader, 'https://i.imgur.com/fD0cG2j.png', psychonaut.url);
  }
  else if (psychonautInd === false) {
    embed.setAuthor(embedHeader, 'https://i.imgur.com/fD0cG2j.png', 'http://drugs.tripsit.me/' + tripSit.name);
  }
  if (tripSit.properties.summary) {
    embed.addField('__Summary__', tripSit.properties.summary);
  }
  if (tripSit.formatted_effects) {
    embed.addField('__Effects__', capitalizeFirstLetter(tripSit.formatted_effects.join(', ')));
  }
  if (psychonaut.tolerance) {
    embed.addField('__Tolerance__', formatTolerance(psychonaut.tolerance, psychonaut.crossTolerances), false);
  }
  if (psychonaut.dangerousInteractions && psychonautInd === true) {
    let drugs = '';
    for (var drug of psychonaut.dangerousInteractions) {
      drugs += drug.name + '. ';
    }
    embed.addField('__Dangerous Interactions__', drugs);
  }
  else if (tripSit.properties.avoid) {
    embed.addField('__Dangerous Interactions__', tripSit.properties.avoid);
  }
  //
  // DOSAGE FORMATTING
  //
  if (psychonaut.roas && (!tripSit.formatted_dose || (psychonaut.roas.length >= Object.keys(tripSit.formatted_dose).length))) {
    let dose = '';
    let duration = '';
    if (tripSit.name === 'mushrooms') {
      psychonaut.roas[0].dose.units = 'g';
    }
    for (var roa of psychonaut.roas) {
      if (roa.dose && (Object.keys(roa.dose).length > 0)) {
        dose += '**' + capitalizeFirstLetter(roa.name) +  '**\n';
        if (roa.dose.threshold) {
          dose += 'Threshold: ' + roa.dose.threshold + roa.dose.units + '\n';
        }
        if (roa.dose.light) {
          dose += 'Light: ' + roa.dose.light.min + '-' + roa.dose.light.max + roa.dose.units + '\n';
        }
        if (roa.dose.common) {
          dose += 'Common: ' + roa.dose.common.min + '-' + roa.dose.common.max + roa.dose.units + '\n';
        }
        if (roa.dose.strong) {
          dose += 'Strong: ' + roa.dose.strong.min + '-' + roa.dose.strong.max+ roa.dose.units + '+\n';
        }
      }

      if (roa.duration) {
        duration += '**' + capitalizeFirstLetter(roa.name) +  '**\n';
        if (roa.duration.onset) {
          duration += 'Onset: ' + roa.duration.onset.min + '-' + roa.duration.onset.max + ' ' + roa.duration.onset.units + '\n';
        }
        if (roa.duration.comeup) {
          duration += 'Comeup: ' + roa.duration.comeup.min + '-' + roa.duration.comeup.max + ' ' + roa.duration.comeup.units + '\n';
        }
        if (roa.duration.peak) {
          duration += 'Peak: ' + roa.duration.peak.min + '-' + roa.duration.peak.max + ' ' + roa.duration.peak.units + '\n';
        }
        if (roa.duration.offset) {
          duration += 'Offset: ' + roa.duration.offset.min + '-' + roa.duration.offset.max + ' ' + roa.duration.offset.units + '\n';
        }
        if (roa.duration.afterglow) {
          duration += 'Afterglow: ' + roa.duration.afterglow.min + '-' + roa.duration.afterglow.max + ' ' + roa.duration.afterglow.units + '\n';
        }
        if (roa.duration.total) {
          duration += 'Total: ' + roa.duration.total.min + '-' + roa.duration.total.max + ' ' + roa.duration.total.units + '\n';
        }
      }
    }

    if (dose === '') {
      dose = 'No dose info';
    }

    if (duration === '') {
      duration = 'No duration info';
    }
    embed.addField('__Dose__', dose, true);
    if (!tripSit.properties.onset && !tripSit.properties.duration && duration === 'No duration info') {
      embed.addField('__Duration__', duration,true);
    }

  }
  else if (tripSit.formatted_dose){
    let dose = '';
    let method = Object.getOwnPropertyNames(tripSit.formatted_dose);
    for (var i = 0; i < method.length; i++) {
      if (method[i] !== 'none') {
        dose += `**${method[i]}**\n`;
      }
      let strengths = Object.getOwnPropertyNames(tripSit.formatted_dose[method[i]]);
      for (var j = 0; j < strengths.length; j++) {
        dose += `${strengths[j]}: ${tripSit.formatted_dose[method[i]][strengths[j]]}\n`;
      }
      dose += '\n';
    }
    embed.addField('__Dose__', dose, true);
  }
  var durationpreviouslySet = false;
  for (let index = 0; index < embed.fields.length; index++) {
    const element = embed.fields[index];
    if (element.name === '__Duration__') {
      durationpreviouslySet = true;
      if (element.value === 'No duration info') {
        durationpreviouslySet = false;
      }
    }
  }
  if (tripSit.properties.duration && tripSit.properties.onset && durationpreviouslySet === false) {
    var onsetjoined = tripSit.properties.onset;
    var durationjoined = tripSit.properties.duration;

    if (tripSit.properties.onset.includes('|')) {
      var onset = tripSit.properties.onset.split('|');
      onsetjoined = onset.join('\n');
    }

    if (tripSit.properties.duration.includes('|')) {
      var duration = tripSit.properties.duration.split('|');
      durationjoined = duration.join('\n');
    }
    embed.addField('__Duration__', '**Onset:** \n' + onsetjoined + '\n**Total:** \n' + durationjoined, true);
  }
  if (psychonaut.addictionPotential) {
    embed.addField('\u200B', '**Addiction Potential - ' + capitalizeFirstLetter(psychonaut.addictionPotential) + '**');
  }
  if (tripSit.links) {
    let embedlinks = '';
    if (tripSit.links.experiences) {
      embedlinks += `[Erowid Experiences](${tripSit.links.experiences})`;
    }
    if (tripSit.links.pihkal) {
      embedlinks += `, [PiHKAL Page](${tripSit.links.pihkal})`;
    }
    if (tripSit.links.tihkal) {
      embedlinks += `, [TiHKAL Page](${tripSit.links.tihkal})`;
    }
    embed.addField('\u200B', '**Additional Links - ' + embedlinks + '**');
  }
  return embed;
};

module.exports = class drugCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'drug',
      'memberName': 'drug',
      'group': 'everyone',
      'description': 'get information about any drugs',
      'examples': ['drug lsd'],
      'guildOnly': false,
      'argsPromptLimit': 0,

      'args': [
        {
          'key': 'drugName',
          'prompt': 'which drug you are looking information for ?',
          'type': 'string'
        }
      ]
    });
  }

  run (msg, args) {
    let tripSit;
    getTripSitDrug(args.drugName).then(function(result) {
      tripSit = result;
      return getPsychonautDrug(tripSit.pretty_name);
    }).then(function(result) {
      getTripSitDrug(args.drugName).then(function(tripresult) {
        if (tripresult === 'Couldn\'t find any results. Is the drug name correct?') {
          deleteCommandMessages(msg);
          return msg.embed(createDrugEmbed(tripSit, result));
        }
        deleteCommandMessages(msg);
        return msg.embed(createDrugEmbed(tripSit, result));
      });
    });
  }
};
