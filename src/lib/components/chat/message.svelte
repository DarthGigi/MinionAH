<script lang="ts">
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { fly } from "svelte/transition";
  export let self: boolean;
  export let message: {
    content: string;
    createdAt: Date;
  };
</script>

<li {...$$restProps} class:self-end={self} class:self-start={!self} in:fly|global={{ y: 24 }}>
  <Tooltip.Root>
    <Tooltip.Trigger class={`no-scrollbar min-w-0 max-w-[18rem] cursor-default select-text self-end break-words rounded-full px-4 py-2 text-left text-[#FDFDFD] ${message.content.length >= 25 ? "!rounded-3xl" : ""} ${self ? "self-end !rounded-br-none bg-[#3C83F7]" : "self-start !rounded-bl-none bg-[#3B3B3D]"}`}>
      <span class="no-scrollbar min-w-0 select-text break-words">
        {message.content}
      </span>
    </Tooltip.Trigger>
    <Tooltip.Content class="border-2 border-neutral-600 bg-neutral-700 text-white">
      <time datetime={message.createdAt.toDateString()} class="text-xs">{new Date(message.createdAt).toLocaleTimeString()}</time>
    </Tooltip.Content>
  </Tooltip.Root>
</li>
