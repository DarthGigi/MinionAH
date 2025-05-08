<script context="module" lang="ts">
  type DispatchEvents = { onSelect: { id: string; generator: string; maxTier: number | undefined }; onReset?: void };
</script>

<script lang="ts">
  import type { Minion } from "$generated/prisma";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import * as Command from "$lib/components/ui/command";
  import * as Popover from "$lib/components/ui/popover";
  import { cn } from "$lib/utils";
  import Check from "lucide-svelte/icons/check";
  import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
  import SearchX from "lucide-svelte/icons/search-x";
  import { createEventDispatcher, tick } from "svelte";
  import VirtualList from "svelte-tiny-virtual-list";
  import { writable } from "svelte/store";

  type MinionType = Pick<Minion, "id" | "generator" | "maxTier">;

  export let minionTypes: MinionType[];
  export let search: string = "";
  export let showReset: boolean;
  export let variant: "rounded" | "half-rounded" = "rounded";

  const dispatch = createEventDispatcher<DispatchEvents>();

  const open = writable<boolean>(false);
  const value = writable<string>(search);

  const searchStore = writable<string>("");
  const filteredMinions = writable<MinionType[]>(minionTypes);

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger(triggerId: string) {
    open.set(false);
    searchStore.set("");

    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }

  searchStore.subscribe(async (searchQuery) => {
    filteredMinions.set(minionTypes.filter((f) => f.generator.toLowerCase().includes(searchQuery.toLowerCase())));
  });
</script>

<Popover.Root bind:open={$open} let:ids>
  <Popover.Trigger asChild let:builder>
    <div class="flex items-center">
      <Button builders={[builder]} variant="outline" role="combobox" type="button" class={cn("relative w-40 cursor-default justify-between rounded-md border border-input bg-background py-1.5 pl-3 text-left shadow-sm focus:z-10 focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm sm:leading-6 md:w-44", !$value && "text-muted-foreground", $value && showReset && "rounded-r-none border-r-0", variant === "half-rounded" && "rounded-r-none border-r-0")} aria-label="Select a minion" aria-haspopup="listbox" aria-expanded={$open}>
        <div class="flex">
          {#if minionTypes.find((f) => f.generator === $value)}
            <Avatar.Root class="mr-2 size-6 flex-shrink-0 overflow-visible rounded-full">
              <Avatar.Image src={`https://res.cloudinary.com/minionah/image/upload/v1/minions/head/${minionTypes.find((f) => f.generator === $value)?.id}`} alt={$value} class="pointer-events-none h-full w-full overflow-visible" />
              <Avatar.Fallback class="border-2 border-accent bg-accent text-xs uppercase">{$value.slice(0, 2)}</Avatar.Fallback>
            </Avatar.Root>
            <span class="capitalize">
              {minionTypes
                .find((f) => f.generator === $value)
                ?.generator.replace(/_/g, " ")
                .toLowerCase()
                .charAt(0) + $value.slice(1).toLowerCase().replace(/_/g, " ")}
            </span>
          {:else}
            <span>Select a minion</span>
          {/if}
        </div>
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {#if $value && showReset}
        <Button
          variant="outline"
          class={cn("relative rounded-md rounded-l-none border-r border-input bg-background py-1.5 pl-3 text-left shadow-sm focus:z-10 focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm sm:leading-6")}
          on:click={() => {
            value.set("");
            dispatch("onReset");
          }}
          aria-label="Reset search">
          <SearchX class="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      {/if}
    </div>
  </Popover.Trigger>
  <Popover.Content class="mt-1 border border-border bg-popover p-0">
    <Command.Root class="max-h-56 overflow-hidden border-none bg-popover text-base sm:text-sm" shouldFilter={false}>
      <Command.Input autofocus placeholder="Search for a minion" class="border-0 text-popover-foreground focus:shadow-none focus:outline-0 focus:ring-0" bind:value={$searchStore} />
      <Command.Empty>No minions found</Command.Empty>
      <Command.Group asChild>
        <VirtualList height={$filteredMinions.length > 0 ? 168 : 0} width="100%" itemCount={$filteredMinions.length} itemSize={$filteredMinions.length > 0 ? 36 : 0} scrollDirection="vertical" overscanCount={3}>
          <Command.Item
            slot="item"
            let:index
            let:style
            {style}
            value={$filteredMinions[index].generator}
            onSelect={() => {
              value.set($filteredMinions[index].generator);
              dispatch("onSelect", $filteredMinions[index]);
              closeAndFocusTrigger(ids.trigger);
            }}
            class="justify-between text-popover-foreground aria-selected:bg-background">
            <div class="inline-flex items-center">
              <Avatar.Root class="mr-2 size-6 flex-shrink-0 overflow-visible rounded-full">
                <Avatar.Image src={`https://res.cloudinary.com/minionah/image/upload/v1/minions/head/${$filteredMinions[index].id}`} alt={$filteredMinions[index].generator} class="pointer-events-none h-full w-full overflow-visible" />
                <Avatar.Fallback class="border-2 border-accent bg-accent text-xs">{$filteredMinions[index].generator.slice(0, 2).toUpperCase()}</Avatar.Fallback>
              </Avatar.Root>
              <span class="capitalize">
                {$filteredMinions[index].generator.replace(/_/g, " ").toLowerCase()}
              </span>
            </div>
            <Check class={cn("mr-2 h-4 w-4", $value !== $filteredMinions[index].generator && "text-transparent")} />
          </Command.Item>
        </VirtualList>
      </Command.Group>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
