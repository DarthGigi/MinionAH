<script lang="ts" context="module">
  export type iMessage = {
    id?: string;
    chat_id: string;
    user_id: string;
    content: string;
    createdAt: Date;
    animate?: boolean;
  };
</script>

<script lang="ts">
  import { enhance } from "$app/forms";
  import { beforeNavigate, goto } from "$app/navigation";
  import { PUBLIC_cluster, PUBLIC_key } from "$env/static/public";
  import Tiptap from "$lib/components/chat/Tiptap.svelte";
  import ChatLoading from "$lib/components/chat/chat-loading.svelte";
  import Message from "$lib/components/chat/message.svelte";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import { scrollToBottomAction } from "$lib/utilities";
  import CircleArrowLeft from "lucide-svelte/icons/circle-arrow-left";
  import Pusher from "pusher-js";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { draw, fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import MessageSquarePlus from "lucide-svelte/icons/message-square-plus";

  export let data: PageData;

  const chatExists = data.chat !== null;
  const pusher = chatExists
    ? new Pusher(PUBLIC_key, {
        cluster: PUBLIC_cluster
      })
    : null;

  const channel = chatExists && pusher ? pusher.subscribe(`chat-${data.chat?.id}`) : null;

  const showChat = data.chat !== null;
  const message = writable<iMessage>();

  const messageForm = writable<HTMLFormElement>();
  const timeout = writable<NodeJS.Timeout>();
  const newChats = writable<iMessage[]>([]);
  const messages = writable<iMessage[]>([]);
  const sentMessageSuccess = writable<boolean | undefined | null>(null);

  const loading = writable<boolean>(false);

  const updateRead = async (onload: boolean) => {
    const response = await fetch("chat", {
      method: "PUT"
    });
    if (response.ok) {
      if (!onload) return;
      const data = await response.json();
      if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.setAppBadge) {
        if (data.unread > 0) {
          navigator.setAppBadge(data.unread);
        } else {
          navigator.clearAppBadge();
        }
      }
    } else if (response.redirected) {
      await goto(response.url, { invalidateAll: true, replaceState: true });
    }
  };

  const disconnect = () => {
    if (!chatExists || !pusher || !channel) return;
    channel.unsubscribe();
    channel.unbind_all();
    channel.disconnect();
    pusher.unsubscribe(data.chat!.id);
    pusher.unbind_all();
    pusher.disconnect();
    updateRead(false);
  };

  const sendMessage = async (eventData: any) => {
    const textValue = eventData.detail;
    if (!textValue) return;
    message.set({
      content: textValue,
      createdAt: new Date(),
      user_id: data.user.id,
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      chat_id: data.chat?.id || ""
    });
    newChats.set([...$newChats, $message]);
    sentMessageSuccess.set(undefined);
    $messageForm.requestSubmit();
  };

  onMount(async () => {
    if (!chatExists || !pusher || !channel) return;

    if (data.messages) messages.set([...$messages, ...(data.messages as unknown as iMessage[])]);

    console.log("Mounting chat page");
    updateRead(true);

    channel.bind("new-message", (new_message: iMessage) => {
      sentMessageSuccess.set(null);
      new_message.createdAt = new Date(new_message.createdAt);
      new_message.animate = true;
      if (new_message.user_id === data.user.id) {
        messages.set([...$messages, new_message]);
        newChats.set($newChats.filter((message) => message.id === new_message.id));
        sentMessageSuccess.set(true);
        clearTimeout($timeout);
        timeout.set(
          setTimeout(() => {
            sentMessageSuccess.set(null);
          }, 1000)
        );
      } else {
        messages.set([...$messages, new_message]);
      }
    });
  });

  beforeNavigate(async ({ to, type, cancel }) => {
    if (!chatExists || !pusher || !channel) return;
    disconnect();
    if (type === "link") {
      cancel();
      // This makes sure the +layout.server.ts is re-run so that unreadMessages is updated
      window.location.href = to?.url.href || "/";
    }
  });
</script>

<div class="flex h-full w-screen flex-col items-center justify-center">
  <div class="relative w-full max-w-sm rounded-lg border border-border bg-secondary shadow">
    <a href={`/user/${data.user2.username}`} class="absolute left-2 top-2 rounded-lg bg-accent bg-opacity-0 p-1.5 text-sm text-muted-foreground opacity-30 transition-all duration-300 hover:bg-opacity-100 hover:opacity-100">
      <CircleArrowLeft class="h-6 w-6" />
    </a>

    <div class="flex flex-col items-center justify-center border-border p-4" class:border-b={data.chat || showChat}>
      <Avatar.Root class="pointer-events-none h-16 w-16 rounded-full bg-accent">
        <Avatar.Image class="pointer-events-none h-full w-full p-2" src={`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${data.user2?.id}`} alt={data.user2?.username} />
        <Avatar.Fallback class="border-2 border-border bg-secondary">{data.user2?.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar.Root>
      <h2 class="text-center text-lg font-semibold">{data.user2?.username}</h2>
    </div>
    {#if showChat}
      <div use:scrollToBottomAction class="flex max-h-72 w-full max-w-full flex-col gap-2 overflow-y-auto overflow-x-clip scroll-smooth px-6 py-6">
        {#if $loading}
          <ChatLoading />
        {:else if $messages && Array.isArray($messages)}
          {#each $messages as message, i (i)}
            {#if message.user_id === data.user.id}
              <Message {message} self={true} />
            {:else}
              <Message {message} self={false} />
            {/if}
          {/each}
          {#each $newChats as message}
            <Message {message} self={true} class="animate-pulse" />
          {/each}
        {/if}
      </div>

      <div class="relative border-t border-accent p-4">
        {#if $sentMessageSuccess !== null}
          <div transition:fade class="absolute -top-8 right-1 rounded bg-accent p-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-2 h-6 w-6 transition-colors delay-300 duration-300" class:animate-spin={$sentMessageSuccess === undefined && $newChats.length > 0} class:text-blue-500={$sentMessageSuccess === undefined && $newChats.length > 0} class:text-green-500={$sentMessageSuccess === true} class:text-red-500={$sentMessageSuccess === false}>
              {#if $sentMessageSuccess === undefined && $newChats.length > 0}
                <path in:draw={{ delay: 300, duration: 300 }} out:draw={{ duration: 300 }} d="M21 12a9 9 0 1 1-6.219-8.56" />
              {:else if $sentMessageSuccess}
                <circle in:draw={{ delay: 300, duration: 300 }} out:draw={{ duration: 300 }} cx="12" cy="12" r="10" /><path in:draw={{ delay: 300, duration: 300 }} out:draw d="m9 12 2 2 4-4" />
              {:else}
                <circle in:draw={{ delay: 300, duration: 300 }} out:draw={{ duration: 300 }} cx="12" cy="12" r="10" /><path in:draw={{ delay: 300, duration: 300 }} out:draw d="m15 9-6 6" /><path in:draw={{ delay: 300, duration: 300 }} out:draw={{ duration: 300 }} d="m9 9 6 6" />
              {/if}
            </svg>
          </div>
        {/if}
        <form
          method="POST"
          action="?/sendMessage"
          use:enhance={({ formData }) => {
            formData.set("message", JSON.stringify($message));
            return async ({ result }) => {
              if (result.type === "success") {
                sentMessageSuccess.set(true);
                clearTimeout($timeout);
                timeout.set(
                  setTimeout(() => {
                    sentMessageSuccess.set(null);
                  }, 1000)
                );
              } else if (result.type === "error") {
                sentMessageSuccess.set(false);
                clearTimeout($timeout);
                timeout.set(
                  setTimeout(() => {
                    sentMessageSuccess.set(null);
                  }, 1000)
                );
              }
            };
          }}
          bind:this={$messageForm}>
          <Tiptap on:sendMessage={sendMessage} />
        </form>
      </div>
    {:else}
      <div class="flex flex-col items-center justify-center gap-2 p-4 pt-0">
        <h2 class="flex-grow text-center text-lg font-semibold">You don't have any chats with {data.user2.username} yet.</h2>
        <form method="POST" action="?/createChat">
          <Button type="submit" class="flex items-center gap-1"><MessageSquarePlus class="size-4" />Start Chat</Button>
        </form>
      </div>
    {/if}
  </div>
  <span class="mt-1 text-pretty text-xs opacity-25"> Messages are not end-to-end encrypted and are stored in plaintext. </span>
</div>
