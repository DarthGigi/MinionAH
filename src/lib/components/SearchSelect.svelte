<script context="module" lang="ts">
  export enum SearchType {
    Minion = "Minion",
    User = "User"
  }
</script>

<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import ArrowRightLeft from "lucide-svelte/icons/arrow-right-left";
  import Pickaxe from "lucide-svelte/icons/pickaxe";
  import Users from "lucide-svelte/icons/users";
  import { createEventDispatcher } from "svelte";

  export let searchType: SearchType = SearchType.Minion;

  const dispatch = createEventDispatcher<{ onSelect: SearchType }>();
</script>

<Button
  variant="outline"
  class={cn("relative w-12 rounded-md rounded-l-none border-r border-input bg-background px-1.5 py-2 text-left text-muted-foreground shadow-sm hover:text-accent-foreground focus:z-10 focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm sm:leading-6")}
  aria-label="Reset search"
  on:click={() => {
    if (searchType !== SearchType.Minion) {
      searchType = SearchType.Minion;
      dispatch("onSelect", SearchType.Minion);
    } else {
      searchType = SearchType.User;
      dispatch("onSelect", SearchType.User);
    }
  }}>
  <ArrowRightLeft class="mr-1 size-4 opacity-50" />
  {#if searchType !== SearchType.Minion}
    <Pickaxe class="size-4 opacity-50" />
  {:else}
    <Users class="size-4 opacity-50" />
  {/if}
</Button>
