const axios = require('axios').default;

//https://github.com/graphprotocol/graph-network-subgraph/blob/master/schema.graphql
const getSubgraph = (id) => axios.post('https://gateway.network.thegraph.com/network', {
  operationName: "subgraph", // owner currentVersion
  query: `query subgraph($id: String) {
      subgraph(id: $id) {
        id
        
        displayName
        createdAt
        updatedAt

        description
        image
        codeRepository
        website

        reserveRatio
        
        __typename
      }
        
  }`,
  variables: {id},
})

const getSubgraphs2222 = () => axios.post('https://api.thegraph.com/explorer/graphql', {
    operationName: "communitySubgraphs",
    query: `
        query communitySubgraphs($where: whereee, $first: Int!, $skip: Int!, $searchText: String, $order: CommunitySubgraphsOrder, $filter: CommunitySubgraphsFilter) {
          communitySubgraphs(where: $where, first: $first, skip: $skip, searchText: $searchText, order: $order, filter: $filter) {
            subgraphs {
              id
              name
              displayName
              draft
              featured
              createdAt
              deployedAt
              __typename
            }
            totalCount
            __typename
         }
        }`,
    variables: {where: "QmfCPm5ixpVVcS5Qd45BMMc3JVXoqkaYZLQLCgg4YFe8e7", first: 5, skip: 0, searchText: "", order: "RecentlyUpdated", filter: "Deployed"},
  })

const getSubgraphs = () => axios.post('https://api.thegraph.com/explorer/graphql', {
    operationName: "communitySubgraphs",
    query: `
        query communitySubgraphs($first: Int!, $skip: Int!, $searchText: String, $order: CommunitySubgraphsOrder, $filter: CommunitySubgraphsFilter) {
          communitySubgraphs(first: $first, skip: $skip, searchText: $searchText, order: $order, filter: $filter) {
            subgraphs {
              id
              name
              displayName
              draft
              featured
              createdAt
              deployedAt
              __typename
            }
            totalCount
            __typename
         }
        }`,
    variables: {first: 5, skip: 0, searchText: "", order: "RecentlyUpdated", filter: "Deployed"},
  })

const getIndexers = () => axios.post('https://gateway.network.thegraph.com/network', {
  operationName: "indexers",
  query: `query indexers($orderBy: Indexer_orderBy, $orderDirection: OrderDirection, $first: Int, $skip: Int, $where: Indexer_filter) {
      indexers(orderBy: $orderBy, orderDirection: $orderDirection, first: $first, skip: $skip, where: $where) {
        id
        createdAt
        account {
         id
         defaultName {
            id
            name
            __typename
          }
          image
          __typename
         }
        defaultDisplayName
        delegatorParameterCooldown
        delegators {
          id  
          delegator {
            id
            account {
              id
              defaultName {
                id
                name
                __typename
              }
              image
              __typename
            }
            __typename
          }
          stakedTokens
          unstakedTokens
          shareAmount
          lockedTokens
          lockedUntil
          __typename
        }
        allocations(first: 1000, orderBy: allocatedTokens, orderDirection: desc, where: {status: Active}) {
          subgraphDeployment {
            id
            versions(orderBy: createdAt, orderDirection: desc, first: 1) {
              id
              subgraph {
                id
                image
                displayName
                __typename
              }
              __typename
            }
            __typename
          }
          __typename
        }
        stakedTokens
        delegatedTokens
        delegationExchangeRate
        queryFeeCut
        indexingRewardCut
        queryFeesCollected
        rewardsEarned
        url
        __typename
      }
  }
  `,
  variables: {orderBy: "stakedTokens", orderDirection: "desc", first: 20, skip: 0, where: {stakedTokens_not: "0"}},
})

const getSubgraphsCount = () => axios.post('https://api.thegraph.com/explorer/graphql', {
  operationName: "communitySubgraphs",
  query: `
        query communitySubgraphs($first: Int!, $skip: Int!, $searchText: String, $order: CommunitySubgraphsOrder, $filter: CommunitySubgraphsFilter) {
          communitySubgraphs(first: $first, skip: $skip, searchText: $searchText, order: $order, filter: $filter) {
            totalCount
            __typename
         }
        }`,
  variables: {first: 0, skip: 0, searchText: "", order: "RecentlyUpdated", filter: "Deployed"},
})

const getGRTPrice = () => axios.get('https://www.binance.com/api/v3/ticker/price', {
  params: {
    symbol: 'GRTUSDT'
  }
});

module.exports = {
  getSubgraphs: getSubgraphs,
  getSubgraph: getSubgraph,
  getSubgraphsCount: getSubgraphsCount,
  getGRTPrice: getGRTPrice,
  getIndexers: getIndexers
}