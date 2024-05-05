<script lang="ts">
  import { page } from "$app/stores";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import type { ComponentType } from "svelte";
  import { cubicInOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";

  let className: string | undefined | null = undefined;
  export let items: { href: string; title: string; icon: ComponentType }[];
  export { className as class };

  const [send, receive] = crossfade({
    duration: 300,
    easing: cubicInOut
  });
</script>

<nav class={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)}>
  {#each items as item}
    {@const isActive = $page.url.pathname === item.href}

    <Button href={item.href} variant="ghost" class={cn(!isActive && "hover:underline", "relative justify-start gap-2 hover:bg-transparent")} data-sveltekit-noscroll>
      {#if isActive}
        <div class="absolute inset-0 rounded-md bg-accent" in:send={{ key: "active-sidebar-tab" }} out:receive={{ key: "active-sidebar-tab" }} />
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
