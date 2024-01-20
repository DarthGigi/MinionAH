<script lang="ts">
  import { page } from "$app/stores";
  import { Button } from "$lib/components/ui/button";
  import { draw } from "svelte/transition";
  const isHome = $page.url.pathname === "/";
  let copied = false;
</script>

<Button
  class={`group h-auto rounded-lg !border-0 bg-accent bg-opacity-0 p-1.5 text-sm text-muted-foreground transition-all duration-300 hover:bg-accent hover:bg-opacity-100 hover:opacity-100 focus:outline-none focus:ring-0 focus:ring-transparent group-hover:opacity-100 ${$$props.class} ${isHome ? "opacity-0" : "bg-opacity-100"}`}
  type="button"
  aria-label="Copy link"
  on:click={() => {
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }}
  on:click>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-share-2 h-5 w-5 transition-colors" class:text-green-400={copied} class:group-hover:text-white={!copied} class:delay-500={copied}>
    {#if !copied}
      <circle in:draw={{ duration: 500, delay: 500 }} out:draw={{ duration: 500 }} cx="18" cy="5" r="3" />
      <circle in:draw={{ duration: 500, delay: 500 }} out:draw={{ duration: 500 }} cx="6" cy="12" r="3" />
      <circle in:draw={{ duration: 500, delay: 500 }} out:draw={{ duration: 500 }} cx="18" cy="19" r="3" />
      <line in:draw={{ duration: 500, delay: 500 }} out:draw={{ duration: 500 }} x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line in:draw={{ duration: 500, delay: 500 }} out:draw={{ duration: 500 }} x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    {:else}
      <circle in:draw={{ duration: 500, delay: 500 }} out:draw={{ duration: 500 }} cx="12" cy="12" r="10" />
      <path in:draw={{ duration: 500, delay: 500 }} out:draw={{ duration: 500 }} d="m9 12 2 2 4-4" />
    {/if}
  </svg>
</Button>
