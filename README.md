# PsyBot

[![Discord](https://img.shields.io/badge/Discord-PsyBot-7289DA.svg?style=flat-square)](https://discord.gg/pvXZwfh)

PsyBot is a harm reduction and drug education orientated discord bot which provides you several commands to get information on different substances.

## Features

* drug informations
* weed strain informations
* pill informations
* information about combination of different drugs
* tolerance calculation for LSD based on scientific papers

Use ``-help`` to get an overview of commands.

## Requirements

* [NodeJS 10.x +](https://nodejs.org/en/download/)

## Invite Public Bot

If you don't want to set up the bot yourself, you can invite the official bot with this link:
[Invite Link](https://discordapp.com/oauth2/authorize?client_id=618777826878947338&scope=bot&permissions=93248)

## Installation & Configuration

Before starting your bot you will need to invite it to your server first. I recommend using this for beginners: https://discordapi.com/permissions.html
Your bot will need following permissions:

* Read Messages
* Send Messages
* Manage Messages
* Embed Links
* Read Message History
* Add Reactions

Enter your bot client id into the field down below in the Permission Calculator. You can get it from your bot application site where you created your bot.
Next click on the link at the bottom and invite the bot to your server.

Go into the Mellow root folder and type
```sh
npm prestart
```

To start the bot just simply type
```sh
npm start
```

## Docker Setup & Start

If you want to use this bot in a docker container you have to follow these steps:
* Pull from docker hub: ``docker pull voidp/psybot``
* Run docker image:
```
docker run -d --name psybot voidp/psybot
```

## Contributing

1. Fork it (<https://github.com/v0idp/PsyBot/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request