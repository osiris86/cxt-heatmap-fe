<script lang="ts">
  import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
  import { onMount } from 'svelte'
  import { push } from 'svelte-spa-router'
  import { createApolloClient } from './createApolloClient'

  let configElements : {id: string, seat: string}[] = []
  let newId = ""
  let newSeat = ""
  let newNetatmoToken = ""

  const client = createApolloClient();

  const onNewIdChanged = (e: Event) => (newId = (e.target as HTMLSelectElement).value);
  const onNewSeatChanged = (e: Event) => (newSeat = (e.target as HTMLSelectElement).value);
  const onNewNetatmoTokenChanged = (e: Event) => (newNetatmoToken = (e.target as HTMLSelectElement).value)
  
  const onAddClicked = async () => {
    try {
      const resp = await client.mutate({
        mutation: gql`
          mutation {
            addConfigElement(seat:"${newSeat}", id:"${newId}") {
              id, 
              seat
            }
          }
        `,
        context: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`
          }
        }
      })

      configElements = resp.data.addConfigElement
      newId = ""
      newSeat = ""
    } catch (e) {
      console.error(e)
      push('/login')
    }
  }

  const onDeleteClicked = async (elementId: String) => {
    try {
      const resp = await client.mutate({
        mutation: gql`
          mutation {
            removeConfigElement(id:"${elementId}") {
              id, 
              seat
            }
          }
        `,
        context: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`
          }
        }
      })

      configElements = resp.data.removeConfigElement
    } catch (e) {
      console.error(e)
      push('/login')
    }
  };

  const onNetatmoSaveClicked = async () => {
    try {
      await client.mutate({
        mutation: gql`
          mutation {
            setNetatmoRefreshToken(token:"${newNetatmoToken}") 
          }
        `,
        context: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`
          }
        }
      })

      newNetatmoToken = ""
    } catch (e) {
      console.error(e)
      push('/login')
    }
  }

  onMount(async () => {
    let jwt = localStorage.getItem("jwt")
    if (!jwt) {
      push('/login')
    }

    try {
      const resp = await client.query({
        query: gql`
          query {
            currentConfig {id, seat}
          }
        `,
        context: {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        }
      })

      configElements = resp.data.currentConfig
    } catch (e) {
      console.error(e)
      push('/login')
    }
	});
</script>

<h1>Config</h1>

<h2>Netatmo Refresh Token</h2>
<input value={newNetatmoToken} type="text" placeholder="Refresh Token" on:input={onNewNetatmoTokenChanged} />
<button on:click={onNetatmoSaveClicked}>Save</button>

<h2>Seat Configuration</h2>
<input value={newId} type="text" placeholder="Id" on:input={onNewIdChanged} />
<input value={newSeat} type="text" placeholder="Seat" on:input={onNewSeatChanged} />
<button on:click={onAddClicked}>Add</button>

{#each configElements as element}
  <p>{element.id} - {element.seat} <button on:click={() => onDeleteClicked(element.id)}>Delete</button></p>
{/each}