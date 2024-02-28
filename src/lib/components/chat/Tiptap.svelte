<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { sanitizeInput } from "$lib/utilities";
  import type { Editor as EditorType } from "@tiptap/core";
  import { Editor, Extension } from "@tiptap/core";
  import BubbleMenu from "@tiptap/extension-bubble-menu";
  import CharacterCount from "@tiptap/extension-character-count";
  import { Image as TiptapImage } from "@tiptap/extension-image";
  import Placeholder from "@tiptap/extension-placeholder";
  import { Underline as TiptapUnderline } from "@tiptap/extension-underline";
  import StarterKit from "@tiptap/starter-kit";
  import ArrowUp from "lucide-svelte/icons/arrow-up";
  import Bold from "lucide-svelte/icons/bold";
  import Image from "lucide-svelte/icons/image";
  import Info from "lucide-svelte/icons/info";
  import Italic from "lucide-svelte/icons/italic";
  import Strikethrough from "lucide-svelte/icons/strikethrough";
  import Underline from "lucide-svelte/icons/underline";
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { slide } from "svelte/transition";

  const KeyboardHandler = Extension.create({
    name: "keyboardHandler"
  });

  const dispatch = createEventDispatcher();

  const regex = new RegExp("^https://(www\\.)?([a-z0-9]+\\.)?(hypixel.net|cleanshot.cloud|imgur.com|imgbb.com|vgy.me|gyazo.com|prnt.sc|prntscr.com|tenor.com|giphy.com|gfycat.com|discordapp.net|discordapp.com|discord.com|minionah.com)/");
  let element: HTMLDivElement;
  let editor: EditorType;
  let imageAlert = false;

  const image = {
    src: "",
    awaitingImage: false
  };

  onMount(() => {
    editor = new Editor({
      element: element,
      editorProps: {
        attributes: {
          class: "px-2 flex flex-col justify-center focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 min-h-11 max-w-[calc(100%-7.5rem)] transition-all duration-300 max-h-96 overflow-scroll"
        }
      },
      extensions: [
        StarterKit.configure({}),
        TiptapImage.configure({
          HTMLAttributes: {
            class: "rounded-lg max-w-lg h-auto select-none w-full overflow-scroll max-h-96 object-cover"
          }
        }),
        BubbleMenu.configure({
          element: document.querySelector(".menu") as HTMLElement
        }),
        CharacterCount.configure({
          limit: 1000
        }),
        Placeholder.configure({
          placeholder: "Type a message",
          emptyEditorClass: "cursor-text before:content-[attr(data-placeholder)] before:absolute before:top-1/2 before:left-2 before:opacity-50 before:-translate-y-1/2 before:pointer-events-none"
        }),
        TiptapUnderline,
        KeyboardHandler.extend({
          addKeyboardShortcuts() {
            return {
              Enter: () => {
                return emitSendMessage();
              },

              "Shift-Enter": () => {
                /**
                 * currently we do not have an option to show a soft line break in the posts, so we overwrite
                 * the behavior from tiptap with the default behavior on pressing enter
                 */
                return this.editor.commands.first(({ commands }) => [() => commands.createParagraphNear(), () => commands.liftEmptyBlock(), () => commands.splitBlock()]);
              }
            };
          }
        })
      ],
      enableCoreExtensions: true,

      onTransaction: () => {
        if (editor.$doc.content.childCount >= 2) {
          element.classList.add("!rounded-2xl");
        } else {
          element.classList.remove("!rounded-2xl");
        }
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

  function emitSendMessage() {
    if (editor.getHTML().trim() === "" || editor.storage.characterCount.characters() > 1000 || editor.storage.characterCount.characters() === 0) return false;
    dispatch("sendMessage", sanitizeInput(editor.getHTML()));
    return editor.commands.clearContent();
  }

  let boldButton: HTMLButtonElement;
</script>

<div class="menu">
  {#if editor}
    <div class="menu rounded-lg border border-accent bg-popover">
      <ToggleGroup.Root type="multiple" class="menu select-none p-2">
        <ToggleGroup.Item el={boldButton} value="bold" class="h-auto w-auto p-2">
          <button bind:this={boldButton} data-state={editor.isActive("bold")} on:click={() => editor.chain().focus().toggleBold().run()}> <Bold class="h-4 w-4" /> </button>
        </ToggleGroup.Item>
        <ToggleGroup.Item value="italic" class="h-auto w-auto p-2">
          <button data-state={editor.isActive("italic")} on:click={() => editor.chain().focus().toggleItalic().run()}> <Italic class="h-4 w-4" /> </button>
        </ToggleGroup.Item>
        <ToggleGroup.Item value="underline" class="h-auto w-auto p-2">
          <button data-state={editor.isActive("underline")} on:click={() => editor.chain().focus().toggleUnderline().run()}> <Underline class="h-4 w-4" /> </button>
        </ToggleGroup.Item>
        <ToggleGroup.Item value="strike" class="h-auto w-auto p-2">
          <button data-state={editor.isActive("strike")} on:click={() => editor.chain().focus().toggleStrike().run()}> <Strikethrough class="h-4 w-4" /> </button>
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </div>
  {/if}
</div>

<div class="min-h relative h-full min-h-12 w-full rounded-[30px] border-2 border-accent bg-accent" bind:this={element}>
  {#if editor}
    <div class="absolute bottom-1/2 right-2 flex translate-y-1/2 items-center" class:!bottom-1={editor.$doc.content.childCount > 2} class:!translate-y-0={editor.$doc.content.childCount > 2}>
      <div class="flex items-center transition-all duration-300" class:translate-x-8={editor.storage.characterCount.characters() == 0} class:delay-150={editor.storage.characterCount.characters() == 0}>
        <p class="text-xs text-ring">{editor.storage.characterCount.characters()}/1000</p>
        <Button
          variant="ghost"
          class="h-4 p-2 text-ring"
          disabled={image.awaitingImage}
          on:click={() => {
            imageAlert = true;
            image.awaitingImage = true;
          }}>
          <Image class="h-4 w-4" />
        </Button>
      </div>

      <Button variant="ghost" class="h-auto overflow-hidden p-0 transition-opacity duration-300 data-[show=false]:pointer-events-none data-[show=false]:opacity-0 data-[show=true]:opacity-100 data-[show=true]:delay-150" data-show={editor.storage.characterCount.characters() ? true : false} on:click={emitSendMessage}>
        <ArrowUp class="relative z-10 h-6 w-6 rounded-full bg-blue-500 text-white transition-all duration-300" />
      </Button>
    </div>
  {:else}
    <div class="relative h-full min-h-12 w-full cursor-not-allowed select-none">
      <div data-placeholder="Loading..." class="is-empty before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2 before:opacity-50 before:content-[attr(data-placeholder)]" />
      <div class=" absolute bottom-1/2 right-2 flex translate-y-1/2 items-center">
        <div class="flex translate-x-2 items-center transition-all duration-300">
          <p class="text-xs text-ring">0/1000</p>
          <Button variant="ghost" class="h-4 p-2 text-ring" disabled={true}>
            <Image class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  {/if}
</div>

<AlertDialog.Root
  bind:open={imageAlert}
  onOpenChange={() => {
    image.awaitingImage = false;
    image.src = "";
  }}
  closeOnOutsideClick={true}
  closeOnEscape={true}
  openFocus="[data-image-input]">
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title
        >Insert Image
        <Tooltip.Root portal={null}>
          <Tooltip.Trigger><Info class="h-4 w-4" /></Tooltip.Trigger>
          <Tooltip.Content class="max-w-lg">
            <p>You may insert media from these sources:</p>
            <ul>
              <li>hypixel.net</li>
              <li>cleanshot.cloud</li>
              <li>imgur.com</li>
              <li>imgbb.com</li>
              <li>vgy.me</li>
              <li>gyazo.com</li>
              <li>prnt.sc</li>
              <li>prntscr.com</li>
              <li>tenor.com</li>
              <li>giphy.com</li>
              <li>gfycat.com</li>
              <li>discordapp.net</li>
              <li>discordapp.com</li>
              <li>discord.com</li>
              <li>minionah.com</li>
            </ul>
          </Tooltip.Content>
        </Tooltip.Root>
      </AlertDialog.Title>
      <AlertDialog.Description>
        <Input type="text" data-image-input class="border-2 border-transparent text-white focus:border-accent focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0" placeholder="Image URL" bind:value={image.src} />

        {#if image.src && regex.test(image.src)}
          <div class="relative z-0 flex h-full w-full items-center justify-center py-4" transition:slide={{ axis: "y", duration: 300 }}>
            <img src={image.src} alt="Preview" class="pointer-events-none mt-4 h-auto max-h-96 w-full max-w-lg select-none rounded-lg object-cover" on:error={() => toast.error("The image could not be loaded")} />
          </div>
        {/if}
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        class="relative z-10"
        disabled={!image.src || !regex.test(image.src)}
        on:click={() => {
          if (!image.src) {
            toast.warning("The image url cannot be empty");
            return;
          }
          imageAlert = false;
          if (!regex.test(image.src)) {
            toast.warning("The image url is not from a valid source");
            return;
          }
          editor.chain().focus().setImage({ src: image.src }).run();
        }}>Insert</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
