<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { CircleEllipsis, Copy, Loader2, Trash2 } from "lucide-svelte";

  export let id: string;
  export let username: string;

  let loading = false;
  let statusDialog = {
    open: false,
    title: "",
    description: ""
  };
  let chatDeleteDialogOpen = false;

  async function handleButtonClick(apiEndpoint: string, method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH", body: string, errorMessage: string, dialogOpenSetter: { (value: any): any; (value: any): any; (arg0: boolean): void }) {
    loading = true;
    try {
      const res = await fetch(apiEndpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json"
        },
        [method !== "GET" ? "body" : ""]: body
      });
      const resJson = await res.json();
      if (resJson.success) {
        dialogOpenSetter(false);
        window.location.reload();
      } else {
        dialogOpenSetter(false);
        statusDialog = { open: true, title: "Oops", description: errorMessage };
        loading = false;
      }
    } catch (e) {
      dialogOpenSetter(false);
      statusDialog = { open: true, title: "Oops", description: errorMessage };
      loading = false;
    }
  }
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
      <DropdownMenu.Item on:click={() => navigator.clipboard.writeText(id)}><Copy class="mr-2 h-4 w-4" />Copy chat ID</DropdownMenu.Item>
    </DropdownMenu.Group>
    <DropdownMenu.Group>
      <DropdownMenu.Separator class="bg-border" />
      <DropdownMenu.Item on:click={() => (chatDeleteDialogOpen = true)}><Trash2 class="mr-2 h-4 w-4" />Delete chat</DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<AlertDialog.Root bind:open={chatDeleteDialogOpen} closeOnEscape={!loading} closeOnOutsideClick={!loading}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete {username}'s chat</AlertDialog.Title>
      <AlertDialog.Description>
        This will delete the chat and all of its associated data:
        <ul class="list-inside list-disc">
          <li>Messages</li>
        </ul>
        <br />
        <span class="text-destructive">This action is irreversible.</span>
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={loading}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action asChild>
        <Button disabled={loading} variant="destructive" on:click={() => handleButtonClick("/api/dashboard/chats/delete", "DELETE", JSON.stringify({ id: id }), "Deleting the chat failed. Please try again later or contact support.", (value) => (chatDeleteDialogOpen = value))}>
          {#if loading}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else}
            Continue
          {/if}
        </Button>
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<Dialog.Root bind:open={statusDialog.open}>
  <Dialog.Content class="border-border bg-popover">
    <Dialog.Header>
      <Dialog.Title>{statusDialog.title}</Dialog.Title>
      <Dialog.Description>
        {@html statusDialog.description}
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
