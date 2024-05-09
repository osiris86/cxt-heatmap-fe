<script lang="ts">
  import { gql } from "@apollo/client"
  import {push} from 'svelte-spa-router'
  import { createApolloClient } from "./createApolloClient"

  let password = ""
  let loginError = false

  const client = createApolloClient();
  const onInput = (e: Event) => (password = (e.target as HTMLSelectElement).value);

  const onLoginClicked = async () => {
    loginError = false
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
