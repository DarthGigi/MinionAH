<script lang="ts">
  import { enhance } from "$app/forms";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Trash2 } from "lucide-svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  let showDelete = false;
  let chatToDelete: string | null = null;
</script>

<div class="flex flex-col items-center justify-center max-md:pb-20">
  {#await data.streamed.chats then chats}
    {#each chats as chat}
      {@const chatUser = chat.user1_id === data.user?.id ? chat.user2 : chat.user1}
      {@const read = chat.user1_id === data.user?.id ? chat.user1Read : chat.user2Read}

      <div class="group relative mt-3">
        <a href="/{chatUser.username}/chat" data-sveltekit-preload-data="off" class="relative flex w-64 justify-between gap-x-4 truncate rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none">
          <Avatar.Root class="h-12 w-12 flex-shrink bg-neutral-700">
            <Avatar.Image class="pointer-events-none  h-full w-full p-2" src={`data:image/png;base64,${chatUser.avatar}`} alt={`${chatUser.username}'s avatar`} />
            <Avatar.Fallback class="border-2 border-neutral-600 bg-neutral-800">{chatUser.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
          </Avatar.Root>
          <div class="flex-grow space-y-1">
            <h4 class="max-w-[8rem] truncate text-sm font-semibold">@{chatUser.username}</h4>
            <p class="text-xs text-muted-foreground">Messages: {chat._count.messages}</p>
          </div>
        </a>
        {#if !read}
          <span class="absolute right-0 top-0 -mr-1 -mt-1 flex h-3 w-3">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-400 opacity-75" />
            <span class="relative inline-flex h-3 w-3 rounded-full bg-neutral-500" />
          </span>
        {/if}
        <button
          class="group absolute bottom-1 right-1 rounded-lg !border-0 bg-neutral-700 p-1.5 text-sm text-neutral-400 opacity-0 transition-all duration-300 hover:bg-red-600 hover:text-white/70 focus:outline-none focus:ring-4 focus:ring-transparent group-hover:opacity-100"
          type="button"
          on:click={() => {
            showDelete = true;
            chatToDelete = chat.id;
          }}>
          <Trash2 class="h-5 w-5" />
        </button>
      </div>
    {/each}
  {/await}
</div>

<AlertDialog.Root bind:open={showDelete} closeOnEscape={true} closeOnOutsideClick={true}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Warning</AlertDialog.Title>
      <AlertDialog.Description>Are you sure you want to delete this chat?</AlertDialog.Description>
      <AlertDialog.Description>This will delete the chat for both users and all the messages in it.</AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <form action="?/deleteChat" use:enhance method="POST">
        <input type="hidden" name="chatId" value={chatToDelete} />
        <AlertDialog.Action type="submit">Delete</AlertDialog.Action>
      </form>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
