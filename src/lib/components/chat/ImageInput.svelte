<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import type { Editor as EditorType } from "@tiptap/core";
  import { toast } from "svelte-sonner";

  export let editor: EditorType;

  const regex = new RegExp("^https://", "i");

  let value: string;
</script>

<div class="flex w-full flex-grow items-center justify-between">
  <Input type="text" class="border-2 border-accent focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0" placeholder="Image URL" bind:value />
  <Button
    class=""
    on:click={() => {
      if (!value) return;
      if (!regex.test(value)) {
        toast.warning("The URL must start with https://", {});
        return;
      }
      editor.chain().focus().setImage({ src: value }).run();
    }}>Insert</Button>
</div>
