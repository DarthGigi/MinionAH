<script lang="ts">
  import { draw } from "svelte/transition";
  export let isHome = false;
  let copied = false;
</script>

<button
  class={`group rounded-lg !border-0 bg-neutral-700 bg-opacity-0 p-1.5 text-sm text-neutral-400 transition-all duration-300 hover:bg-opacity-100 focus:outline-none focus:ring-0 focus:ring-transparent group-hover:opacity-100 ${$$props.class}`}
  class:opacity-0={isHome}
  class:!bg-opacity-100={!isHome}
  type="button"
  on:click={() => {
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }}
  on:click
>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 transition-colors duration-300" class:text-green-400={copied} class:group-hover:text-white={!copied} class:delay-500={copied}>
    {#if !copied}
      <path in:draw={{ duration: 500, delay: 500 }} out:draw={{ duration: 500 }} stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    {:else}
      <path in:draw={{ duration: 500, delay: 500 }} out:draw={{ duration: 500 }} stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    {/if}
  </svg>
</button>
