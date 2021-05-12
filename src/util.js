const request = require('request');
const Promise = require('bluebird');
const configName = process.env.CONFIG_NAME || 'config.json';
const config = require('./' + configName);
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const PSYCHONAUT_URL = 'https://api.psychonautwiki.org';
const TRIPSIT_URL = 'http://tripbot.tripsit.me/api/tripsit/getDrug?name=';

const escapeRegExp = function (string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

const dateDifference = function (date1, date2, unitOfTime) {
  let moment1 = moment(date1,'YYYY-MM-DD HH:mm:ss');
  let moment2 = moment(date2,'YYYY-MM-DD HH:mm:ss');
  return moment2.diff(moment1, unitOfTime);
};

const deleteCommandMessages = function (msg) {
  if (msg.deletable && config.general.deleteCommandMessages) {
    return msg.delete();
  }
};

const capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const get = function(options) {
  return new Promise(function(resolve, reject) {
    request.get(options, function(error, response, body){
      if (!error && response.statusCode === 200) {
        resolve({response, body});
      }
      else {
        reject(error);
      }
    });
  });
};

const post = function(options) {
  return new Promise(function(resolve, reject) {
    request.post(options, function(error, response, body){
      if (!error && response.statusCode === 200) {
        resolve({response, body});
      }
      else {
        reject(error);
      }
    });
  });
};

const getPsychonautDrug = function(drugName) {
  return new Promise(function(resolve, reject) {
    request({
      url: PSYCHONAUT_URL,
      timeout: 10000,
      method: 'POST',
      json: {
        'query': '{ substances(query:"' + drugName + '"){' +
        ' name ' +
        ' summary ' +
        ' url ' +
        ' addictionPotential' +
        ' class { chemical psychoactive }' +
        ' roas { name dose { units threshold heavy common { min max } light { min max } strong { min max }  }' +
        ' duration {' +
        ' onset { min max units } comeup { min max units } peak { min max units } offset { min max units }' +
        ' total { min max units } duration { min max units } }' +
        ' bioavailability { min max } }' +
        ' effects { name url }' +
        ' tolerance { full half zero }' +
        ' crossTolerances' +
        ' dangerousInteractions { name }' +
        ' } }'
      }
    }, function(error, response, body) {
      if (error) {
        console.log(error);
        reject('Problem communicating with the Psychonaut Wiki API');
      }
      else if (response.statusCode !== 200 || body.err) {
        reject(JSON.stringify(body));
      }
      else if (body.data && body.data.substances && body.data.substances.length > 0){
        resolve(body.data.substances[0]);
      }
      else {
        resolve('Something went wrong with Psychonaut Wiki API');
      }
    });
  });
};

const getTripSitDrug = function(drugName) {
  return new Promise(function(resolve, reject) {
    request({
      url: TRIPSIT_URL + drugName,
      timeout: 10000,
      json: true
    }, function(error, response, body) {
      if (error) {
        console.log(error);
        reject('Problem communicating with the TripSit API');
      }
      else if (response.statusCode !== 200 || body.err) {
        resolve('Couldn\'t find any results. Is the drug name correct?');
      }
      else if (body.data && body.data.length > 0){
        resolve(body.data[0]);
      }
      else {
        reject('Something went wrong with TripSit API');
      }
    });
  });
};

const getDrugsPill = function(imprint, color, shape) {
  return new Promise ((resolve, reject) => {
    let cachedDrugPath = path.join(__dirname, `cache/pills/${imprint}` + `_${color}` + `_${shape}.json`);
    if (fs.existsSync(cachedDrugPath)) {
      let cachedDrug = require(cachedDrugPath);
      return resolve(cachedDrug);
    }

    let url = 'https://www.drugs.com/imprints.php?imprint=' + encodeURIComponent(imprint) + '&color=' + color + '&shape=' + shape;
    request.get({
      url: url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36'
      }
    }, function (error, response, body) {
      if (response.statusCode === 200) {
        let {document} = (new JSDOM(body, {includeNodeLocations: true})).window;

        if (!document.querySelector('.pid-box-1')) {
          return reject('No results were found. Is the pill imprint correct ?');
        }

        let imageURL = document.querySelector('.pid-img img').getAttribute('src');
        let detailsURL = document.querySelector('.ddc-btn.ddc-btn-sm').getAttribute('href');

        const strengthregex = /(\<\l\i\>\<b\>Strength\:<\/b\> )(.*)(<\/li\>)/;
        const imprintregex = /(\.html\"\>)(.*)(<\/a\>)/;
        const colorregex = /(\<li\>\<b\>Color\:\<\/b\> )(.*)(\<\/li\>  )/;
        const shaperegex = /(\<li\>\<b\>Shape\:\<\/b\> )(.*)(\<\/li\>)/;

        let drug = document.getElementsByClassName('imprintdruglink')[0].innerHTML;
        let details = document.getElementsByClassName('pid-details')[0].innerHTML;
        let strengthmatched = details.match(strengthregex);
        let strength = strengthmatched[2];

        let imprintmatched = details.match(imprintregex);
        let imprint = imprintmatched[2];
        imprint = imprint.toUpperCase();

        let colormatched = details.match(colorregex);
        let color = colormatched[2];
        color = color.replace('&amp;', '&');

        let shapematched = details.match(shaperegex);
        let shape = shapematched[2];

        fs.writeFileSync(cachedDrugPath, JSON.stringify({
          drugName: drug,
          strength: strength,
          imprint: imprint,
          color: color,
          shape: shape,
          imageURL: 'https://www.drugs.com' + imageURL,
          detailsURL: 'https://www.drugs.com' + detailsURL,
          queryURL: url
        }), {encoding:'utf8',flag:'w'});

        return resolve({
          drugName: drug,
          strength: strength,
          imprint: imprint,
          color: color,
          shape: shape,
          imageURL: 'https://www.drugs.com' + imageURL,
          detailsURL: 'https://www.drugs.com' + detailsURL,
          queryURL: url
        });
      }
      else {
        return reject('There was an error communicating to the server.');
      }
    });
  });
};

const isStaffMember = function(member) {
  return (member.roles.has(config.roles.trusted)
        || member.roles.has(config.roles.supports)
        || member.roles.has(config.roles.admin));
};

module.exports = {
  capitalizeFirstLetter,
  deleteCommandMessages,
  get,
  post,
  getPsychonautDrug,
  getTripSitDrug,
  isStaffMember,
  dateDifference,
  getDrugsPill,
  escapeRegExp
};
