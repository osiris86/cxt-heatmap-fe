<script lang="ts">
  import { ApolloClient, InMemoryCache, ApolloProvider, gql, HttpLink, split } from '@apollo/client';
  import { getMainDefinition } from '@apollo/client/utilities';
  import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
  import { createClient } from 'graphql-ws';
  import { onMount } from 'svelte'
  import Router from 'svelte-spa-router'
  import routes from './routes'

  const httpLink = new HttpLink({
    uri: process.env.NODE_ENV === 'development' ? 'http://localhost:3000/graphql' : 'https://cxt-heatmap.suwes.uber.space/graphql'
  });

  const wsLink = new GraphQLWsLink(createClient({
    url: process.env.NODE_ENV === 'development' ? 'ws://localhost:3000/graphql' : 'wss://cxt-heatmap.suwes.uber.space/graphql',
  }));

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  );

  const client = new ApolloClient({  
    link: splitLink,
    cache: new InMemoryCache(),
  });

  let temps : {
    place: string,
    temperature: number,
    timestamp: Date
  }[] = []

  onMount(async () => {

    const res = await client
      .query({
        query: gql`
          query {
            currentTemperatureData {
              seat
              value
              timestamp
            }
          }
        `,
      })
    temps = res.data.currentTemperatureData.map((t: {seat: string, value: number, timestamp: Date}) => {
      return {
        place: t.seat,
        temperature: t.value,
        timestamp: t.timestamp
      }
    })

    const subscription = await client.subscribe({query: gql`
      subscription {
        seatDataChanged {
          seat
          value
          timestamp
        }
      }
    `})

    subscription.subscribe((update) => {
      const updatedData = update.data.seatDataChanged
      const index = temps.findIndex((t) => t.place === updatedData.seat)
      temps[index] = {
        place: updatedData.seat,
        temperature: updatedData.value,
        timestamp: updatedData.timestamp
      }
    })

  })
</script>
  
<Router {routes} />
