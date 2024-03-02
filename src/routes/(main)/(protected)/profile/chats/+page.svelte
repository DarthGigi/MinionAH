<script lang="ts">
  import { enhance } from "$app/forms";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import * as Avatar from "$lib/components/ui/avatar";
  import { checkReadStatus } from "$lib/utilities";
  import Info from "lucide-svelte/icons/info";
  import Trash2 from "lucide-svelte/icons/trash-2";
  import { createPress } from "svelte-interactions";
  import type { PageData } from "./$types";

  export let data: PageData;

  const { pressAction } = createPress();

  let showDelete = false;
  let chatToDelete: string | null = null;
</script>

<div class="mt-3 flex flex-col items-center justify-center gap-3 max-md:pb-20">
  {#await data.streamed.chats then chats}
    {#each chats as chat}
      {@const chatUser = chat.user1_id === data.user?.id ? chat.user2 : chat.user1}
      {@const read = checkReadStatus(chat, data.user?.id)}

      <div class="relative flex w-80 items-center justify-between gap-x-4 !overflow-visible truncate rounded-md bg-background text-popover-foreground shadow-md outline-none">
        <a href="/{chatUser.username}/chat" data-sveltekit-preload-data="off" class="group flex items-center justify-between gap-x-4 py-4 pl-4">
          <Avatar.Root class="h-12 w-12 flex-shrink bg-accent transition-all duration-300 group-hover:scale-110">
            <Avatar.Image class="pointer-events-none  h-full w-full p-2" src={`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${chatUser.id}`} alt={`${chatUser.username}'s avatar`} />
            <Avatar.Fallback class="border-2 border-accent bg-secondary">{chatUser.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
          </Avatar.Root>
          <div class="flex-grow space-y-1">
            <h4 class="max-w-[8rem] truncate text-sm font-semibold">{chatUser.username}</h4>
            <p class="text-xs text-muted-foreground">Messages: {chat._count.messages}</p>
            <p class="text-xs text-muted-foreground">
              Last online: {new Date(chatUser.loggedInAt).toLocaleString(window.navigator.language, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric"
              })}
            </p>
          </div>
        </a>
        <div class="flex flex-col gap-2 py-4 pr-4">
          <a href={`https://sky.shiiyu.moe/stats/${chatUser.username}`} target="_blank" rel="noopener" class="group rounded bg-accent p-1 text-sm text-muted-foreground focus:outline-none focus:ring-4 focus:ring-transparent">
            <Info class="h-5 w-5 transition-colors duration-300 group-hover:text-white" />
          </a>
          <button
            class="group rounded bg-accent p-1 text-sm text-muted-foreground transition-colors duration-300 hover:bg-destructive focus:outline-none focus:ring-4 focus:ring-transparent"
            type="button"
            use:pressAction
            on:press={() => {
              showDelete = true;
              chatToDelete = chat.id;
            }}>
            <Trash2 class="h-5 w-5 transition-colors duration-300 group-hover:text-white" />
          </button>
        </div>

        {#if !read}
          <span class="absolute right-0 top-0 -mr-1 -mt-1 flex h-3 w-3">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-muted-foreground opacity-75" />
            <span class="relative inline-flex h-3 w-3 rounded-full bg-ring" />
          </span>
        {/if}
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
