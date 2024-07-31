<script lang="ts">
  import * as Tooltip from "$lib/components/ui/tooltip";
  import type { Editor as EditorType } from "@tiptap/core";
  import { Editor } from "@tiptap/core";
  import Image from "@tiptap/extension-image";
  import Underline from "@tiptap/extension-underline";
  import StarterKit from "@tiptap/starter-kit";
  import { formatDistanceToNow } from "date-fns";
  import { toZonedTime } from "date-fns-tz";
  import { onDestroy, onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { MessageType, type iMessage } from "../../../routes/(shared)/user/[user=username]/(protected)/chat/+page.svelte";
  import { MinionCard } from "../card";

  export let self: boolean;
  export let message: Omit<iMessage, "id" | "chat_id" | "user_id">;

  let editor: EditorType;
  let element: HTMLDivElement;

  onMount(() => {
    editor = new Editor({
      element: element,
      editable: false,
      content: message.content,
      extensions: [
        StarterKit,
        Image.configure({
          HTMLAttributes: {
            class: "rounded-lg max-w-lg h-auto select-none !cursor-default w-full overflow-scroll max-h-96 object-cover"
          }
        }),
        Underline
      ],
      // enableCoreExtensions: true,

      onTransaction: () => {
        // force re-render so `editor.isActive` works as expected
        editor = editor;
      }
    });
  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });
</script>

<div {...$$restProps} class:self-end={self} class:self-start={!self} in:fly|global={{ y: 24 }}>
  <Tooltip.Root openDelay={100} closeDelay={0} group={true}>
    <Tooltip.Trigger asChild let:builder class={`flex w-full ${self ? "flex-row" : "flex-row-reverse"}`}>
      {#if message.type === MessageType.TEXT}
        {@const isOnlyImage = /^<img src=".*" class=".*">$/i.test(message.content)}
        <button {...builder} use:builder.action>
          <div class={`no-scrollbar min-w-0 max-w-[18rem] cursor-default select-text self-end break-words rounded-full py-2 text-left text-[#FDFDFD] transition-all duration-300 data-[image=false]:px-4 ${message.content.length >= 25 ? "!rounded-3xl" : ""} ${self ? "self-end !rounded-br-none data-[image=false]:bg-[#3C83F7]" : "self-start !rounded-bl-none data-[image=false]:bg-[#3B3B3D]"}`} bind:this={element} data-image={isOnlyImage}></div>
        </button>
      {:else if message.type === MessageType.AUCTION}
        <ul class="w-96 rounded-lg border border-accent" {...builder} use:builder.action>
          <MinionCard minion={JSON.parse(message.content)} enableHoverEffects={true} />
        </ul>
      {/if}
    </Tooltip.Trigger>
    <Tooltip.Content class="border-2 border-accent bg-accent text-white">
      <time datetime={message.createdAt.toLocaleString()} class="text-nowrap text-xs">
        {formatDistanceToNow(toZonedTime(message.createdAt, Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC"), {
          addSuffix: true,
          includeSeconds: true
        })}
      </time>
    </Tooltip.Content>
  </Tooltip.Root>
</div>
