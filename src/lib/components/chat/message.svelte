<script lang="ts">
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { fly } from "svelte/transition";
  import ChatDate from "./chat-date.svelte";
  export let self: boolean;
  export let message: {
    content: string;
    createdAt: Date;
  };
  let hovering = false;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div {...$$restProps} class:self-end={self} class:self-start={!self} in:fly|global={{ y: 24 }} on:mouseenter={() => (hovering = true)} on:mouseleave={() => (hovering = false)}>
  <Tooltip.Root>
    <Tooltip.Trigger class={`flex ${self ? "flex-row" : "flex-row-reverse"}`}>
      <div class={`no-scrollbar min-w-0 max-w-[18rem] cursor-default select-text self-end break-words rounded-full px-4 py-2 text-left text-[#FDFDFD] transition-all duration-300 ${message.content.length >= 25 ? "!rounded-3xl" : ""} ${self ? "self-end !rounded-br-none bg-[#3C83F7]" : "self-start !rounded-bl-none bg-[#3B3B3D]"}`}>
        <span class="no-scrollbar min-w-0 select-text break-words">
          {message.content}
        </span>
      </div>
      {#if hovering}
        <ChatDate {self} date={message.createdAt} />
      {/if}
    </Tooltip.Trigger>
    <Tooltip.Content class="border-2 border-accent bg-accent text-white">
      <time datetime={message.createdAt.toDateString()} class="text-xs">{new Date(message.createdAt).toLocaleTimeString()}</time>
    </Tooltip.Content>
  </Tooltip.Root>
</div>
