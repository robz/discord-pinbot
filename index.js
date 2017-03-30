'use strict';

const Discord = require('discord.js');
const readlineSync = require('readline-sync');
const token = require('./token');

const bot = new Discord.Client();

bot.on('ready', () => {
  console.log('I am ready!');
  const guild = bot.guilds.find('name', 'Balcony Third Evolution');
  const channel = guild.channels.find('name', 'surgerytheater');

  console.log(`Fetching pinned messages from ${channel.name}...`);

  channel.fetchPinnedMessages().then(
    handleMessages,
    error => handleMessages([])
  );

  function handleMessages(messages) {
    const mostRecentTimestamp = messages.array()
      .map(message => message.createdTimestamp)
      .reduce((a, b) => a > b ? a : b, 0);
    const timestampString = new Date(mostRecentTimestamp).toString();

    console.log(
      `The most recent pinned message on the ${channel.name} channel occured at`,
      timestampString
    );

    channel.fetchMessages().then(messages => {
      messages = messages.array()
        .filter(message =>
          message.createdTimestamp > mostRecentTimestamp &&
          message.content.includes('http')
        );

      if (!messages.length) {
        console.log('And there have not been messages with links since then!')
        return;
      }

      const count = messages.length;
      const list = messages
        .map(({content}, i) => `  ${i + 1}. ` + content)
        .join('\n');

      console.log(
        'Since then, there have been ' + count + ' messages with ' +
        'links: \n\n' + list + '\n'
      );

      const answer = readlineSync.question('Pin them as well? (y/n) ');
      if (answer !== 'y') {
        console.log('ok, goodbye');
      }

      console.log('Pinning...');
      Promise.all(messages.map(message => message.pin())).then(() => {
        console.log('Done pinning');

        channel.send(
          `I have pinned ${count} message(s) with links sent after ${timestampString}`
        );
      });
    });
  }
});

// log our bot in
bot.login(token);
