<script lang="ts">
  import { page } from "$app/stores";
  import { Button } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import type { Seller } from "$lib/types";
  import { Trash2, Eye } from "lucide-svelte";
  import { createEventDispatcher, setContext } from "svelte";
  import { fade } from "svelte/transition";
  import MinionCopyButton from "../CopyButton.svelte";
  import CardItemMinion from "./card-item-minion.svelte";
  import CardItemUser from "./card-item-user.svelte";
  import CardMinionAmount from "./card-minion-amount.svelte";
  import CardMinionPrice from "./card-minion-price.svelte";
  import CardMinionTier from "./card-minion-tier.svelte";

  export let minion: Seller;
  setContext("minion", minion);

  const isHome = $page.url.pathname === "/";
  setContext("isHome", isHome);
  const isMinionPage = $page.url.pathname === `/` || $page.url.pathname === `/profile` || $page.url.pathname === `/${minion.user.username}`;
  setContext("isMinionPage", isMinionPage);
  let hovering = false;
  export let showButtons = true;

  const dispatch = createEventDispatcher();

  function openModal(minionID: string) {
    dispatch("openDeleteModal", {
      minion: minionID
    });
  }
</script>

<li in:fade|global={{ delay: 0 }} {...$$restProps} class="user-select-none relative list-item divide-y divide-neutral-700 rounded-lg bg-neutral-800 transition-all duration-300" class:group={isHome} class:hover:bg-neutral-900={isHome} on:mouseover={() => (hovering = true)} on:mouseout={() => (hovering = false)} on:blur={() => (hovering = false)} on:focus={() => (hovering = true)} role="listitem">
  <div class="flex w-full items-center justify-center gap-x-6 px-4">
    <CardItemMinion />
    {#if isHome}
      <CardItemUser />
    {/if}
  </div>

  <div class="-mt-px flex divide-x divide-neutral-700">
    <CardMinionTier />
    <CardMinionPrice bind:hovering />
    <CardMinionAmount />
  </div>
  {#if minion.hasInfusion}
    <Tooltip.Root>
      <Tooltip.Trigger class="absolute right-2 top-2 m-0 flex h-10 w-10 items-center justify-center rounded-lg !border-2 !border-black/30 bg-neutral-700 p-2 transition-all duration-300 group-hover:!border-black/0 group-hover:bg-neutral-900">
        <img class="pointer-events-none h-auto w-full" src="https://mc-heads.net/head/7e051df4dd2151481f5145b93fb7a9aa62888fbcb90add9890ad07caf1faca73" alt="Mithril Infusion" />
      </Tooltip.Trigger>
      <Tooltip.Content class="border-neutral-700 bg-neutral-900 text-neutral-200">
        <p>Mithril Infused</p>
      </Tooltip.Content>
    </Tooltip.Root>
  {/if}
  {#if showButtons}
    {#if $page.url.pathname === "/profile"}
      <Button class="group absolute left-12 top-2 h-auto rounded-lg !border-0 bg-neutral-700 p-1.5 text-sm text-neutral-400 transition-all duration-300 hover:bg-red-600 hover:text-red-200 focus:outline-none focus:ring-4 focus:ring-transparent group-hover:opacity-100" type="button" on:click={() => openModal(minion.id)} aria-label="Delete minion">
        <Trash2 class="h-5 w-5" />
      </Button>
    {/if}

    {#if isMinionPage}
      <MinionCopyButton
        class="absolute left-2 top-2"
        on:click={() => {
          // copy url to clipboard
          navigator.clipboard.writeText(`${window.location.protocol}/${window.location.host}/${minion.user.username}/${minion.id}/`);
        }} />

      <Button variant="link" href={`${minion.user.username}/${minion.id}`} class={`group absolute left-2 top-12 h-auto rounded-lg !border-0 bg-neutral-700 bg-opacity-0 p-1.5 text-sm text-neutral-400 transition-all duration-300 hover:bg-opacity-100 focus:outline-none focus:ring-4 focus:ring-transparent group-hover:opacity-100  ${isHome ? "opacity-0" : ""} ${!isHome ? "bg-opacity-100" : ""} `} aria-label="View {minion.user.username}'s {minion.minion.generator.replace(/_/g, ' ').toLowerCase().charAt(0) + minion.minion.generator.slice(1).toLowerCase().replace(/_/g, ' ')} minion">
        <Eye class="h-5 w-5 transition-colors duration-300 group-hover:text-white" />
      </Button>
    {/if}
  {/if}
</li>
