const fs = require('fs');
const axios = require('axios');

const df_utils = require('./darkforest/utils');
const df_planets = require('./darkforest/planets');
const df_arrivals = require('./darkforest/arrivals');

const thegraph = require('./thegraph/query');

const userPlanets = (owner) => df_planets.getUserPlanets(owner).then(response => {
  let text = '';
  
  if (response.error) {
    return response.error;
  }

  let message = '*'+response.planets_count+' total planets*\n';

  if(response.planets_lost) {
    message += '*'+response.planets_new_count+' new planet*\n';
    message += '*'+response.planets_lost_count+' lost planet*\n\n' +
      response.planets_lost.map(
        info => `/df planet ${info.id} \n\n`
      ).join('\n\n');
  } else message += '*First time*';

  message += df_utils.escapeMsg(text);

  return message;

});

const lastArrivals = (epoch) => df_arrivals.getLastArrivals(epoch).then(response => {
  
  if (response.error) {
    return response.error;
  }

  let attacks = [];

  response
    .map(result => {

      let text = '';
      let arrival = result.arrival;

      text += '/df planet ' + arrival.toPlanet.id + '\n';

      //text += myDoArrive(arrival.toPlanet, arrival); // TODO: calcul energy after attack

      text += df_utils.formatNumber(arrival.energyArriving, 0) + ' attack planet L' + arrival.toPlanet.planetLevel + ', ';

      if(arrival.arrived) text += 'arrived \n';
      else {
        let arrivalTimeInSeconds = Math.round((arrival.arrivalTime - Date.now() / 1000));

        text += `arrive in ${df_utils.secondsToHms(arrivalTimeInSeconds)} \n`;
      }

      text += `${Math.round((arrival.energyArriving / arrival.toPlanet.defense * 100) / arrival.toPlanet.energyCap * 100)}% damage vs `;
      text += `${Math.round((arrival.toPlanet.energy) / arrival.toPlanet.energyCap * 100)}% \n`;      

      text += 'Energy: ' + df_utils.formatNumber(df_utils.getEnergyAtTime(arrival.toPlanet.energy / 1000, arrival.toPlanet.energyGrowth / 1000, arrival.toPlanet.energyCap / 1000, Date.now() / 1000 - arrival.toPlanet.lastUpdated, arrival.toPlanet.owner.id), 1)+' / ' + 
      df_utils.formatNumber(arrival.toPlanet.energyCap / 1000) +' \n\n';  

      attacks.push({text: df_utils.escapeMsg(text), subscriber: result.subscriber})

    });

    return attacks;

});

function myDoArrive (toPlanet, arrival) {
  // adopted from Game code GameEntityMemoryStore.ts 
  // and sitrep plugin
  // https://github.com/darkforest-eth/plugins/blob/master/content/productivity/sitrep/plugin.js
  // but it doent work

  let contractPrecision = 1000;

  let duration = arrival.arrivalTime - toPlanet.lastUpdated;
  let toPlanetEnergy = 0;

  // update toPlanet energy and silver right before arrival

  //if (toPlanet.owner !== "PIRATES") {//todo
    toPlanetEnergy = df_utils.getEnergyAtTime(toPlanet.energy / 1000, toPlanet.energyGrowth / 1000, toPlanet.energyCap / 1000, duration, toPlanet.owner.id);
  //}

  // apply energy
  if (arrival.player.id !== toPlanet.owner.id) {
    // attacking enemy - includes emptyAddress

    console.log(toPlanetEnergy, Math.floor((arrival.energyArriving * contractPrecision * 100) / toPlanet.defense) / contractPrecision)


    if (
      toPlanetEnergy >
      Math.floor((arrival.energyArriving * contractPrecision * 100) / toPlanet.defense) /
      contractPrecision
    ) {
      // attack reduces target planet's garrison but doesn't conquer it
      toPlanetEnergy -=
        Math.floor(
          (arrival.energyArriving * contractPrecision * 100) / toPlanet.defense
        ) / contractPrecision;
    
        return df_utils.formatNumber(arrival.energyArriving, 0) + ' energy attack will reduces target to ' + df_utils.formatNumber(toPlanetEnergy, 0);

    } else {
      // conquers planet
      toPlanetEnergy =
        arrival.energyArriving -
        Math.floor(
          (toPlanet.energy * contractPrecision * toPlanet.defense) / 100
        ) /
        contractPrecision;
        
      return df_utils.formatNumber(arrival.energyArriving, 0) + ' energy attack will conquers your planet ' + df_utils.formatNumber(toPlanetEnergy, 0);
      
    }
  } else {
    // moving between my own planets
    return df_utils.formatNumber(arrival.energyArriving, 0) + ' energy moved ';
  }

};

const getPlanet = (id) => df_planets.getPlanet(id).then(response => {

  if (!response.data.errors) {

    const twitter_json = fs.readFileSync("./data/twitters.json");

    const secondsSinceEpoch = Date.now() / 1000;

    const planet = response.data.data.planet;
    if(!planet) return 'Sorry, planet error';

    let owner = planet.owner.id;

    twitter_parsed = JSON.parse(twitter_json);

    const twitter = twitter_parsed[owner]
    if (twitter !== undefined) {
      owner = '@'+twitter;
    } 

    let message = '*Planet info:*\n\n';

    message += '*'+df_utils.planetTypeToName(planet.planetType)+'* Level '+planet.planetLevel+' Rank '+df_utils.getPlanetRank([planet.defenseUpgrades,planet.rangeUpgrades,planet.speedUpgrades])+' \n';

    message += '*Energy:* ' + df_utils.formatNumber(df_utils.getEnergyAtTime(planet.energy / 1000, planet.energyGrowth / 1000, planet.energyCap / 1000, secondsSinceEpoch - planet.lastUpdated, planet.owner.id), 1)+' - ' + 
    df_utils.formatNumber(planet.energyCap / 1000) +' \n';      
      
    message += '*Silver:* ' + df_utils.formatNumber(df_utils.getSilverOverTime(planet.silver / 1000, planet.silverGrowth / 1000, planet.silverCap / 1000, secondsSinceEpoch - planet.lastUpdated, planet.owner.id), 0)+' - ' +
    df_utils.formatNumber(planet.silverCap / 1000, 0) +' \n';      
    
    message += '*Defense:* ' + df_utils.formatNumber(planet.defense, 0)+' - ';
    message += '*Speed:* ' + df_utils.formatNumber(planet.speed, 0)+' - ';
    message += '*Range:* ' + df_utils.formatNumber(planet.range, 0)+'\n';
  
    message += '*Location:* in '+planet.spaceType+', coords ';

    message += planet.revealer ? planet.x + ' , '+planet.y +'\n' : 'not revealed'+'\n';

    message += '*Owner:* '+owner+'\n';
    // console.log(planet.activatedArtifact, planet.artifacts)  //todo
      
    return df_utils.escapeMsg(message);

  } else {
    console.log(response.data.errors)
    return 'Sorry, server is not available';
  }
});

const getUsersTwitter = async () => {
  const twitters = await axios.get("https://api.zkga.me/twitter/all-twitters");
  fs.writeFileSync("data/twitters.json", JSON.stringify(twitters.data))
  return twitters;
};

const subscribeArrivals = async (id, chatId) => {
  
  let subscribers = fs.readFileSync("data/subscribe.json");
  subscribers = JSON.parse(subscribers);

  if(!subscribers.find((x) => x.id === id)) subscribers.push({id, chatId});
  
  fs.writeFileSync("data/subscribe.json", JSON.stringify(subscribers));

  return "Added";

};

const getLastSubgraphInfo = (id) => thegraph.getSubgraph(id).then(response => {
  if (!response.data.errors) {
    console.log(response.data.data.subgraph)

    const info = response.data.data.subgraph;
    const message = '*Subgraph:*\n\n' +
       `${info.displayName}, ${new Intl.DateTimeFormat('en').format(new Date(info.updatedAt))}`;

    console.log(message)
      
    return message;
  } else {
    console.log(response.data.errors)
    return 'Sorry, server is not available';
  }
});

const getLastSubgraphsInfo = () => thegraph.getSubgraphs().then(response => {
  if (!response.data.errors) {
    const message = '*Last deployed subgraphs:*\n\n' +
      response.data.data.communitySubgraphs.subgraphs.map(
        info => `${info.displayName} ${info.id}, ${new Intl.DateTimeFormat('en').format(new Date(info.deployedAt))}`
      ).join('\n');

    return message;
  }
  return 'Sorry, server is not available';
});

const getSubgraphsCountInfo = () => thegraph.getSubgraphsCount().then(response => {
  if (!response.data.errors) {
    return  '*Total deployed subgraphs:* ' + response.data.data.communitySubgraphs.totalCount;
  }
  return 'Sorry, server is not available';
}).catch((response) => console.log(response.data));


const getIndexersInfo = () => thegraph.getIndexers().then(response => {
  if (!response.data.errors) {

    const message = '*Indexers:*\n\n' +
      response.data.data.indexers.map(
        info => `[${info.id}](${info.url})\n` +
        `Owned: ${df_utils.abbreviateNumber(info.stakedTokens)} GRT\n` +
        `Fee cut: ${info.queryFeeCut / 10000}%\n` +
        `Reward cut: ${info.indexingRewardCut / 10000}%\n` +
        `Delegates: ${df_utils.abbreviateNumber(info.delegatedTokens)} GRT\n` +
        `Indexer Rewards: ${df_utils.abbreviateNumber(info.rewardsEarned)}\n`
      ).join('\n');

    return df_utils.escapeMsg(message);
  }
  return 'Sorry, server is not available';
});

const getGRTPiceInfo = () => thegraph.getGRTPrice().then(response => {
  if (!response.data.errors) {
    return '*Current GRT cost:* ' +  df_utils.escapeMsg(parseFloat(response.data.price).toFixed(5)) + ' USD';
  }
  return 'Sorry, server is not available';
});

module.exports = {
  getUsersTwitter: getUsersTwitter,
  userPlanets: userPlanets,
  lastArrivals: lastArrivals,
  getPlanet: getPlanet,
  subscribeArrivals: subscribeArrivals,
  getLastSubgraphInfo: getLastSubgraphInfo,
  getLastSubgraphsInfo: getLastSubgraphsInfo,
  getSubgraphsCountInfo: getSubgraphsCountInfo,
  getIndexersInfo: getIndexersInfo,
  getGRTPiceInfo: getGRTPiceInfo
}