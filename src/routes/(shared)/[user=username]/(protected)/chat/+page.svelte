<script lang="ts">
  import { beforeNavigate } from "$app/navigation";
  import { PUBLIC_cluster, PUBLIC_key } from "$env/static/public";
  import Tiptap from "$lib/components/chat/Tiptap.svelte";
  import ChatLoading from "$lib/components/chat/chat-loading.svelte";
  import Message from "$lib/components/chat/message.svelte";
  import * as Avatar from "$lib/components/ui/avatar";
  import { scrollToBottomAction } from "$lib/utilities";
  import ArrowLeftCircle from "lucide-svelte/icons/arrow-left-circle";
  import Pusher from "pusher-js";
  import { onDestroy, onMount } from "svelte";
  import { draw, fade } from "svelte/transition";
  import type { PageData } from "./$types";

  interface iMessage {
    id?: string;
    chat_id: string;
    user_id: string;
    content: string;
    createdAt: Date;
    animate?: boolean;
  }

  export let data: PageData;

  const pusher = new Pusher(PUBLIC_key, {
    cluster: PUBLIC_cluster
  });

  const channel = pusher.subscribe(`chat-${data.chat.id}`);

  let showChat = true;

  let newChats: iMessage[] = [];
  let messages: iMessage[] = [];
  let sentMessageSuccess: boolean | undefined | null = null;

  let loading = true;
  let updateRead = async () => {};

  $: newChats;
  $: messages;

  const disconnect = () => {
    channel.unsubscribe();
    channel.unbind_all();
    channel.disconnect();
    pusher.unsubscribe(data.chat.id);
    pusher.unbind_all();
    pusher.disconnect();
  };

  beforeNavigate(({ to }) => {
    updateRead();
    disconnect();
    // This makes sure the +layout.server.ts is re-run so that unreadMessages is updated
    window.location.href = to?.url.href || "/";
  });

  onMount(async () => {
    await fetch(`${window.location.href}/api`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "fetch"
      }
    });
    const messagesData = await fetch(`${window.location.href}/api`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "fetch"
      }
    })
      .then((res) => res.json())
      .then((res) => {
        return res.map((message: any) => {
          return {
            ...message,
            createdAt: new Date(message.createdAt)
          };
        });
      })
      .finally(() => {
        loading = false;
      });

    messages = [...messagesData];
  });
  const sendMessage = async (eventData: any) => {
    const textValue = eventData.detail;
    if (!textValue) return;
    const message = {
      content: textValue,
      createdAt: new Date(),
      user_id: data.user.id,
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      chat_id: data.chat.id
    };
    newChats = [...newChats, message];
    sentMessageSuccess = undefined;

    await fetch(`${window.location.href}/api`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "fetch"
      },
      body: JSON.stringify(message)
    });
  };

  channel.bind("new-message", (new_message: iMessage) => {
    new_message.createdAt = new Date(new_message.createdAt);
    new_message.animate = true;
    if (new_message.user_id === data.user.id) {
      messages = [...messages, new_message];
      newChats = newChats.filter((message) => message.id === new_message.id);
      sentMessageSuccess = true;
      setTimeout(() => {
        sentMessageSuccess = null;
      }, 1000);
    } else {
      messages = [...messages, new_message];
    }
  });

  onDestroy(() => {
    updateRead();
    disconnect();
  });
</script>

<div class="flex h-[calc(100vh-64px)] w-screen flex-col items-center justify-center">
  <div class="relative w-full max-w-sm rounded-lg border border-border bg-secondary shadow">
    <a href={`/${data.user2.username}`} class="absolute left-2 top-2 rounded-lg bg-accent bg-opacity-0 p-1.5 text-sm text-muted-foreground opacity-30 transition-all duration-300 hover:bg-opacity-100 hover:opacity-100">
      <ArrowLeftCircle class="h-6 w-6" />
    </a>

    <div class="flex flex-col items-center justify-center border-border p-4" class:border-b={data.chat || showChat}>
      <Avatar.Root class="pointer-events-none h-16 w-16 rounded-full bg-accent">
        <Avatar.Image class="pointer-events-none h-full w-full p-2" src={`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${data.user2?.id}`} alt={data.user2?.username} />
        <Avatar.Fallback class="border-2 border-border bg-secondary">{data.user2?.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar.Root>
      <h2 class="text-center text-lg font-semibold">{data.user2?.username}</h2>
    </div>
    {#if showChat}
      <div use:scrollToBottomAction class="no-scrollbar flex max-h-72 w-full max-w-full flex-col gap-2 overflow-y-auto scroll-smooth px-6 py-6">
        {#if loading}
          <ChatLoading />
        {:else if messages}
          {#each newChats as message}
            <Message {message} self={true} class="animate-pulse" />
          {/each}
          {#each messages as message, i}
            {#if message.user_id === data.user.id}
              <Message {message} self={true} />
            {:else}
              <Message {message} self={false} />
            {/if}
          {/each}
        {/if}
      </div>
    {/if}
    <div class="relative border-t border-accent p-4">
      {#if sentMessageSuccess !== null}
        <div transition:fade class="absolute -top-8 right-1 rounded bg-accent p-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-2 h-6 w-6 transition-colors delay-300 duration-300" class:animate-spin={sentMessageSuccess === undefined && newChats.length > 0} class:text-blue-500={sentMessageSuccess === undefined && newChats.length > 0} class:text-green-500={sentMessageSuccess === true} class:text-red-500={sentMessageSuccess === false}>
            {#if sentMessageSuccess === undefined && newChats.length > 0}
              <path in:draw={{ delay: 300, duration: 300 }} out:draw={{ duration: 300 }} d="M21 12a9 9 0 1 1-6.219-8.56" />
            {:else if sentMessageSuccess}
              <circle in:draw={{ delay: 300, duration: 300 }} out:draw={{ duration: 300 }} cx="12" cy="12" r="10" /><path in:draw={{ delay: 300, duration: 300 }} out:draw d="m9 12 2 2 4-4" />
            {:else}
              <circle in:draw={{ delay: 300, duration: 300 }} out:draw={{ duration: 300 }} cx="12" cy="12" r="10" /><path in:draw={{ delay: 300, duration: 300 }} out:draw d="m15 9-6 6" /><path in:draw={{ delay: 300, duration: 300 }} out:draw={{ duration: 300 }} d="m9 9 6 6" />
            {/if}
          </svg>
        </div>
      {/if}
      <Tiptap on:sendMessage={sendMessage} />
    </div>
  </div>
  <span class="mt-1 text-xs opacity-25"> Messages are not end-to-end encrypted and are stored in plaintext. </span>
</div>
