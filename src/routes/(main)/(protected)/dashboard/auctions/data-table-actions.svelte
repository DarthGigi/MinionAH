<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { CircleEllipsis, Copy, Eye, Trash2 } from "lucide-svelte";
  export let id: string;
  export let username: string;
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild let:builder>
    <Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
      <span class="sr-only">Open menu</span>
      <CircleEllipsis class="h-5 w-5" />
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="border-border bg-popover text-popover-foreground">
    <DropdownMenu.Label>{username}</DropdownMenu.Label>
    <DropdownMenu.Group>
      <DropdownMenu.Separator class="bg-border" />
      <DropdownMenu.Item on:click={() => navigator.clipboard.writeText(id)}><Copy class="mr-2 h-4 w-4" />Copy auction ID</DropdownMenu.Item>
      <DropdownMenu.Item><Eye class="mr-2 h-4 w-4" />View auction</DropdownMenu.Item>
    </DropdownMenu.Group>
    <DropdownMenu.Group>
      <DropdownMenu.Separator class="bg-border" />
      <DropdownMenu.Item><Trash2 class="mr-2 h-4 w-4" />Delete auction</DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>