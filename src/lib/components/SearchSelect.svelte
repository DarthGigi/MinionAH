<script context="module" lang="ts">
  export enum SearchType {
    Minion = "Minion",
    User = "User"
  }
</script>

<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { cn } from "$lib/utils";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import { createEventDispatcher } from "svelte";
  import Pickaxe from "lucide-svelte/icons/pickaxe";
  import Users from "lucide-svelte/icons/users";

  export let searchType: SearchType = SearchType.Minion;

  const dispatch = createEventDispatcher<{ onSelect: SearchType }>();
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild let:builder>
    <Button builders={[builder]} variant="outline" class={cn("relative w-12 rounded-md rounded-l-none border-r border-input bg-background py-1.5 text-left shadow-sm focus:z-10 focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm sm:leading-6")} aria-label="Reset search">
      <ChevronDown class="h-4 w-4 shrink-0 opacity-50" />
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="rounded-md border-input bg-background">
    <DropdownMenu.Group class="text-muted-foreground">
      <DropdownMenu.Label>Search for</DropdownMenu.Label>
      {#if searchType !== SearchType.Minion}
        <DropdownMenu.Item
          class="transition-colors hover:bg-accent hover:text-accent-foreground"
          on:click={() => {
            searchType = SearchType.Minion;
            dispatch("onSelect", SearchType.Minion);
          }}>
          <Pickaxe class="mr-1 size-4" /> Minions
        </DropdownMenu.Item>
      {:else}
        <DropdownMenu.Item
          class="transition-colors hover:bg-accent hover:text-accent-foreground"
          on:click={() => {
            searchType = SearchType.User;
            dispatch("onSelect", SearchType.User);
          }}>
          <Users class="mr-1 size-4" /> Users
        </DropdownMenu.Item>
      {/if}
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
