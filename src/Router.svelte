<svelte:window on:popstate={handleBackNavigation} />
{#if $currentRoute && $currentRoute.layout}
      <svelte:component this={$currentRoute.layout.component} slots={$currentRoute.layout} />
{:else}
  {#if $currentRoute && $currentRoute.component}
    <svelte:component this={$currentRoute.component} />
  {:else}
    <div>Missing route definition for the current path</div>
  {/if}
{/if}

<script>
  import { currentRoute, mapUrlToRoute, storeRoutes } from "./router.js"
  import { onMount } from "svelte"
  export let routes
  storeRoutes(routes)
  onMount(() => {
    mapUrlToRoute(window.location.pathname + window.location.search, routes);
  });
  function handleBackNavigation(event) {
    mapUrlToRoute(event.state.path, routes)
  }
</script>