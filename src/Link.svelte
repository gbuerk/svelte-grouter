<script>
  import { currentRoute, navigateTo } from "./router.js";
  export let route
  export let params
  export let activeClass = 'active'
  function navigate(event) {
    navigateTo(route, params)
  }
</script>

<a href={route.path} class={$currentRoute === route ? activeClass : ''} on:click|preventDefault={navigate}><slot/></a>