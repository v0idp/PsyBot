const Discord = require('discord.js');
const commando = require('discord.js-commando');
const {deleteCommandMessages, getPsychonautDrug, getTripSitDrug, capitalizeFirstLetter} = require('../../util.js');

const validClasses = {
  'Psychedelics': true,
  'Psychedelic': true,
  'Psychedelics#': true,
  'Dissociatives': true,
  'Dissociatives#': true,
  'Dissociative': true,
  'Entactogen': true,
  'Entactogen#': true,
  'Entactogens': true,
  'Entactogens#': true,
  'Hallucinogen': true,
  'Hallucinogen#': true,
  'Tryptamine#': true
};

const validChemicalClasses = {
  'Tryptamine': true,
  'Tryptamine#': true,
  'Phenethylamine': true,
  'Phenethylamine#': true,
  'Lysergamide': true,
  'Lysergamide#': true
};

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
  let embed = new Discord.MessageEmbed()
    .setAuthor(embedHeader, 'https://i.imgur.com/fD0cG2j.png', psychonaut.url)
    .setColor(3447003)
    .setFooter('For further information click on the name of the drug.')
    .setTimestamp();

  if (tripSit.properties.summary) {
    embed.addField('__Summary__', tripSit.properties.summary);
  }
  if (tripSit.formatted_effects) {
    embed.addField('__Effects__', capitalizeFirstLetter(tripSit.formatted_effects.join(', ')));
  }
  if (psychonaut.tolerance) {
    embed.addField('__Tolerance__', formatTolerance(psychonaut.tolerance, psychonaut.crossTolerances), false);
  }
  //
  // DOSAGE FORMATTING
  //
  if (psychonaut.roas && (!tripSit.formatted_dose || (psychonaut.roas.length >= Object.keys(tripSit.formatted_dose).length))) {
    let dose = '';
    let duration = '';
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

    if (duration === '' ) {
      duration = 'No duration info';
    }
    embed.addField('__Dose__', dose, true);
    embed.addField('__Duration__', duration,true);

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
  if (psychonaut.addictionPotential) {
    embed.addField('\u200B', '**Addiction Potential - ' + capitalizeFirstLetter(psychonaut.addictionPotential) + '**');
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
      let validDrugClass = false;
      if (result.class && result.class.psychoactive) {
        for (let i = 0;i < result.class.psychoactive.length;i++) {
          if (validClasses[result.class.psychoactive[i]]) {
            validDrugClass = true;
            break;
          }
        }
      }
      else if (result.class && result.class.chemical) {
        for (let i = 0;i < result.class.chemical.length;i++) {
          if (validChemicalClasses[result.class.chemical[i]]) {
            validDrugClass = true;
            break;
          }
        }
      }

      if (validDrugClass) {
        deleteCommandMessages(msg);
        return msg.embed(createDrugEmbed(tripSit, result));
      }
      else {
        msg.author.send('We are a psychedelic oriented server. The drug you requested is not a psychedelic,'
                + ' dissociative or entactogen and so we would appreciate if you limit your discussion of this substance. '
                + 'In the interest of harm reduction here is some information:');
        msg.author.send(createDrugEmbed(tripSit, result));

        deleteCommandMessages(msg);
        return msg.reply('please check your DMs for information about this drug.');
      }
    }).catch((error) => {
      console.log(error);
      return msg.reply(error);
    });
  }
};
