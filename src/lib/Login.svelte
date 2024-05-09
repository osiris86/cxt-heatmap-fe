<script lang="ts">
  let password = ""

  const onInput = (e: Event) => (password = (e.target as HTMLSelectElement).value);

  const onLoginClicked = () => {
    console.log("Login clicked")
    console.log(password)
  }
</script>

<h1>Login</h1>
<input value={password} on:input={onInput} type="password" />
<button on:click={onLoginClicked}>Login</button>