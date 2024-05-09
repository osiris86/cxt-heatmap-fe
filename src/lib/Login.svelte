<script lang="ts">
  import { ApolloClient, InMemoryCache, gql } from "@apollo/client"
  import {push} from 'svelte-spa-router'

  let password = ""
  let loginError = false

  const onInput = (e: Event) => (password = (e.target as HTMLSelectElement).value);

  const onLoginClicked = async () => {
    loginError = false
    console.log("Login clicked")
    const client = new ApolloClient({  
      cache: new InMemoryCache(),
      uri: "http://localhost:3000/graphql"
    });
    try {
      const resp = await client.mutate({
        mutation: gql`
          mutation {
            login(password: "${password}")
          }
        `
      })
      localStorage.setItem("jwt", resp.data.login)
      push("/config")
    } catch (e) {
      console.log("Login failed")
      loginError = true
    }
  }
</script>

<h1>Login</h1>
<input value={password} on:input={onInput} type="password" />
<button on:click={onLoginClicked}>Login</button>
{#if loginError}
  <p>Fehler beim Login.</p>
{/if}