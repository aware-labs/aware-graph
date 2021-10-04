const fs = require('fs');

const TelegramBot = require('node-telegram-bot-api');

const config = require('./config.json');
const functions = require('./functions');

// TO TEST

const userPlanets = async (id) => {
  const getPlanets = await functions.userPlanets(id);
  console.log(getPlanets);
}

const getPlanet = async (id) => {
  const planet = await functions.getPlanet(id);
  console.log(planet);
}

//// List your planets, compare if you have lost any
//userPlanets("YOUR_ID");

//// Subscribe to arrivals, then run npm run cron
//functions.subscribeArrivals("YOUR_ID");

//getPlanet("PLANET_ID");

//functions.getUsersTwitter();


if(config.TELEGRAM_TOKEN != "") {
  const bot = new TelegramBot(config.TELEGRAM_TOKEN, {polling: true});

  bot.onText(/\/start/, function (msg) {
    //if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    var reply = 'Hi ' + msg.chat.first_name + ' 🙌, I\'m your 🤖\nI\'ve been created to give you all the informations regarding /darkforest or /thegraph 😊 Start with /help to get a list of all available commands';
    bot.sendMessage(chatId, reply, { parse_mode: 'MarkdownV2' });
  });

  bot.onText(/\/df (.+) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
      const requestName = match[1];
      const requestID = match[2];

      console.log(requestName, requestID)

      if(!requestID)
      bot.sendMessage(chatId, 'no id', { parse_mode: 'MarkdownV2' });

      const requestFunc = requestFunctionMap[requestName];

      if (requestFunc) {
        requestFunc(requestID, chatId).then(message => {
          console.log(message);
          bot.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
        })
      } else {
        bot.sendMessage(chatId, 'Sorry, I don`t know such request', { parse_mode: 'MarkdownV2' });
      }
  });

  bot.onText(/\/get (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
      const requestName = match[1];

      const requestFunc = requestFunctionMap[requestName];

      if (requestFunc) {
        requestFunc().then(message => {
          console.log(message);
          bot.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
        })
      } else {
        bot.sendMessage(chatId, 'Sorry, I don`t know such request', { parse_mode: 'MarkdownV2' });
      }
  });

  bot.onText(/\/help/, (msg, match) => {
    const chatId = msg.chat.id;

    const message = `*Available commands:* \n\n` +
      `*\\/thegraph* \\- Show all available commands\n` +
      `*\\/darkforest* \\- Show all Dark Forest available commands\n`

    bot.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });

  });

  bot.onText(/\/darkforest/, (msg, match) => {
    const chatId = msg.chat.id;

    const message = `*Available commands:* \n\n` +
      `*\\/df planet PlanetID* \\- Check a planet\n` +
      `*\\/df planets YourID* \\- Check your planets\n` +
      `*\\/df subscribe attacks YourID* \\- Subscribe attacks\n`

    bot.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });

  });

  bot.onText(/\/thegraph/, (msg, match) => {
    const chatId = msg.chat.id;

    const message = `*Available commands:* \n\n` +
      `*\\/get total subgraphs* \\- Show total deployed subgraphs\n` +
      `*\\/get last subgraphs* \\- Show last 5 deployed subgraphs\n` +
      `*\\/get indexers* \\- Show 20 indexers sorted by deposited stake\n` +
      `*\\/get grt* \\- show current GRT/USD exchange rate `

    bot.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });

  });

  const requestFunctionMap = {
    'planets': functions.userPlanets,
    'planet': functions.getPlanet,
    'subscribe arrivals': functions.subscribeArrivals,
    'last subgraphs': functions.getLastSubgraphsInfo,
    'grt': functions.getGRTPiceInfo,
    'total subgraphs': functions.getSubgraphsCountInfo,
    'indexers': functions.getIndexersInfo
  }
}