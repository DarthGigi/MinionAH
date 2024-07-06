<script lang="ts">
  import { cn } from "$lib/utils";
  import { type Variants, AnimatePresence, M } from "svelte-motion";

  export let text: string;
  export let duration: number = 0.5;
  export let delayMultiple: number = 0.04;
  export let framerProps: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };
  let className: string = "";
  export { className as class };
</script>

<div class="flex justify-center space-x-1">
  <AnimatePresence show={true}>
    {#each text.split("") as char, i}
      <M.span key={i} initial="hidden" animate="visible" exit="hidden" variants={framerProps} transition={{ duration, delay: i * delayMultiple }} class={cn("drop-shadow-sm ", className)}>
        {#if char === " "}
          <span>&nbsp;</span>
        {:else}
          {char}
        {/if}
      </M.span>
    {/each}
  </AnimatePresence>
</div>
