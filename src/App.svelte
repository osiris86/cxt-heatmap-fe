<script lang="ts">
  import { ApolloClient, InMemoryCache, ApolloProvider, gql, HttpLink, split } from '@apollo/client';
  import { getMainDefinition } from '@apollo/client/utilities';
  import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
  import { createClient } from 'graphql-ws';
  import { onMount } from 'svelte'
  import Router from 'svelte-spa-router'
  import routes from './routes'
</script>
  
<Router {routes} />
