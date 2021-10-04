//! Paged query to download all arrivals at v05 game end and write to a json
//! file. Takes a few minutes sadly.

const axios = require('axios');
const fs = require('fs');

const config = require('../config.json');

const getXArrivals = async (departureTime) => {

    let arrivals = [];
    let lastID = "";
    while (true) {

        const body = {
            operationName: "getAllArrivals",
            query: `
                query getAllArrivals($departureTime: Int, $lastID: String!) {
                    arrivals( first: 1000, where: { departureTime_gt: $departureTime, id_gt: $lastID }) {
                        id 
                        player{id}
                        energyArriving: milliEnergyArriving
                        silverMoved: milliSilverMoved
                        departureTime
                        arrivalTime
                        arrivalType
                        distance
                        carriedArtifact
                        arrived
                
                        fromPlanet {
                            id
                            owner{ id }
                
                            energyCap: milliEnergyCap
                            energyGrowth: milliEnergyGrowth
                            energy: milliEnergyLazy
                
                            defense
                            lastUpdated
                        }
                        toPlanet {
                            id
                            owner{ id }
                
                            energyCap: milliEnergyCap
                            energyGrowth: milliEnergyGrowth
                            energy: milliEnergyLazy
                
                            defense
                            lastUpdated

                            planetLevel
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
            variables: {
                lastID,
                departureTime
            }
        };

        const result = await axios.post(config.GRAPH_URL, JSON.stringify(body));

        // todo if hasIndexingErrors is true might want to not use that data until it shakes out, or notify someone or something
        if (result && result.data && result.data.data && result.data.data.arrivals) {

            if (result.data.data._meta.hasIndexingErrors) {
                throw 'graph not synced';
            }

            arrivals = [...arrivals, ...result.data.data.arrivals];

            console.log(result.data.data.arrivals.length, ' arrivals');

            if (result.data.data.arrivals < 1000) { return arrivals; }

        } else {
            // is reason working?
            let reason = "";
            if (result && result.data && result.data.errors) {
                reason = result.data.errors;
            }
            throw 'query problem' + '';
        }

        // todo I dont know what the limit is
        await new Promise(resolve => setTimeout(resolve, 100));
        lastID = arrivals[arrivals.length - 1].id;
    }

}

const getLastArrivals = async (epoch) => {

    const arrivals = await getXArrivals(epoch);

    let attacks = [];

    let subscribers = fs.readFileSync("data/subscribe.json");
    subscribers = JSON.parse(subscribers);

    arrivals.map(arrival => {

        let subscriber = subscribers.find((s) => s.id == arrival.toPlanet.owner.id && s.id != arrival.player.id)

        if(subscriber) { // only attack 
            attacks.push({arrival, subscriber});
        }

    })

    return attacks;

}

module.exports = {
    getLastArrivals: getLastArrivals
}