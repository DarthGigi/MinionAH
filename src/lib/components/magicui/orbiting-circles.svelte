<script lang="ts">
  import { cn } from "$lib/utils";

  export let className: string = "";
  export let reverse: boolean = false;
  export let duration: number = 20;
  export let delay: number = 10;
  export let radius: number = 50;
  export let path: boolean = true;
</script>

{#if path}
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="pointer-events-none absolute inset-0 h-full w-full">
    <circle class="stroke-primary/10 stroke-1" cx="50%" cy="50%" r={radius} fill="none" stroke-dasharray={"4 4"} />
  </svg>
{/if}

<div style="--duration: {duration}; --delay: -{delay}; --radius: {radius};" class={cn("absolute flex h-full w-full transform-gpu animate-orbit items-center justify-center rounded-full border bg-black/50 [animation-delay:calc(var(--delay)*1000ms)]", { "[animation-direction:reverse]": reverse }, className)}>
  <slot />
</div>
