<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Command from "$lib/components/ui/command";
  import * as Form from "$lib/components/ui/form";
  import * as Popover from "$lib/components/ui/popover";
  import { cn } from "$lib/utils";
  import { Check, ChevronsUpDown } from "lucide-svelte";
  import { createEventDispatcher, tick } from "svelte";

  export let minionType: { id: string; generator: string; texture: string; maxTier: number }[];
  export let config: any;

  const dispatch = createEventDispatcher();

  let open = false;

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

<Form.Field {config} name="type" let:setValue let:value>
  <Form.Item class="flex flex-col">
    <Form.Label>Minion</Form.Label>
    <Popover.Root bind:open let:ids>
      <Popover.Trigger asChild let:builder>
        <Form.Control id={ids.trigger} let:attrs>
          <Button builders={[builder]} {...attrs} variant="outline" role="combobox" type="button" class={cn("relative w-40 cursor-default justify-between rounded-md border-none bg-accent py-1.5 pl-3 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm sm:leading-6 md:w-44", !value && "text-muted-foreground")} aria-label="Select a minion" aria-haspopup="listbox" aria-expanded={open}>
            <div class="flex">
              {#if minionType.find((f) => f.generator === value)}
                <img loading="lazy" src={`data:image/png;base64,${minionType.find((f) => f.generator === value)?.texture}`} class="mr-2 h-6 w-6" alt={value} />
                <span class="capitalize">
                  {minionType
                    .find((f) => f.generator === value)
                    ?.generator.replace(/_/g, " ")
                    .toLowerCase()
                    .charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ")}
                </span>
              {:else}
                <span>Select a minion</span>
              {/if}
            </div>
            <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </Form.Control>
      </Popover.Trigger>
      <Popover.Content class="mt-1 w-[200] border border-border bg-popover p-0">
        <Command.Root class="max-h-56 overflow-hidden border-none bg-popover text-base sm:text-sm">
          <Command.Input autofocus placeholder="Search minion" class="border-0 text-popover-foreground focus:shadow-none focus:outline-0 focus:ring-0" />
          <Command.Empty>No minion found.</Command.Empty>
          <Command.Group class="overflow-y-auto overflow-x-clip">
            {#each minionType as minionType}
              <Command.Item
                value={minionType.generator}
                onSelect={() => {
                  setValue(minionType.generator);
                  dispatch("onSelect", minionType.maxTier);
                  closeAndFocusTrigger(ids.trigger);
                }}
                class="justify-between text-popover-foreground aria-selected:bg-background">
                <div class="inline-flex items-center">
                  <img src={`data:image/png;base64,${minionType.texture}`} class="mr-2 h-6 w-6" alt={minionType.generator} />
                  <span class="capitalize">
                    {minionType.generator.replace(/_/g, " ").toLowerCase().charAt(0).toUpperCase() + minionType.generator.slice(1).toLowerCase().replace(/_/g, " ")}
                  </span>
                </div>
                <Check class={cn("mr-2 h-4 w-4", value !== minionType.generator && "text-transparent")} />
              </Command.Item>
            {/each}
          </Command.Group>
        </Command.Root>
      </Popover.Content>
    </Popover.Root>
    <Form.Validation class="w-40 md:w-44" />
  </Form.Item>
</Form.Field>
