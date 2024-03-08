<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import CircleEllipsis from "lucide-svelte/icons/circle-ellipsis";
  import Copy from "lucide-svelte/icons/copy";
  import Eye from "lucide-svelte/icons/eye";
  import LoaderCircle from "lucide-svelte/icons/loader-circle";
  import Trash2 from "lucide-svelte/icons/trash-2";

  export let id: string;
  export let username: string;

  let loading = false;
  let statusDialog = {
    open: false,
    title: "",
    description: ""
  };
  let auctionDeleteDialogOpen = false;

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
      <DropdownMenu.Item on:click={() => navigator.clipboard.writeText(id)}><Copy class="mr-2 h-4 w-4" />Copy auction ID</DropdownMenu.Item>
      <DropdownMenu.Item href={`/${username}/${id}`}><Eye class="mr-2 h-4 w-4" />View auction</DropdownMenu.Item>
    </DropdownMenu.Group>
    <DropdownMenu.Group>
      <DropdownMenu.Separator class="bg-border" />
      <DropdownMenu.Item on:click={() => (auctionDeleteDialogOpen = true)}><Trash2 class="mr-2 h-4 w-4" />Delete auction</DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<AlertDialog.Root bind:open={auctionDeleteDialogOpen} closeOnEscape={!loading} closeOnOutsideClick={!loading}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete {username}'s auction</AlertDialog.Title>
      <AlertDialog.Description>
        This will delete the auction
        <br /><br />
        <span class="text-destructive">This action is irreversible.</span>
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={loading}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action asChild>
        <Button disabled={loading} variant="destructive" on:click={() => handleButtonClick("/api/dashboard/auctions/delete", "DELETE", JSON.stringify({ ids: [id] }), "Deleting the auction failed. Please try again later or contact support.", (value) => (auctionDeleteDialogOpen = value))}>
          {#if loading}
            <LoaderCircle class="h-4 w-4 animate-spin" />
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
