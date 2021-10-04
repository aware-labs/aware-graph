const axios = require('axios');

const config = require('../config.json');

const getArtifacts = async (owner) => {

    const result = await axios.post(config.GRAPH_URL, JSON.stringify({
        operationName: "getArtifacts",
        query: `query getArtifacts ($owner: String) {
            artifacts (first: 1000, where: {discoverer: $owner}) {
                id
                energyCapMultiplier
                energyGrowthMultiplier
                rangeMultiplier
                speedMultiplier
                defenseMultiplier

                rarity
                artifactType

                planetBiome

                onPlanet {
                    id
                }
              }
              _meta {
                hasIndexingErrors
                block {
                  number
                  hash
                }
            }
        }`,
        variables: {
            //lastID,
            owner
        }
    }));

    // todo if hasIndexingErrors is true might want to not use that data until it shakes out, or notify someone or something
    if (result && result.data && result.data.data && result.data.data.artifacts) {

        if (result.data.data._meta.hasIndexingErrors) {
            throw 'graph not synced';
        }

        return result.data.data.artifacts;

    } else {
        console.log(result.data)
        // is reason working?
        let reason = "";
        if (result && result.data && result.data.errors) {
            reason = result.data.errors;
        }
        throw 'query problem' + '';
    }

}

const getUserArtifacts = async (id) => {
    const artifacts = await getArtifacts(id);
    const artifact_COMMON = [];
    const artifact_RARE = [];
    const artifact_EPIC = [];
    const artifact_LEGENDARY = [];

    artifacts
        .forEach(a => {

            if(a.rarity==="COMMON") artifact_COMMON.push(a);
            else if(a.rarity==="RARE") artifact_RARE.push(a);
            else if(a.rarity==="EPIC") artifact_EPIC.push(a);
            else if(a.rarity==="LEGENDARY") artifact_LEGENDARY.push(a);

        });

    let message = artifacts.length + ' *artifacts:*\n\n';
    message += artifact_COMMON.length +' *COMMON* \n';
    message += artifact_RARE.length +' *RARE* \n';
    message += artifact_EPIC.length +' *EPIC* \n';
    message += artifact_LEGENDARY.length +' *LEGENDARY* \n';

    console.log(message)

}


getUserArtifacts ("0x1f3440cda4bdd6f22aac145e24d604cf05f3cc3b");

module.exports = {
    getUserArtifacts: getUserArtifacts
}