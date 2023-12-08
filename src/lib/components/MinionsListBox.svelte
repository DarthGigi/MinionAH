<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Command from "$lib/components/ui/command";
  import { Label } from "$lib/components/ui/label";
  import * as Popover from "$lib/components/ui/popover";
  import { cn } from "$lib/utils";
  import { Check, ChevronsUpDown } from "lucide-svelte";
  import { tick } from "svelte";

  export let minionType: { generator: string; texture: string }[];

  let open = false;
  let value = "";
  $: selectedValue = minionType.find((f) => f.generator === value)?.generator ?? "Select a minion";
  $: selectedTexture = minionType.find((f) => f.generator === value)?.texture ?? null;
  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger(triggerId: string) {
    open = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }
</script>

<input type="hidden" name="minionType" bind:value={selectedValue} />
<Popover.Root bind:open let:ids>
  <Popover.Trigger id="minionListBox" asChild let:builder>
    <Label for="minionListBox" class="block text-base font-normal">Minion</Label>
    <Button builders={[builder]} variant="outline" role="combobox" aria-expanded={open} class="relative w-40 cursor-default justify-between rounded-md border-none bg-neutral-700 py-1.5 pl-3 text-left text-neutral-200 shadow-sm ring-1 ring-inset ring-transparent hover:bg-neutral-600 hover:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 sm:text-sm sm:leading-6 md:w-44">
      <div class="flex">
        {#if selectedTexture !== null}
          <img loading="lazy" src={`data:image/png;base64,${selectedTexture}`} class="mr-2 h-6 w-6" alt={selectedValue} />
        {/if}
        <span class:capitalize={selectedValue !== "Select a minion"} class:font-normal={selectedValue === "Select a minion"}>
          {#if selectedValue !== "Select a minion"}
            {selectedValue.replace(/_/g, " ").toLowerCase().charAt(0) + selectedValue.slice(1).toLowerCase().replace(/_/g, " ")}
          {:else}
            Select a minion
          {/if}
        </span>
      </div>
      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  </Popover.Trigger>
  <Popover.Content class="mt-1 w-[200] border-2 border-neutral-600 bg-neutral-700 p-0">
    <Command.Root class="max-h-56 overflow-hidden border-none bg-neutral-700 text-base sm:text-sm">
      <Command.Input placeholder="Search minion" class="border-none border-green-500 text-neutral-200 focus:shadow-none focus:outline-0 focus:ring-0" />
      <Command.Empty>No minion found.</Command.Empty>
      <Command.Group class="overflow-scroll">
        {#each minionType as minionType}
          <Command.Item
            value={minionType.generator}
            onSelect={(currentValue) => {
              value = currentValue;
              closeAndFocusTrigger(ids.trigger);
            }}
            class="text-neutral-200 aria-selected:bg-neutral-800 aria-selected:text-neutral-300"
          >
            <Check class={cn("mr-2 h-4 w-4", value !== minionType.generator && "text-transparent")} />
            <img src={`data:image/png;base64,${minionType.texture}`} class="mr-2 h-6 w-6" alt={minionType.generator} />
            <span class="capitalize">
              {minionType.generator.replace(/_/g, " ").toLowerCase().charAt(0).toUpperCase() + minionType.generator.slice(1).toLowerCase().replace(/_/g, " ")}
            </span>
          </Command.Item>
        {/each}
      </Command.Group>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
