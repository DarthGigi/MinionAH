<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import * as Command from "$lib/components/ui/command";
  import * as Popover from "$lib/components/ui/popover";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { cn } from "$lib/utils";
  import Check from "lucide-svelte/icons/check";
  import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
  import SearchX from "lucide-svelte/icons/search-x";
  import { createEventDispatcher, tick } from "svelte";
  import { writable } from "svelte/store";

  type User = {
    id: string;
    username: string;
  };

  export let users: User[];
  export let search: string;
  export let showReset: boolean;
  export let variant: "rounded" | "half-rounded" = "rounded";

  const dispatch = createEventDispatcher<{ onSelect: User }>();

  const open = writable<boolean>(false);
  const value = writable<string>(search);

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger(triggerId: string) {
    open.set(false);

    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }
</script>

<Popover.Root bind:open={$open} let:ids>
  <Popover.Trigger asChild let:builder>
    <div class="flex items-center">
      <Button builders={[builder]} variant="outline" role="combobox" type="button" class={cn("relative w-40 cursor-default justify-between rounded-md border border-input bg-background py-1.5 pl-3 text-left shadow-sm focus:z-10 focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm sm:leading-6 md:w-44", !$value && "text-muted-foreground", $value && showReset && "rounded-r-none border-r-0", variant === "half-rounded" && "rounded-r-none border-r-0")} aria-label="Select a user" aria-haspopup="listbox" aria-expanded={$open}>
        <div class="flex">
          {#if users.find((f) => f.id === $value)}
            <Avatar.Root class="mr-2 size-6 flex-shrink-0 overflow-visible rounded-full">
              <Avatar.Image src={`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${users.find((f) => f.id === $value)?.id}`} alt={$value} class="pointer-events-none h-full w-full overflow-visible" />
              <Avatar.Fallback class="border-2 border-accent bg-accent text-xs uppercase">{users.find((f) => f.id === $value)?.username.slice(0, 2)}</Avatar.Fallback>
            </Avatar.Root>
            <span>
              {users.find((f) => f.id === $value)?.username}
            </span>
          {:else}
            <span>Select a user</span>
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
            dispatch("onSelect", { id: "", username: "" });
          }}
          aria-label="Reset search">
          <SearchX class="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      {/if}
    </div>
  </Popover.Trigger>
  <Popover.Content class="mt-1 w-[200] border border-border bg-popover p-0">
    <Command.Root class="max-h-56 overflow-hidden border-none bg-popover text-base sm:text-sm">
      <Command.Input autofocus placeholder="Search for a user" class="border-0 text-popover-foreground focus:shadow-none focus:outline-0 focus:ring-0" />
      <Command.Empty>No users found</Command.Empty>
      <Command.Group>
        <ScrollArea class="h-40 rounded-md">
          {#each users as user}
            <Command.Item
              value={user.username}
              onSelect={() => {
                value.set(user.id);
                dispatch("onSelect", user);
                closeAndFocusTrigger(ids.trigger);
              }}
              class="justify-between text-popover-foreground aria-selected:bg-background">
              <div class="inline-flex items-center">
                <Avatar.Root class="mr-2 size-6 flex-shrink-0 overflow-visible rounded-full">
                  <Avatar.Image src={`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${user.id}`} alt={user.username} class="pointer-events-none h-full w-full overflow-visible" />
                  <Avatar.Fallback class="border-2 border-accent bg-accent text-xs uppercase">{user.username.slice(0, 2)}</Avatar.Fallback>
                </Avatar.Root>
                <span>
                  {user.username}
                </span>
              </div>
              <Check class={cn("mr-2 h-4 w-4", $value !== user.id && "text-transparent")} />
            </Command.Item>
          {/each}
        </ScrollArea>
      </Command.Group>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
