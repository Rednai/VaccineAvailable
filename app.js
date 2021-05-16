const fs       = require('fs');
const fetch    = require('node-fetch');
const notifier = require('node-notifier');
const open     = require('open');
const cron     = require('node-cron');
const moment   = require('moment');

function verifyLabs () {
  console.log('Vérification des labos - ' + moment().format('YYYY/MM/D hh:mm:ss'));

  let labs;

  try {
    const data = fs.readFileSync('data/labs.json');
    labs = JSON.parse(data);
  } catch (err) {
    console.error(err);
    process.exit();
  }

  labs.forEach(lab => {
    fetch(lab.request.replace('XXXX', moment().format('YYYY-MM-D')), {
      "headers": {
        "accept": "application/json",
        "content-type": "application/json; charset=utf-8",
      },
      "method": "GET",
    })
      .then(res => res.json())
      .then(json => {
        if (json.availabilities.length !== 0 &&
          (json.availabilities[0].slots.length !== 0 || json.availabilities[1].slots.length !== 0)) {
          notifier.notify({
            title: 'Vaccin disponible !',
            message: 'Un vaccin est disponible :\n' + lab.name,
            icon: './assets/icons/vaccin.png',
          }, (err, response) => {
            if (err) {
              return console.error(err);
            }
            if (response === 'activate') {
              open(lab.url);
            }
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  });
}

console.log('Démarrage du script - ' + moment().format('YYYY/MM/D hh:mm:ss'));
verifyLabs();
cron.schedule('* * * * *', verifyLabs);