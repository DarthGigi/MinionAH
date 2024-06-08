<script lang="ts" context="module">
  import { z } from "zod";
  export const formSchemaDelete = z.object({
    id: z.string()
  });

  export type FormSchemaDelete = typeof formSchemaDelete;
</script>

<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import * as Form from "$lib/components/ui/form";
  import { checkReadStatus } from "$lib/utilities";
  import { formatDistanceToNow } from "date-fns";
  import { toZonedTime } from "date-fns-tz";
  import LoaderCircle from "lucide-svelte/icons/loader-circle";
  import MessagesSquare from "lucide-svelte/icons/messages-square";
  import Trash2 from "lucide-svelte/icons/trash-2";
  import UserRound from "lucide-svelte/icons/user-round";
  import { toast } from "svelte-sonner";
  import { writable } from "svelte/store";
  import { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import type { PageData } from "./$types";

  export let data: PageData;
  const toastLoading = writable<number | string>();

  const formDelete = superForm(data.formDelete, {
    validators: zodClient(formSchemaDelete),
    timeoutMs: 2000,

    onSubmit: ({ formData }) => {
      formData.set("id", chatToDelete);
      $toastLoading = toast.loading("Deleting the chat...");
    },
    onResult: () => {
      showDelete = false;
      setTimeout(() => toast.dismiss($toastLoading), 300);
    },
    onUpdate: ({ result }) => {
      if (result.type === "success") {
        toast.success("The chat has been deleted successfully.");
      } else {
        toast.error("Failed to delete the chat.");
      }
    },
    onError: () => {
      toast.error("Something went wrong trying to delete the chat.");
    }
  });

  const { form, enhance, message, submitting, submit, timeout } = formDelete;
  timeout.subscribe((value) => {
    if (value) {
      toast.loading("It's taking longer than expected to delete the chat...", {
        id: $toastLoading
      });
    }
  });

  let showDelete = false;
  let chatToDelete: string;
</script>

<div class="py-8 max-md:pb-20">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#await data.streamed.chats then chats}
        {#each chats as chat}
          {@const chatUser = chat.user1_id === data.user?.id ? chat.user2 : chat.user1}
          {@const read = checkReadStatus(chat, data.user?.id)}
          <div class="relative flex flex-col items-center justify-between gap-x-4 space-y-4 rounded-md bg-background p-4 text-popover-foreground shadow-md outline-none @container">
            <div class="flex w-full flex-col items-center justify-between gap-x-4">
              <Avatar.Root class="size-24 flex-shrink bg-accent transition-all duration-300">
                <Avatar.Image class="pointer-events-none h-full w-full p-2" src={`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${chatUser.id}`} alt={`${chatUser.username}'s avatar`} />
                <Avatar.Fallback class="border-2 border-accent bg-secondary">{chatUser.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
              </Avatar.Root>
              <div class="flex w-full flex-col items-center gap-y-1 px-2 text-center">
                <h4 class="w-full truncate px-2 text-xl font-semibold">{chatUser.username}</h4>
                <p class="text-xs text-muted-foreground">
                  Last online
                  {formatDistanceToNow(toZonedTime(chatUser.loggedInAt, Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC"), {
                    addSuffix: true,
                    includeSeconds: true
                  })}
                </p>
                <p class="text-xs text-muted-foreground">Messages: {chat._count.messages}</p>
              </div>
            </div>
            <div class="flex w-full flex-col items-center justify-center gap-2 @xs:flex-row">
              <Button href={`/user/${chatUser.username}/chat`} data-sveltekit-preload-data="off" variant="outline" class="relative w-full">
                <MessagesSquare class="mr-1.5 h-5 w-5" /> Chat
                {#if !read}
                  <span class="absolute right-0 top-0 -mr-1 -mt-1 flex size-3">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-muted-foreground opacity-75"></span>
                    <span class="relative inline-flex size-3 rounded-full bg-ring"></span>
                  </span>
                {/if}
              </Button>
              <Button href={`/user/${chatUser.username}`} data-sveltekit-preload-data="off" variant="outline" class="w-full">
                <UserRound class="mr-1.5 h-5 w-5" /> Profile
              </Button>
              <Button
                data-sveltekit-preload-data="off"
                variant="outline"
                class="w-full hover:bg-destructive hover:text-destructive-foreground"
                on:click={() => {
                  showDelete = true;
                  chatToDelete = chat.id;
                }}>
                <Trash2 class="mr-1.5 h-5 w-5" /> Delete
              </Button>
            </div>
          </div>
        {/each}
        {#if chats.length === 0}
          <p class="text-muted-foreground">You have no chats yet.</p>
        {/if}
      {/await}
    </div>
  </div>
</div>

<AlertDialog.Root bind:open={showDelete} closeOnEscape={true} closeOnOutsideClick={true}>
  <AlertDialog.Content class="border-border bg-popover">
    <AlertDialog.Header>
      <AlertDialog.Title>Warning</AlertDialog.Title>
      <AlertDialog.Description>Are you sure you want to delete this chat?</AlertDialog.Description>
      <AlertDialog.Description>This will delete the chat for both users and all the messages in it.</AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel class="transition-all duration-300" disabled={$submitting}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        class="transition-all duration-300"
        disabled={$submitting}
        on:click={(e) => {
          e.preventDefault();
          submit();
        }}>
        {#if !$submitting}
          Delete
        {:else}
          <LoaderCircle class="h-4 w-4 animate-spin" />
        {/if}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<form use:enhance action="?/deleteChat" class="hidden" method="POST">
  <Form.Field form={formDelete} name="id">
    <Form.Control let:attrs>
      <input hidden bind:value={$form.id} name={attrs.name} />
    </Form.Control>
  </Form.Field>
</form>
