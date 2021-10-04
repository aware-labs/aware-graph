const TelegramBot = require('node-telegram-bot-api');

const functions = require('./functions');
const config = require('./config.json');

class DfCron {

  constructor() {
    this.telegram = new TelegramBot(config.TELEGRAM_TOKEN, {polling: false});

    const minutes = 5;
    this.getLastArrivals(minutes); 
  }
    
  sendMessage(chatId, text) {
    this.telegram.sendMessage(chatId, text, { parse_mode: 'MarkdownV2' });
  }

  getLastArrivals = async (minutes) => {
    const secondsSinceEpoch = Math.floor((Date.now() - (minutes * 60 * 1000)) / 1000 );
    const arrivals = await functions.lastArrivals(secondsSinceEpoch);

    if(arrivals.length != 0)
    arrivals
      .map(arrival => {
  
        if(arrival.subscriber.chatId) this.sendMessage(arrival.subscriber.chatId, arrival.text);
        
        console.log(arrival.text);
  
      }); else console.log( 'Nothing to fear');
  
  }

}

new DfCron();

module.exports = DfCron;