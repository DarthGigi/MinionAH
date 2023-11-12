<script lang="ts">
  import { enhance } from "$app/forms";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import * as Tooltip from "$lib/components/ui/tooltip";

  export let data: PageData;

  let submitButton: HTMLButtonElement;

  let newLines = 0;
  let textValue: string;
  let messageForm: HTMLFormElement;
  let ulMessages: HTMLUListElement;

  onMount(() => {
    if (!ulMessages) return;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLLIElement) {
                node.scrollIntoView({ behavior: "instant" });
              }
            });
          }
        }
      });
    });

    observer.observe(ulMessages, {
      childList: true
    });
  });

  function formatDate(createdAt: Date) {
    const messageDate = createdAt;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (isSameDay(messageDate, today)) {
      return "Today";
    } else if (isSameDay(messageDate, yesterday)) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString();
    }
  }

  function isSameDay(date1: Date, date2: Date) {
    return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  }
</script>

<div class="flex h-[calc(100vh-64px)] w-screen flex-col items-center justify-center">
  <div class="relative w-full max-w-sm rounded-lg border border-neutral-700 bg-neutral-800 shadow">
    <a href={`/${data.user2.username}`} class="absolute left-2 top-2 rounded-lg bg-neutral-700 bg-opacity-0 p-1.5 text-sm text-neutral-400 opacity-30 transition-all duration-300 hover:bg-opacity-100 hover:opacity-100">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </a>

    <div class="flex flex-col items-center justify-center border-neutral-700 p-4" class:border-b-2={data.chat}>
      <img
        src={`https://cdn.discordapp.com/avatars/${data.user2?.id}/${data.user2?.avatar}?size=64`}
        alt={data.user2?.username}
        class="pointer-events-none h-16 w-16 rounded-full"
        on:error={({ currentTarget }) => {
          if (!(currentTarget instanceof HTMLImageElement)) return;
          currentTarget.src = `https://cdn.discordapp.com/embed/avatars/${Number(data.user2.id) % 6}.png?size=64`;
        }}
      />
      <h1 class="text-center text-lg font-semibold">{data.user2?.username}</h1>
    </div>
    {#if data.chat}
      <ul bind:this={ulMessages} class="flex max-h-72 w-full flex-col gap-2 overflow-scroll px-6 py-6">
        {#await data.streamed.messages}
          <li class="animate-pulse self-end rounded-full rounded-br-none bg-[#3C83F7] px-4 py-2">
            <div class="h-4 w-16" />
          </li>
          <li class="animate-pulse self-start rounded-full rounded-bl-none bg-[#3B3B3D] px-4 py-2">
            <div class="h-4 w-16" />
          </li>
          <li class="animate-pulse self-end rounded-full rounded-br-none bg-[#3C83F7] px-4 py-2">
            <div class="h-4 w-16" />
          </li>
          <li class="animate-pulse self-start rounded-full rounded-bl-none bg-[#3B3B3D] px-4 py-2">
            <div class="h-4 w-16" />
          </li>
          <li class="animate-pulse self-end rounded-full rounded-br-none bg-[#3C83F7] px-4 py-2">
            <div class="h-4 w-16" />
          </li>
        {:then messages}
          {#each messages as message, i}
            {#if i === 0 || new Date(message.createdAt).getDate() !== new Date(messages[i - 1].createdAt).getDate()}
              <li class="text-center text-xs text-neutral-500">{formatDate(message.createdAt)}</li>
            {/if}

            {#if message.user_id === data.user.id}
              {@const lines = message.content.split("\n")}
              <li class="self-end">
                <Tooltip.Root>
                  <Tooltip.Trigger class={`cursor-default self-end rounded-full !rounded-br-none bg-[#3C83F7] px-4 py-2 text-left text-[#FDFDFD] ${lines.length > 1 ? "!rounded-3xl" : ""}`}>
                    <p>
                      {#each lines as line}
                        {line}
                        {#if lines.length > 1 && line !== lines[lines.length - 1]}
                          <br />
                        {/if}
                      {/each}
                    </p>
                  </Tooltip.Trigger>
                  <Tooltip.Content class="border-2 border-neutral-600 bg-neutral-700 text-white">
                    <time datetime={message.createdAt.toDateString()} class="text-xs">{new Date(message.createdAt).toLocaleTimeString()}</time>
                  </Tooltip.Content>
                </Tooltip.Root>
              </li>
            {:else}
              {@const lines = message.content.split("\n")}
              <li class="self-start">
                <Tooltip.Root>
                  <Tooltip.Trigger class={`cursor-default self-start rounded-full !rounded-bl-none bg-[#3B3B3D] px-4 py-2 text-left text-[#FDFDFD] ${lines.length > 1 ? "!rounded-3xl" : ""}`}>
                    <p>
                      {#each lines as line}
                        {line}
                        {#if lines.length > 1 && line !== lines[lines.length - 1]}
                          <br />
                        {/if}
                      {/each}
                    </p>
                  </Tooltip.Trigger>
                  <Tooltip.Content class="border-2 border-neutral-600 bg-neutral-700 text-white">
                    <time datetime={message.createdAt.toDateString()} class="text-xs">{new Date(message.createdAt).toLocaleTimeString()}</time>
                  </Tooltip.Content>
                </Tooltip.Root>
              </li>
            {/if}
          {/each}
        {/await}
      </ul>
    {/if}
    <div class="border-t-2 border-neutral-700 p-4">
      <form method="POST" class="relative flex rounded-[30px] border-2 border-neutral-600 bg-neutral-700 transition-all duration-300" class:!rounded-2xl={newLines > 0} use:enhance bind:this={messageForm}>
        <textarea
          bind:value={textValue}
          cols="1"
          rows="1"
          maxlength="1000"
          class="no-scrollbar max-h-96 w-full resize-none rounded-full border-none bg-transparent placeholder-neutral-500 focus-visible:border-none focus-visible:ring-0"
          class:!rounded-2xl={newLines > 0}
          name="message"
          placeholder={data.chat ? "Message" : "Send a message to start a chat"}
          required
          on:keydown={(e) => {
            if (e.shiftKey && e.key === "Enter") {
              return;
            }
            if (e.key === "Enter") {
              e.preventDefault();
              submitButton.click();
            }
          }}
          on:focus={() => {
            messageForm.classList.add("!border-blue-500");
          }}
          on:focusout={() => {
            messageForm.classList.remove("!border-blue-500");
          }}
          on:input={({ currentTarget }) => {
            if (!(currentTarget instanceof HTMLTextAreaElement)) return;
            newLines = (textValue.match(/\n/g) || []).length;
            if (newLines > 0) {
              messageForm.classList.add("!rounded-2xl");
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
          }}
        />
        <div class="pointer-events-none w-8" />
        <button type="submit" class="group absolute bottom-1/2 right-1 translate-y-1/2 overflow-hidden opacity-0 transition-opacity duration-300" bind:this={submitButton} class:!bottom-1={newLines > 0} class:!translate-y-0={newLines > 0} class:opacity-100={textValue}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="relative z-10 h-8 w-8 rounded-full text-blue-500 transition-all duration-300">
            <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.53 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v5.69a.75.75 0 001.5 0v-5.69l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clip-rule="evenodd" />
          </svg>
          <div class="pointer-events-none absolute bottom-1/2 right-1 h-6 w-6 translate-y-1/2 rounded-full bg-white" />
        </button>
      </form>
    </div>
  </div>
  <span class="mt-1 text-xs opacity-25"> Messages are not end-to-end encrypted and are stored in plaintext. </span>
</div>
