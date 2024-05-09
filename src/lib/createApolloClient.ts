import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'

export const createApolloClient = () => {
  const currentHost = window.location.host
  const currentProtocol = window.location.protocol

  const wsProtocol = currentProtocol === 'https:' ? 'wss' : 'ws'

  const httpLink = new HttpLink({
    uri:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/graphql'
        : currentProtocol + '//' + currentHost + '/graphql'
  })

  const wsLink = new GraphQLWsLink(
    createClient({
      url:
        process.env.NODE_ENV === 'development'
          ? 'ws://localhost:3000/graphql'
          : wsProtocol + '//' + currentHost + '/graphql'
    })
  )

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    wsLink,
    httpLink
  )

  const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache()
  })

  return client
}
