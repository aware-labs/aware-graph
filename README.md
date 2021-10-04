WORK IN PROGRESS

List your planets, compare if you have lost any, get planet info
Check if your planets are under attack
Telegram bot text to warn you (todo; cron)

Available Telegram commands: 

/df planet PlanetID - Check a planet
/df planets YourID - Check your planets
/df subscribe attacks YourID - Subscribe attacks

# Install

```sh
npm i
```

## Config

in src/config.json, add your TELEGRAM_TOKEN (bot token)

if not, add your info in index.js and uncomment some test

### Run

```sh
npm start
```

#### run cron

run it manually to check last 10 minutes arrivals if your planets are under attack

```sh
npm run cron
```

TODO; run it periodically

