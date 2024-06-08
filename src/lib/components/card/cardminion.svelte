<script lang="ts">
  import { page } from "$app/stores";
  import { Button } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import type { Seller } from "$lib/types";
  import Eye from "lucide-svelte/icons/eye";
  import Trash2 from "lucide-svelte/icons/trash-2";
  import { createEventDispatcher, setContext } from "svelte";
  import { createHover } from "svelte-interactions";
  import { fade } from "svelte/transition";
  import CopyButton from "../CopyButton.svelte";
  import CardItemMinion from "./card-item-minion.svelte";
  import CardItemUser from "./card-item-user.svelte";
  import CardMinionAmount from "./card-minion-amount.svelte";
  import CardMinionPrice from "./card-minion-price.svelte";
  import CardMinionTier from "./card-minion-tier.svelte";

  export let showButtons = true;
  export let minion: Seller;
  setContext("minion", minion);

  const isHome = $page.url.pathname === "/";
  setContext("isHome", isHome);
  const isMinionPage = $page.url.pathname === `/` || $page.url.pathname === `/profile` || $page.url.pathname === `/user/${minion.user.username}`;
  setContext("isMinionPage", isMinionPage);

  const dispatch = createEventDispatcher();
  const { hoverAction, isHovered } = createHover();

  function openModal(minionID: string) {
    dispatch("openDeleteModal", {
      minion: minionID
    });
  }
</script>

<li role="listitem" {...$$restProps} class="user-select-none relative list-item divide-y divide-accent rounded-lg bg-background transition-all duration-300" class:group={isHome} class:hover:bg-muted={isHome} in:fade|global={{ delay: 0 }} use:hoverAction>
  <div class="flex w-full items-center justify-center gap-x-6 px-4">
    <CardItemMinion />
    {#if isHome}
      <CardItemUser />
    {/if}
  </div>

  <div class="flex divide-x divide-accent">
    <CardMinionTier />
    <CardMinionPrice bind:hovering={$isHovered} />
    <CardMinionAmount />
  </div>
  {#if isHome}
    <div class="flex h-10">
      <a href={`/user/${minion.user.username}/chat`} data-sveltekit-preload-data="off" class="relative flex h-full w-full items-center justify-center overflow-hidden rounded-b-lg font-medium text-primary transition-all duration-300">
        <div class="group peer relative z-10 flex h-full w-full min-w-0 flex-shrink-0 flex-nowrap items-center justify-center text-nowrap rounded-full px-2 py-0.5 text-xs font-medium text-primary transition-all duration-300 group-hover:scale-125 group-hover:text-muted">
          <div class="inline-block">Buy&nbsp;</div>
          <div class="inline-block w-0 max-w-fit flex-nowrap overflow-hidden text-nowrap transition-[width] duration-1000 group-hover:w-full">
            {minion.user.username}{#if minion.user.username.endsWith("s")}
              '
            {:else}
              's
            {/if}
            {minion.minion.generator.replace(/_/g, " ").toLowerCase().charAt(0) + minion.minion.generator.slice(1).toLowerCase().replace(/_/g, " ")} minion{#if minion.amount && minion.amount > 1}s{/if}
          </div>
        </div>
        <div class="absolute top-0 z-0 h-0 w-full flex-shrink-0 bg-muted-foreground transition-all duration-500 group-hover:h-full peer-hover:top-1/2 peer-hover:h-3/4 peer-hover:w-[95%] peer-hover:-translate-y-1/2 peer-hover:rounded-lg"></div>
      </a>
    </div>
  {/if}
  {#if minion.hasInfusion}
    <Tooltip.Root openDelay={100} closeDelay={0}>
      <Tooltip.Trigger class="absolute right-2 top-2 m-0 flex items-center justify-center rounded-lg !border-0 bg-accent p-1.5 transition-all duration-300 group-hover:bg-opacity-0">
        <img class="pointer-events-none h-full w-5" src="/assets/images/mithril.png" alt="Mithril Infusion" />
      </Tooltip.Trigger>
      <Tooltip.Content class="border-border bg-popover text-popover-foreground">
        <p>Mithril Infused</p>
      </Tooltip.Content>
    </Tooltip.Root>
  {/if}
  {#if showButtons}
    {#if $page.url.pathname === "/profile"}
      <Button class="group absolute left-12 top-2 h-auto rounded-lg !border-0 bg-accent p-1.5 text-sm text-muted-foreground transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground focus:outline-none focus:ring-4 focus:ring-transparent group-hover:opacity-100" type="button" on:click={() => openModal(minion.id)} aria-label="Delete minion">
        <Trash2 class="h-5 w-5" />
      </Button>
    {/if}

    {#if isMinionPage}
      <CopyButton
        class="absolute left-2 top-2"
        on:click={() => {
          // copy url to clipboard
          navigator.clipboard.writeText(`${window.location.origin}/user/${minion.user.username}/${minion.id}`);
        }} />

      <Button variant="link" href={`/user/${minion.user.username}/${minion.id}`} class={`group absolute left-2 top-12 h-auto rounded-lg !border-0 bg-accent bg-opacity-0 p-1.5 text-sm text-muted-foreground transition-all duration-300 hover:bg-accent hover:bg-opacity-100 hover:opacity-100 focus:outline-none focus:ring-0 focus:ring-transparent group-hover:opacity-100 ${isHome ? "opacity-0" : "bg-opacity-100"}`} aria-label="View {minion.user.username}'s {minion.minion.generator.replace(/_/g, ' ').toLowerCase().charAt(0) + minion.minion.generator.slice(1).toLowerCase().replace(/_/g, ' ')} minion">
        <Eye class="h-5 w-5 transition-colors duration-300 group-hover:text-white" />
      </Button>
    {/if}
  {/if}
</li>
