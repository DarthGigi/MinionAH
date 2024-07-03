<script lang="ts">
  import { page } from "$app/stores";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import type { ComponentType } from "svelte";
  import { cubicInOut } from "svelte/easing";
  import { crossfade, scale } from "svelte/transition";

  let className: string | undefined | null = undefined;
  export let items: { href: string; title: string; icon: ComponentType }[];
  export { className as class };

  const [send, receive] = crossfade({
    duration: 300,
    easing: cubicInOut
  });
</script>

<nav class={cn("flex w-full flex-wrap items-center justify-center gap-2", className)}>
  {#each items as item}
    {@const isActive = $page.url.pathname === item.href}

    <Button href={item.href} variant="ghost" class={cn(!isActive && "hover:underline", "relative w-full max-w-40 justify-center gap-2 hover:bg-transparent")} data-sveltekit-noscroll>
      {#if isActive}
        <div class="absolute inset-0 rounded-md bg-accent" in:send={{ key: "active-sidebar-tab" }} out:receive={{ key: "active-sidebar-tab" }}></div>
      {:else}
        <div class="absolute inset-0 rounded-md bg-background" in:scale={{ delay: 300, duration: 700, start: 0.8 }} out:scale={{ duration: 700 }}></div>
      {/if}
      <div class="relative">
        <svelte:component this={item.icon} class="size-5" />
      </div>
      <div class="relative">
        {item.title}
      </div>
    </Button>
  {/each}
</nav>
