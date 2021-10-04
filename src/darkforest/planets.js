const axios = require('axios');
const fs = require('fs');

const config = require('../config.json');

const getPlanet = async (id) => {

  const result = await axios.post(config.GRAPH_URL, {
    operationName: "getPlanet",
    query: `
        query getPlanet($id: String) {
            planet(id: $id) {
              id
              owner{ id }

              planetLevel
              planetType
              spaceType

              isHomePlanet
              isRevealed
              revealer
              x
              y
              energy: milliEnergyLazy
              energyCap: milliEnergyCap
              energyGrowth: milliEnergyGrowth
              silver: milliSilverLazy
              silverCap: milliSilverCap
              silverGrowth: milliSilverGrowth
              lastUpdated 

              range
              speed
              defense

              defenseUpgrades
              rangeUpgrades
              speedUpgrades

              isEnergyGrowthBoosted
              isEnergyCapBoosted

              activatedArtifact {

                energyCapMultiplier
                energyGrowthMultiplier
                rangeMultiplier
                speedMultiplier
                defenseMultiplier

                rarity
                artifactType

              }
              artifacts {
                energyCapMultiplier
                energyGrowthMultiplier
                rangeMultiplier
                speedMultiplier
                defenseMultiplier

                rarity
                artifactType
              }

              
            }

            _meta{
              hasIndexingErrors
              block{
                number
                hash
              }
            }
        }`,
    variables: {id}
  });

  return result;



}

const getPlanets = async (owner) => {

  let planets = [];
  let lastID = "";

  while (true) {

      const result = await axios.post(config.GRAPH_URL, {
        operationName: "getPlanets",
        query: `
            query getPlanets($owner: String, $lastID: String!) {
                planets(first: 1000, where: {owner: $owner, id_gt: $lastID}) {
                  id              
                  x
                  y
                  lastUpdated
                }
    
                _meta{
                  hasIndexingErrors
                  block{
                    number
                    hash
                  }
                }
            }`,          
        variables: {
            lastID,
            owner
        }
      });

      // todo if hasIndexingErrors is true might want to not use that data until it shakes out, or notify someone or something
      if (result && result.data && result.data.data && result.data.data.planets) {

          if (result.data.data._meta.hasIndexingErrors) {
              console.log("graph not synced")
              return {error: "graph not synced"};
          }

          console.log(result.data.data.planets.length, ' planets');

          planets = [...planets, ...result.data.data.planets];
          if (result.data.data.planets < 1000) { 
            return planets; 
          }

      } else {
          //console.log(result.data)
          // is reason working?
          let reason = "";
          if (result && result.data && result.data.errors) {
              reason = result.data.errors;
          }
          console.log(reason)
          return {error: "db error"};
      }

      // todo I dont know what the limit is
      await new Promise(resolve => setTimeout(resolve, 100));
      lastID = planets[planets.length - 1].id;
  }

}

const getUserPlanets = async (owner) => {

  let planetsId = [];

  const planets = await getPlanets(owner); // get actual planets
  const planets_count = planets.length;

  if (planets.error || planets_count==0) return {error: "user id error"};

  let planets_lost = [];
  let planets_lost_count = 0;

  let planets_exist = 0;
  let planets_new_count = 0;

  planets.map(p => planetsId.push(p.id)); // save planets Id only
  
  var fileContents;
  try {
    fileContents = fs.readFileSync("data/"+owner+".json");
  } catch (err) {
    fs.writeFileSync("data/"+owner+".json", JSON.stringify(planetsId))
    return {planets_count, date: new Date()}
  }

  let rawdata = JSON.parse(fileContents);
  rawdata
    .map(p => {

        if(planets.some((x) => x.id === p)) { //compare
          planets_exist++;
        } else {
          planets_lost.push({id: p })
          planets_lost_count++;
        }

        return p;

    })

  planets_new_count = planets_count - planets_exist;
      
  if(planets_new_count!=0 || planets_lost_count!=0) fs.writeFileSync("data/"+owner+".json", JSON.stringify(planetsId))

  return {planets_lost, planets_lost_count, planets_new_count, planets_count, date: new Date()};
  
}

module.exports = {
  getPlanets: getPlanets,
  getPlanet: getPlanet,
  getUserPlanets: getUserPlanets
}