<script lang="ts">
  import ChatLoading from "$lib/components/chat/chat-loading.svelte";
  import Message from "$lib/components/chat/message.svelte";
  import * as Avatar from "$lib/components/ui/avatar";
  import { ArrowLeftCircle, ArrowUp } from "lucide-svelte";
  import { onDestroy, onMount } from "svelte";
  import { draw, fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import Pusher from "pusher-js";
  import { PUBLIC_key, PUBLIC_cluster } from "$env/static/public";
  import { beforeNavigate } from "$app/navigation";
  export let data: PageData;

  const pusher = new Pusher(PUBLIC_key, {
    cluster: PUBLIC_cluster
  });

  const channel = pusher.subscribe(`chat-${data.chat.id}`);

  interface Message {
    id?: string;
    chat_id: string;
    user_id: string;
    content: string;
    createdAt: Date;
  }

  let sendButton: HTMLButtonElement;

  let newLines = 0;
  let textValue: string;
  let messageDiv: HTMLDivElement;
  let showChat = false;

  let newChats: Message[] = [];
  let messages: Message[];
  let sentMessageSuccess: boolean | undefined | null = null;

  $: newChats;
  $: messages;
  let loading = true;

  function disconnect() {
    channel.unsubscribe();
    channel.unbind_all();
    channel.disconnect();
    pusher.unsubscribe(data.chat.id);
    pusher.unbind_all();
    pusher.disconnect();
  }

  beforeNavigate(() => {
    updateRead();
    disconnect();
  });

  let updateRead = () => {};
  onMount(async () => {
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

    updateRead = async () => {
      await fetch(`${window.location.href}/api`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "fetch"
        }
      });
    };
  });

  async function sendMessage() {
    if (!textValue || !textValue.length) return;
    const message = {
      content: textValue,
      createdAt: new Date(),
      user_id: data.user.id,
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      chat_id: data.chat.id
    };
    newChats = [message, ...newChats];
    sentMessageSuccess = undefined;

    textValue = "";

    await fetch(`${window.location.href}/api`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "fetch"
      },
      body: JSON.stringify(message)
    });
  }

  channel.bind("new-message", (new_message: Message) => {
    new_message.createdAt = new Date(new_message.createdAt);
    if (new_message.user_id === data.user.id) {
      messages = [new_message, ...messages];
      newChats = newChats.filter((message) => message.id === new_message.id);
      sentMessageSuccess = true;
      setTimeout(() => {
        sentMessageSuccess = null;
      }, 1000);
    } else {
      messages = [new_message, ...messages];
    }
    textValue = "";
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
        <Avatar.Image class="pointer-events-none h-full w-full p-2" src={`data:image/png;base64,${data.user2?.avatar}`} alt={data.user2?.username} />
        <Avatar.Fallback class="border-2 border-border bg-secondary">{data.user2?.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar.Root>
      <h2 class="text-center text-lg font-semibold">{data.user2?.username}</h2>
    </div>
    {#if data.chat || showChat}
      <div class="no-scrollbar flex max-h-72 w-full max-w-full flex-col-reverse gap-2 overflow-y-auto scroll-smooth px-6 py-6">
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
      <div class="relative flex rounded-[30px] border-2 border-accent bg-accent transition-all duration-300" class:!rounded-2xl={newLines > 0} bind:this={messageDiv}>
        <!-- svelte-ignore a11y-autofocus -->
        <textarea
          bind:value={textValue}
          data-sveltekit-keepfocus
          cols="1"
          rows="1"
          maxlength="1000"
          class="no-scrollbar h-full w-full resize-none rounded-full border-none bg-transparent placeholder-ring focus-visible:border-none focus-visible:ring-0"
          class:!rounded-2xl={newLines > 0}
          name="message"
          placeholder={data.chat ? "Message" : "Send a message to start a chat"}
          autofocus
          required
          disabled={newChats.length > 2}
          on:keydown={(e) => {
            if (e.shiftKey && e.key === "Enter") {
              return;
            }
            if (e.key === "Enter") {
              e.preventDefault();
              sendButton.click();
            }
          }}
          on:focus={() => {
            messageDiv.classList.add("!border-blue-500");
          }}
          on:focusout={() => {
            messageDiv.classList.remove("!border-blue-500");
          }}
          on:input={({ currentTarget }) => {
            if (!(currentTarget instanceof HTMLTextAreaElement)) return;
            newLines = (textValue.match(/\n/g) || []).length;
            if (newLines > 0) {
              messageDiv.classList.add("!rounded-2xl");
            }

            switch (newLines) {
              case 0:
                currentTarget.rows = 1;
                break;
              case 1:
                currentTarget.rows = 2;
                break;
              case 2:
                currentTarget.rows = 3;
                break;
              case 3:
                currentTarget.rows = 4;
                break;
              case 4:
                currentTarget.rows = 5;
                break;

              default:
                currentTarget.rows = 5;
                break;
            }
          }} />
        <span class="translate-x absolute bottom-1/2 right-2 translate-y-1/2 text-xs text-ring transition-all duration-300" class:-translate-x-8={textValue} class:!-translate-y-2={newLines > 0} class:!bottom-1={newLines > 0} class:duration-0={newLines > 0}>{textValue && textValue.length ? textValue.length : ""}/1000</span>

        <div class="pointer-events-none w-32" />
        <button type="button" class="group absolute bottom-1/2 right-1 translate-y-1/2 overflow-hidden opacity-0 transition-opacity duration-300" bind:this={sendButton} class:!bottom-1={newLines > 0} class:!translate-y-0={newLines > 0} class:opacity-100={textValue} on:click={sendMessage}>
          <ArrowUp class="relative z-10 h-6 w-6 rounded-full bg-blue-500 text-white transition-all duration-300" />
        </button>
      </div>
    </div>
  </div>
  <span class="mt-1 text-xs opacity-25"> Messages are not end-to-end encrypted and are stored in plaintext. </span>
</div>
